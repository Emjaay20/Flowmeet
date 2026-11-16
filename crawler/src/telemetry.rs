use parking_lot::RwLock;
use std::collections::HashMap;
use std::sync::atomic::{AtomicI64, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Instant;

/// Standard latency buckets for HTTP scraping in milliseconds.
const SCRAPE_BUCKETS: &[u64] = &[25, 50, 100, 250, 500, 1000, 2500, 5000];

/// Prometheus telemetry with atomic counters and locked label maps.
#[derive(Debug, Default)]
pub struct TelemetryRegistry {
    // In-flight active requests gauge
    pub active_requests: AtomicI64,

    // Counters
    scrape_requests_total: RwLock<HashMap<(String, u16), AtomicU64>>,
    policy_evaluations_total: RwLock<HashMap<(String, String), AtomicU64>>,

    // Scrape duration histogram (bucket limit -> count)
    scrape_duration_buckets: RwLock<HashMap<u64, AtomicU64>>,
    scrape_duration_sum_ms: AtomicU64,
    scrape_duration_count: AtomicU64,

    // Policy evaluation latency tracker in nanoseconds
    policy_eval_nanos_sum: AtomicU64,
    policy_eval_count: AtomicU64,
}

pub struct ActiveRequest(pub Arc<TelemetryRegistry>);
impl ActiveRequest {
    pub fn start(registry: Arc<TelemetryRegistry>) -> Self {
        registry.active_requests.fetch_add(1, Ordering::Relaxed);
        Self(registry)
    }
}
impl Drop for ActiveRequest {
    fn drop(&mut self) {
        self.0.active_requests.fetch_sub(1, Ordering::Relaxed);
    }
}

impl TelemetryRegistry {
    pub fn new() -> Arc<Self> {
        let registry = Self::default();

        // Initialize default histogram buckets
        {
            let mut buckets = registry.scrape_duration_buckets.write();
            for &b in SCRAPE_BUCKETS {
                buckets.insert(b, AtomicU64::new(0));
            }
        }

        Arc::new(registry)
    }

    /// Record a finished HTTP request.
    pub fn record_http_request(&self, endpoint: &str, status: u16, duration_ms: u64) {
        // Increment request counter
        {
            let map = self.scrape_requests_total.read();
            let key = (endpoint.to_string(), status);
            if let Some(counter) = map.get(&key) {
                counter.fetch_add(1, Ordering::Relaxed);
            } else {
                drop(map);
                let mut write_map = self.scrape_requests_total.write();
                write_map
                    .entry(key)
                    .or_insert_with(|| AtomicU64::new(0))
                    .fetch_add(1, Ordering::Relaxed);
            }
        }

        // Record histogram
        self.scrape_duration_sum_ms
            .fetch_add(duration_ms, Ordering::Relaxed);
        self.scrape_duration_count.fetch_add(1, Ordering::Relaxed);

        let buckets = self.scrape_duration_buckets.read();
        for &bucket in SCRAPE_BUCKETS {
            if duration_ms <= bucket {
                if let Some(counter) = buckets.get(&bucket) {
                    counter.fetch_add(1, Ordering::Relaxed);
                }
            }
        }
    }

    /// Record a policy evaluation event.
    pub fn record_policy_eval(&self, action: &str, effect: &str, duration_nanos: u64) {
        self.policy_eval_nanos_sum
            .fetch_add(duration_nanos, Ordering::Relaxed);
        self.policy_eval_count.fetch_add(1, Ordering::Relaxed);

        let map = self.policy_evaluations_total.read();
        let key = (action.to_string(), effect.to_string());
        if let Some(counter) = map.get(&key) {
            counter.fetch_add(1, Ordering::Relaxed);
        } else {
            drop(map);
            let mut write_map = self.policy_evaluations_total.write();
            write_map
                .entry(key)
                .or_insert_with(|| AtomicU64::new(0))
                .fetch_add(1, Ordering::Relaxed);
        }
    }

    /// Formats all collected metrics into Prometheus 0.0.4 text format.
    pub fn render_prometheus(&self) -> String {
        let mut out = String::with_capacity(4096);

        out.push_str("# HELP flowmeet_crawler_active_requests Current in-flight requests\n");
        out.push_str("# TYPE flowmeet_crawler_active_requests gauge\n");
        out.push_str(&format!(
            "flowmeet_crawler_active_requests {}\n\n",
            self.active_requests.load(Ordering::Relaxed)
        ));

        out.push_str("# HELP flowmeet_crawler_requests_total Total HTTP requests processed\n");
        out.push_str("# TYPE flowmeet_crawler_requests_total counter\n");
        {
            let map = self.scrape_requests_total.read();
            for ((endpoint, status), count) in map.iter() {
                out.push_str(&format!(
                    "flowmeet_crawler_requests_total{{endpoint=\"{}\",status=\"{}\"}} {}\n",
                    endpoint,
                    status,
                    count.load(Ordering::Relaxed)
                ));
            }
        }
        out.push('\n');

        out.push_str("# HELP flowmeet_policy_evaluations_total Total authorization checks\n");
        out.push_str("# TYPE flowmeet_policy_evaluations_total counter\n");
        {
            let map = self.policy_evaluations_total.read();
            for ((action, effect), count) in map.iter() {
                out.push_str(&format!(
                    "flowmeet_policy_evaluations_total{{action=\"{}\",effect=\"{}\"}} {}\n",
                    action,
                    effect,
                    count.load(Ordering::Relaxed)
                ));
            }
        }
        out.push('\n');

        out.push_str(
            "# HELP flowmeet_scrape_duration_ms Scrape execution latency in milliseconds\n",
        );
        out.push_str("# TYPE flowmeet_scrape_duration_ms histogram\n");
        {
            let buckets = self.scrape_duration_buckets.read();
            let mut cumulative = 0u64;
            for &b in SCRAPE_BUCKETS {
                if let Some(counter) = buckets.get(&b) {
                    cumulative += counter.load(Ordering::Relaxed);
                    out.push_str(&format!(
                        "flowmeet_scrape_duration_ms_bucket{{le=\"{}\"}} {}\n",
                        b, cumulative
                    ));
                }
            }
            let total_count = self.scrape_duration_count.load(Ordering::Relaxed);
            out.push_str(&format!(
                "flowmeet_scrape_duration_ms_bucket{{le=\"+Inf\"}} {}\n",
                total_count
            ));
            out.push_str(&format!(
                "flowmeet_scrape_duration_ms_sum {}\n",
                self.scrape_duration_sum_ms.load(Ordering::Relaxed)
            ));
            out.push_str(&format!(
                "flowmeet_scrape_duration_ms_count {}\n\n",
                total_count
            ));
        }

        out.push_str(
            "# HELP flowmeet_policy_eval_nanoseconds Policy evaluation latency in nanoseconds\n",
        );
        out.push_str("# TYPE flowmeet_policy_eval_nanoseconds summary\n");
        out.push_str(&format!(
            "flowmeet_policy_eval_nanoseconds_count {}\n",
            self.policy_eval_count.load(Ordering::Relaxed)
        ));
        out.push_str(&format!(
            "flowmeet_policy_eval_nanoseconds_sum {}\n",
            self.policy_eval_nanos_sum.load(Ordering::Relaxed)
        ));

        out
    }
}

/// Helper to measure task execution time with sub-nanosecond precision.
pub struct ScopedTimer {
    start: Instant,
}

impl ScopedTimer {
    pub fn start() -> Self {
        Self {
            start: Instant::now(),
        }
    }

    pub fn elapsed_millis(&self) -> u64 {
        self.start.elapsed().as_millis() as u64
    }

    pub fn elapsed_nanos(&self) -> u64 {
        self.start.elapsed().as_nanos() as u64
    }
}

/// W3C Distributed TraceContext helper (`traceparent` header parsing & generation).
/// Format: `version(2)-trace_id(32)-parent_id(16)-trace_flags(2)`
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct W3cTraceContext {
    pub trace_id: String,
    pub parent_id: String,
    pub sampled: bool,
}

impl W3cTraceContext {
    /// Parse from incoming HTTP header or generate fresh root trace.
    pub fn from_header_or_generate(header: Option<&str>) -> Self {
        if let Some(h) = header {
            let parts: Vec<&str> = h.split('-').collect();
            if parts.len() == 4
                && parts[0] == "00"
                && parts[1].len() == 32
                && parts[2].len() == 16
                && parts[3].len() == 2
                && parts[1..].iter().all(|p| {
                    p.bytes()
                        .all(|b| b.is_ascii_hexdigit() && !b.is_ascii_uppercase())
                })
                && parts[1].bytes().any(|b| b != b'0')
                && parts[2].bytes().any(|b| b != b'0')
            {
                return Self {
                    trace_id: parts[1].to_string(),
                    parent_id: parts[2].to_string(),
                    sampled: u8::from_str_radix(parts[3], 16).unwrap_or(0) & 1 == 1,
                };
            }
        }

        let trace_id = uuid::Uuid::new_v4().simple().to_string();
        let parent_id = uuid::Uuid::new_v4().simple().to_string()[..16].to_string();

        Self {
            trace_id,
            parent_id,
            sampled: true,
        }
    }

    /// Format for W3C outgoing HTTP header.
    pub fn to_header_value(&self) -> String {
        format!(
            "00-{}-{}-{}",
            self.trace_id,
            self.parent_id,
            if self.sampled { "01" } else { "00" }
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn active_request_gauge_recovers_when_scope_exits() {
        let registry = TelemetryRegistry::new();
        {
            let _active = ActiveRequest::start(registry.clone());
            assert_eq!(registry.active_requests.load(Ordering::Relaxed), 1);
        }
        assert_eq!(registry.active_requests.load(Ordering::Relaxed), 0);
    }

    #[test]
    fn invalid_trace_ids_are_replaced_and_roots_are_unique() {
        let a = W3cTraceContext::from_header_or_generate(Some(
            "00-00000000000000000000000000000000-0000000000000000-01",
        ));
        let b = W3cTraceContext::from_header_or_generate(None);
        assert_ne!(a.trace_id, "00000000000000000000000000000000");
        assert_ne!(a.trace_id, b.trace_id);
    }

    #[test]
    fn test_telemetry_registry_rendering() {
        let registry = TelemetryRegistry::new();
        registry.active_requests.store(3, Ordering::Relaxed);
        registry.record_http_request("/scrape", 200, 142);
        registry.record_http_request("/scrape", 200, 85);
        registry.record_policy_eval("crawler:scrape", "allow", 450);

        let rendered = registry.render_prometheus();
        assert!(rendered.contains("flowmeet_crawler_active_requests 3"));
        assert!(rendered
            .contains("flowmeet_crawler_requests_total{endpoint=\"/scrape\",status=\"200\"} 2"));
        assert!(rendered.contains(
            "flowmeet_policy_evaluations_total{action=\"crawler:scrape\",effect=\"allow\"} 1"
        ));
        assert!(rendered.contains("flowmeet_scrape_duration_ms_count 2"));
        assert!(rendered.contains("flowmeet_policy_eval_nanoseconds_count 1"));
    }

    #[test]
    fn test_w3c_traceparent_roundtrip() {
        let original = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";
        let ctx = W3cTraceContext::from_header_or_generate(Some(original));
        assert_eq!(ctx.trace_id, "4bf92f3577b34da6a3ce929d0e0e4736");
        assert_eq!(ctx.parent_id, "00f067aa0ba902b7");
        assert!(ctx.sampled);
        assert_eq!(ctx.to_header_value(), original);
    }
}

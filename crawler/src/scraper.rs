use crate::signals::{analyze_signals, FirmographicSignals};
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use std::net::IpAddr;
use std::time::Instant;

#[derive(Debug, Deserialize)]
pub struct ScrapeRequest {
    pub url: String,
    pub max_tokens: Option<usize>,
}

#[derive(Debug, Serialize)]
pub struct ScrapeResponse {
    pub status: u16,
    pub url: String,
    pub execution_time_ms: u128,
    pub bytes_fetched: usize,
    pub page_title: String,
    pub meta_description: String,
    pub llm_markdown: String,
    pub firmographic_signals: FirmographicSignals,
}

fn is_public_ip(ip: &IpAddr) -> bool {
    match ip {
        IpAddr::V4(v4) => {
            !(v4.is_loopback()
                || v4.is_private()
                || v4.is_link_local()
                || v4.is_unspecified()
                || v4.is_broadcast()
                || v4.is_documentation())
        }
        IpAddr::V6(v6) => {
            let seg0 = v6.segments()[0];
            !(v6.is_loopback()
                || v6.is_unspecified()
                || (seg0 & 0xfe00) == 0xfc00 // unique local
                || (seg0 & 0xffc0) == 0xfe80) // link local
        }
    }
}

/// A host is acceptable when it is a dotted name that is not an IP literal or
/// a local-looking name. This is checked for redirects.
fn is_plain_public_name(host: &str) -> bool {
    let h = host.to_ascii_lowercase();
    h.contains('.')
        && h.parse::<IpAddr>().is_err()
        && !h.ends_with(".local")
        && !h.ends_with(".internal")
        && h != "localhost"
}

/// Refuses to fetch anything that resolves to a private or loopback address,
/// so the crawler cannot be pointed at other containers or the host network.
async fn ensure_public(target_url: &str) -> Result<(), String> {
    let url = reqwest::Url::parse(target_url).map_err(|e| format!("invalid URL: {e}"))?;
    let host = url.host_str().ok_or("URL has no host")?.to_string();
    if !is_plain_public_name(&host) {
        return Err(format!("{host} is not a public hostname"));
    }
    let port = url.port_or_known_default().unwrap_or(443);
    let lookup = tokio::time::timeout(
        std::time::Duration::from_secs(4),
        tokio::net::lookup_host((host.as_str(), port)),
    )
    .await
    .map_err(|_| format!("DNS lookup for {host} timed out"))?;
    let addrs = lookup.map_err(|e| format!("could not resolve {host}: {e}"))?;
    let mut any = false;
    for addr in addrs {
        any = true;
        if !is_public_ip(&addr.ip()) {
            return Err(format!("{host} resolves to a non-public address"));
        }
    }
    if any { Ok(()) } else { Err(format!("{host} did not resolve")) }
}

/// Fetches a page over plain HTTP and converts it to Markdown. There is no
/// headless browser, so pages that render their content with JavaScript come
/// back thin. Any fetch failure is returned as an error; nothing is invented.
pub async fn perform_scrape(req: ScrapeRequest) -> Result<ScrapeResponse, String> {
    let start_time = Instant::now();
    let target_url = if req.url.starts_with("http://") || req.url.starts_with("https://") {
        req.url.clone()
    } else {
        format!("https://{}", req.url)
    };

    ensure_public(&target_url).await?;

    let redirects = reqwest::redirect::Policy::custom(|attempt| {
        let ok = attempt.url().host_str().map(is_plain_public_name).unwrap_or(false);
        if attempt.previous().len() >= 3 || !ok {
            attempt.stop()
        } else {
            attempt.follow()
        }
    });

    let client = reqwest::Client::builder()
        .redirect(redirects)
        .timeout(std::time::Duration::from_secs(8))
        .user_agent("Flowmeet-Crawler/2.0")
        .build()
        .map_err(|e| format!("could not build HTTP client: {e}"))?;

    let resp = client
        .get(&target_url)
        .send()
        .await
        .map_err(|e| format!("fetch failed: {e}"))?;

    let status_code = resp.status().as_u16();
    if !resp.status().is_success() {
        return Err(format!("{target_url} returned HTTP {status_code}"));
    }

    let html_content = resp
        .text()
        .await
        .map_err(|e| format!("could not read response body: {e}"))?;
    let bytes_fetched = html_content.len();

    let document = Html::parse_document(&html_content);

    let title_selector = Selector::parse("title").unwrap();
    let page_title = document
        .select(&title_selector)
        .next()
        .map(|el| el.text().collect::<Vec<_>>().join(" ").trim().to_string())
        .unwrap_or_default();

    let meta_selector =
        Selector::parse("meta[name='description'], meta[property='og:description']").unwrap();
    let meta_description = document
        .select(&meta_selector)
        .next()
        .and_then(|el| el.value().attr("content"))
        .map(|s| s.to_string())
        .unwrap_or_default();

    let mut llm_markdown = html2md::parse_html(&html_content);

    // max_tokens is approximate: four characters per token.
    let max_chars = req.max_tokens.unwrap_or(4096) * 4;
    if llm_markdown.chars().count() > max_chars {
        llm_markdown = llm_markdown.chars().take(max_chars).collect::<String>();
        llm_markdown.push_str("\n[truncated]");
    }

    let firmographic_signals = analyze_signals(&target_url, &html_content, &llm_markdown);

    Ok(ScrapeResponse {
        status: status_code,
        url: target_url,
        execution_time_ms: start_time.elapsed().as_millis(),
        bytes_fetched,
        page_title,
        meta_description,
        llm_markdown,
        firmographic_signals,
    })
}

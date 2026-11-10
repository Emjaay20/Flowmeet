use regex::Regex;
use serde::{Deserialize, Serialize};

/// Keyword-based signals pulled from a page's HTML and text. These are
/// heuristics: a match means the keyword appears on the page, not that the
/// company runs that technology or holds that certification.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FirmographicSignals {
    pub estimated_size_tier: String,
    pub detected_tech_stack: Vec<String>,
    pub enterprise_indicators: Vec<String>,
    pub intent_score: u8,
    pub estimated_llm_tokens: usize,
}

const TECH_PATTERNS: &[(&str, &str)] = &[
    ("Next.js", r"next\.js|/_next/|__next_data__"),
    ("React", r"\breact\b"),
    ("Kubernetes", r"\bkubernetes\b|\bk8s\b"),
    ("Docker", r"\bdocker\b"),
    ("Stripe", r"js\.stripe\.com|\bstripe\b"),
    ("Snowflake", r"\bsnowflake\b"),
    ("Salesforce", r"\bsalesforce\b|force\.com"),
    ("HubSpot", r"\bhubspot\b|hs-scripts"),
    ("Supabase", r"\bsupabase\b"),
    ("AWS", r"\baws\b|cloudfront"),
    ("Cloudflare", r"\bcloudflare\b"),
    ("Rust", r"\brust\b|\bwebassembly\b"),
    ("Go", r"\bgolang\b"),
    ("Python", r"\bpython\b|\bpytorch\b|\btensorflow\b"),
];

const INDICATOR_PATTERNS: &[(&str, &str)] = &[
    ("Mentions SOC 2 / ISO 27001 / GDPR", r"soc ?2|iso 27001|\bgdpr\b"),
    ("Mentions SSO / SAML", r"\bsso\b|\bsaml\b|\bokta\b|azure ad"),
    ("Mentions SLA or dedicated support", r"\bsla\b|99\.9+% uptime|24/7 support|dedicated account manager"),
    ("Mentions contact-sales pricing", r"contact sales|custom pricing|enterprise plan"),
];

pub fn analyze_signals(_url: &str, html_content: &str, markdown_text: &str) -> FirmographicSignals {
    let haystack = format!("{} {}", html_content.to_lowercase(), markdown_text.to_lowercase());

    let matches = |table: &[(&str, &str)]| -> Vec<String> {
        table
            .iter()
            .filter(|(_, pattern)| Regex::new(pattern).map(|re| re.is_match(&haystack)).unwrap_or(false))
            .map(|(name, _)| name.to_string())
            .collect()
    };

    let detected_tech_stack = matches(TECH_PATTERNS);
    let enterprise_indicators = matches(INDICATOR_PATTERNS);

    // Rough size guess from how many enterprise keywords the page uses.
    let estimated_size_tier = match enterprise_indicators.len() {
        0 => "Unknown",
        1 | 2 => "Mid-market (guess)",
        _ => "Enterprise (guess)",
    }
    .to_string();

    let mut score: u16 = 40;
    score += (detected_tech_stack.len() as u16) * 6;
    score += (enterprise_indicators.len() as u16) * 12;
    let intent_score = score.min(99) as u8;

    FirmographicSignals {
        estimated_size_tier,
        detected_tech_stack,
        enterprise_indicators,
        intent_score,
        estimated_llm_tokens: (markdown_text.len() / 4).max(1),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keywords_match_whole_words_only() {
        // "trust" contains "rust", "storage" contains "rag", "translate" contains "sla".
        let s = analyze_signals("", "", "we build trust, storage and translate things");
        assert!(s.detected_tech_stack.is_empty(), "{:?}", s.detected_tech_stack);
        assert!(s.enterprise_indicators.is_empty(), "{:?}", s.enterprise_indicators);
        assert_eq!(s.estimated_size_tier, "Unknown");
    }

    #[test]
    fn real_mentions_are_detected() {
        let s = analyze_signals("", "<script src=\"/_next/x.js\">", "Built with Docker and Stripe. SOC 2 report and SAML SSO available.");
        assert!(s.detected_tech_stack.contains(&"Next.js".to_string()));
        assert!(s.detected_tech_stack.contains(&"Docker".to_string()));
        assert!(s.detected_tech_stack.contains(&"Stripe".to_string()));
        assert_eq!(s.enterprise_indicators.len(), 2);
    }
}

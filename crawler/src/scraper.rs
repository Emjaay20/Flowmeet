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

const MAX_BODY_BYTES: usize = 2 * 1024 * 1024;

fn is_public_ip(ip: &IpAddr) -> bool {
    match ip {
        IpAddr::V4(v) => {
            let [a, b, _, _] = v.octets();
            !(v.is_private()
                || v.is_loopback()
                || v.is_link_local()
                || v.is_unspecified()
                || v.is_broadcast()
                || v.is_documentation()
                || a == 0
                || a >= 224
                || (a == 100 && (64..=127).contains(&b))
                || (a == 198 && (b == 18 || b == 19))
                || (a == 192 && b == 0))
        }
        IpAddr::V6(v) => {
            (v.segments()[0] & 0xe000) == 0x2000
                && !(v.segments()[0] == 0x2001 && v.segments()[1] <= 0x1ff)
                && !(v.segments()[0] == 0x2001 && v.segments()[1] == 0xdb8)
                && v.segments()[0] != 0x2002
                && !(v.segments()[0] == 0x3fff && v.segments()[1] < 0x1000)
        }
    }
}

fn validate_url(url: &reqwest::Url) -> Result<(), String> {
    let host = url
        .host_str()
        .ok_or("URL has no host")?
        .to_ascii_lowercase();
    if !matches!(url.scheme(), "http" | "https")
        || !url.username().is_empty()
        || url.password().is_some()
        || !matches!(url.port_or_known_default(), Some(80 | 443))
        || host.parse::<IpAddr>().is_ok()
        || !host.contains('.')
        || host.ends_with('.')
        || host.ends_with(".local")
        || host.ends_with(".internal")
        || host.ends_with(".localhost")
    {
        return Err("Only public HTTP(S) hostnames on ports 80/443 are allowed".into());
    }
    Ok(())
}

/// Pin each connection to validated DNS addresses. Revalidate every redirect.
async fn fetch_public(mut url: reqwest::Url) -> Result<String, String> {
    for hop in 0..=3 {
        validate_url(&url)?;
        let host = url.host_str().unwrap().to_string();
        let addrs: Vec<_> = tokio::time::timeout(
            std::time::Duration::from_secs(3),
            tokio::net::lookup_host((host.as_str(), url.port_or_known_default().unwrap())),
        )
        .await
        .map_err(|_| "DNS lookup timed out")?
        .map_err(|e| format!("DNS lookup failed: {e}"))?
        .collect();
        if addrs.is_empty() || addrs.iter().any(|a| !is_public_ip(&a.ip())) {
            return Err("Target resolves to a non-public address".into());
        }
        let client = reqwest::Client::builder()
            .no_proxy()
            .resolve_to_addrs(&host, &addrs)
            .redirect(reqwest::redirect::Policy::none())
            .timeout(std::time::Duration::from_secs(8))
            .user_agent("Flowmeet-Crawler/3.0")
            .build()
            .map_err(|e| e.to_string())?;
        let mut response = client
            .get(url.clone())
            .send()
            .await
            .map_err(|e| e.to_string())?;
        if response.status().is_redirection() {
            if hop == 3 {
                return Err("Too many redirects".into());
            }
            let next = response
                .headers()
                .get(reqwest::header::LOCATION)
                .ok_or("Redirect has no Location")?
                .to_str()
                .map_err(|_| "Invalid redirect")?;
            url = url.join(next).map_err(|_| "Invalid redirect URL")?;
            continue;
        }
        if !response.status().is_success() {
            return Err(format!("Target returned HTTP {}", response.status()));
        }
        if response.content_length().unwrap_or(0) > MAX_BODY_BYTES as u64 {
            return Err("Page exceeds 2 MiB limit".into());
        }
        let mut body = Vec::new();
        while let Some(chunk) = response.chunk().await.map_err(|e| e.to_string())? {
            if body.len() + chunk.len() > MAX_BODY_BYTES {
                return Err("Page exceeds 2 MiB limit".into());
            }
            body.extend_from_slice(&chunk);
        }
        return Ok(String::from_utf8_lossy(&body).into_owned());
    }
    Err("Too many redirects".into())
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

    let url = reqwest::Url::parse(&target_url).map_err(|e| format!("Invalid URL: {e}"))?;
    let html_content = tokio::time::timeout(std::time::Duration::from_secs(10), fetch_public(url))
        .await
        .map_err(|_| "Page read exceeded 10 seconds")??;
    let status_code = 200;
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
    let max_chars = req.max_tokens.unwrap_or(4096).clamp(1, 8192) * 4;
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

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn blocks_non_public_addresses() {
        for ip in [
            "127.0.0.1",
            "10.0.0.1",
            "169.254.169.254",
            "100.64.0.1",
            "198.18.0.1",
            "224.0.0.1",
            "240.0.0.1",
            "::1",
            "::ffff:127.0.0.1",
            "fd00::1",
            "fe80::1",
            "2001:db8::1",
            "2002:7f00:1::",
            "3fff::1",
        ] {
            assert!(!is_public_ip(&ip.parse().unwrap()), "{ip}");
        }
        assert!(is_public_ip(&"1.1.1.1".parse().unwrap()));
        assert!(is_public_ip(&"2606:4700:4700::1111".parse().unwrap()));
    }
    #[test]
    fn validates_initial_and_redirect_urls() {
        for url in [
            "http://127.0.0.1",
            "http://localhost",
            "http://app.internal",
            "http://app.local",
            "https://user:password@example.com",
            "ftp://example.com",
            "http://example.com:8080",
            "http://example.com.",
        ] {
            assert!(
                validate_url(&reqwest::Url::parse(url).unwrap()).is_err(),
                "{url}"
            );
        }
        assert!(validate_url(&reqwest::Url::parse("https://example.com/docs").unwrap()).is_ok());
    }
}

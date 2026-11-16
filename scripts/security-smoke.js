// Run inside the gateway container: uses configured credentials without printing them.
const crawler = process.env.RUST_CRAWLER_URL;
async function call(path, headers, body) {
    return fetch(crawler + path, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(12000) });
}
const payload = { url: "example.com", markdown: "Rust and Kubernetes" };
(async () => {
    const anonymous = await call("/analyze", {}, payload);
    if (anonymous.status !== 401) throw new Error(`Anonymous request: ${anonymous.status}`);
    const spoofed = await call("/analyze", { "x-subject-roles": "platform_admin", "x-internal-mesh": "true" }, payload);
    if (spoofed.status !== 401) throw new Error(`Spoofed identity: ${spoofed.status}`);
    const auth = { Authorization: `Bearer ${process.env.FLOWMEET_SERVICE_TOKEN}` };
    const verified = await call("/analyze", auth, payload);
    if (verified.status !== 200) throw new Error(`Authenticated analysis: ${verified.status}`);
    for (const target of ["http://127.0.0.1", "http://169.254.169.254", "http://flowmeet-web:3000", "http://[::ffff:127.0.0.1]"]) {
        const response = await call("/scrape", auth, { url: target });
        if (![403, 502].includes(response.status)) throw new Error(`Unsafe target was not blocked: ${response.status}`);
    }
    const webhook = await fetch(process.env.N8N_INTERNAL_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "demo@stripe.com" }), signal: AbortSignal.timeout(5000) });
    if (![401, 403].includes(webhook.status)) throw new Error(`n8n anonymous webhook: ${webhook.status}`);
    console.log("PASS anonymous and spoofed identities rejected; authenticated analysis works; private network targets blocked; n8n webhook requires authentication");
})().catch(error => { console.error(error.message); process.exitCode = 1; });

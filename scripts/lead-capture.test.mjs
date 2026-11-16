import test from "node:test";
import assert from "node:assert/strict";
import { stableLeadId, fingerprint, escapeHtml, httpsBookingUrl } from "../app/lib/lead-capture.ts";

test("request IDs are stable, valid UUIDs and isolated by workspace", () => {
  const a = stableLeadId("workspace-a", "request-key");
  assert.match(a, /^[a-f0-9]{8}-[a-f0-9]{4}-5[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  assert.equal(a, stableLeadId("workspace-a", "request-key"));
  assert.notEqual(a, stableLeadId("workspace-b", "request-key"));
});
test("request fingerprints detect changed recipients", () => {
  assert.notEqual(fingerprint({email:"a@example.com"}), fingerprint({email:"b@example.com"}));
});
test("mail content escapes markup and attribute quotes", () => {
  assert.equal(escapeHtml('<a href="x">&'), '&lt;a href=&quot;x&quot;&gt;&amp;');
});
test("booking links reject scripts, cleartext and embedded credentials", () => {
  for (const url of ["javascript:alert(1)", "http://example.com", "https://user:pass@example.com", null]) assert.equal(httpsBookingUrl(url),null);
  assert.equal(httpsBookingUrl("https://cal.com/example"),"https://cal.com/example");
});

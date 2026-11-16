# Using FlowMeet

The hosted getting-started guide is available at https://flowmeet.aetherhost.app/guide.

## Who it is for

A B2B sales team that needs to capture inbound enquiries, apply explainable qualification rules, give qualified prospects a calendar link, and track what actually happened. It is also a concrete example of reusable Rust platform components supporting a product.

## Explore first

Open `/docs`. Enter an allowed demo company email and a documentation question. Choose the direct pipeline or n8n. Both preview paths read a website, evaluate routing rules, and retrieve a documentation match. They do not save leads, send email, or book meetings.

## Use a workspace

1. Sign up, confirm your email if requested, and sign in. Workspace creation requires a verified authenticated identity.
2. Open dashboard settings. Save an HTTPS calendar booking link.
3. Open `/demo` while signed in to save a real enquiry in your workspace. The form is for the workspace operator; it is not a public anonymous prospect form.
4. By default the enquiry is saved without an email. Explicitly enable the booking email checkbox for a qualified lead if desired.
5. The lead receives a link and chooses a time with the calendar provider. A link is not a confirmed meeting.

The dashboard's qualification rate measures how many saved leads satisfy the rules; it is not a sales conversion rate. Confirmed pilot bookings are marked `Meeting booked`.

## Connect an existing website

Your website form should send the enquiry to **your backend**. That backend calls:

```http
POST /api/leads
x-api-key: YOUR_SERVER_SIDE_WORKSPACE_KEY
Idempotency-Key: unique-enquiry-123
Content-Type: application/json

{
  "name": "Alex",
  "email": "alex@example.com",
  "company": "Example",
  "role": "Founder",
  "region": "Europe",
  "send_booking_email": false
}
```

The workspace is derived from the API key. Body fields such as `userId` or `workspace_id` do not grant access to another workspace. Keep the key out of browser JavaScript, shared URLs, logs, and screenshots.

For the same enquiry, reuse the same Idempotency-Key when retrying. Changing the body under an existing key returns 409. Changing the key creates a different enquiry and can create a second email, so do not use that as an automatic retry strategy.

Response fields:

- `lead`: the stored database record.
- `qualified`: the result of the qualification rules.
- `bookingUrl`: a configured link when applicable.
- `delivery.status`: `not_requested`, `dispatching`, `accepted`, or `unconfirmed`.
- `delivery.email_id`: a provider message ID after acceptance.
- `duplicate`: whether the lead already existed for this request.

A 201 response means a lead was created. Replays return 200. Authentication failures return 401, changed payloads under the same key return 409, and interrupted persistence returns 503. A successful capture with `unconfirmed` delivery means the lead is saved but email acceptance was not confirmed. Reconcile the delivery record before creating a new request.

Read status with `GET /api/leads/LEAD_ID/status` using the same credentials. Signed delivery events distinguish sent, delivered, delayed, bounced, and complained outcomes.

## n8n customer capture

`/api/leads?via=n8n` is available for the configured capture workspace. It authenticates the caller, invokes a separate Header Auth webhook, and calls the shared capture implementation using a workspace-scoped API credential. The response includes an execution ID. Other workspaces receive a configuration error until their own workflow and credentials are provisioned.

The downloadable workflow is `/workflows/customer-lead-capture.json`. It is separate from the read-only preview workflow. Neither workflow contains live credentials in its downloadable JSON.

## Pilot calendar APIs

For the configured pilot workspace only:

- `GET /api/calendar/slots?start=YYYY-MM-DD&end=YYYY-MM-DD` reads provider availability for a date window of at most seven days.
- `POST /api/calendar/book` with `lead_id` and an available ISO `start` requests a real booking for that saved qualified lead.

These are authenticated APIs. The attendee comes from the saved lead, not arbitrary body fields. Cal.com must return an accepted booking before FlowMeet calls it confirmed. A repeated request for the same lead/time returns the same stored provider result. A different time under that lead's existing request requires reconciliation/rescheduling.

The pilot booking integration is not yet a general calendar connector for every workspace. Other teams use their configured booking link. Production cancellation/reschedule synchronisation requires their provider webhook configuration.

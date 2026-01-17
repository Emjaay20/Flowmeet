export function leadBookingEmail({
    name,
    bookingUrl,
}: {
    name: string;
    bookingUrl: string;
}) {
    return `
    <h2>Hi ${name},</h2>
    <p>Thanks for reaching out.</p>
    <p>Please book a meeting using the link below:</p>
    <p>
      <a href="${bookingUrl}" target="_blank">
        Book a Meeting
      </a>
    </p>
    <p>Looking forward to speaking with you.</p>
  `;
}

import { Resend } from "resend";

// Use a fallback key during build/dev if the env var is missing to prevent crash on import
// The actual sendEmail call will still fail at runtime if the key is invalid
const apiKey = process.env.RESEND_API_KEY || "re_123456789";
export const resend = new Resend(apiKey);

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    return resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to,
        subject,
        html,
    });
}

import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY || "build-only-placeholder");

/** SDK errors are values; always turn them into failures before claiming acceptance. */
export async function sendEmail({ to, subject, html, idempotencyKey, tags }: {
    to: string; subject: string; html: string; idempotencyKey?: string;
    tags?: { name: string; value: string }[];
}) {
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error("Email delivery is not configured");
    const result = await resend.emails.send({ from: process.env.EMAIL_FROM, to, subject, html, tags },
        idempotencyKey ? { idempotencyKey } : undefined);
    if (result.error || !result.data?.id) throw new Error("Email provider did not confirm acceptance");
    return result;
}

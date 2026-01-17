export function tenantLeadEmail(lead: {
    name: string;
    email: string;
    company?: string;
    score: number;
}) {
    return `
    <h2>New Qualified Lead 🎉</h2>
    <p><strong>Name:</strong> ${lead.name}</p>
    <p><strong>Email:</strong> ${lead.email}</p>
    <p><strong>Company:</strong> ${lead.company ?? "N/A"}</p>
    <p><strong>AI Score:</strong> ${lead.score}</p>
  `;
}

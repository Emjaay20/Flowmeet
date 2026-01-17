type LeadInput = {
    role?: string
    company?: string
    region?: string
}

export function scoreLeadAI(lead: LeadInput) {
    let score = 0
    let reasons = []

    if (lead.role?.match(/manager|director|head|founder/i)) {
        score += 0.4
        reasons.push('Decision-making role')
    }

    if (lead.company && lead.company.length > 2) {
        score += 0.3
        reasons.push('Company provided')
    }

    if (lead.region?.match(/us|uk|canada|europe/i)) {
        score += 0.2
        reasons.push('High-conversion region')
    }

    if (score > 1) score = 1

    return {
        score,
        reason: reasons.join(', '),
    }
}

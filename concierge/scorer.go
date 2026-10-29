package main

import (
	"strings"
)

// CalculateICPScore evaluates incoming lead attributes in sub-millisecond CPU execution time
func CalculateICPScore(req *RouteRequest) int {
	score := 50
	if req.ScraperIntent > 0 {
		score = req.ScraperIntent
	}

	// 1. Employee Sizing & Enterprise Firmographics Booster
	if req.Employees >= 1000 || strings.Contains(strings.ToLower(req.EstimatedTier), "enterprise") {
		score += 25
	} else if req.Employees >= 200 || strings.Contains(strings.ToLower(req.EstimatedTier), "mid-market") {
		score += 15
	} else if req.Employees >= 50 {
		score += 10
	}

	// 2. Executive Seniority Evaluation
	roleLower := strings.ToLower(req.Role)
	if strings.Contains(roleLower, "chief") || strings.Contains(roleLower, "vp") || strings.Contains(roleLower, "cto") || strings.Contains(roleLower, "ceo") {
		score += 20
	} else if strings.Contains(roleLower, "director") || strings.Contains(roleLower, "head") || strings.Contains(roleLower, "architect") || strings.Contains(roleLower, "founder") {
		score += 15
	} else if strings.Contains(roleLower, "lead") || strings.Contains(roleLower, "senior") || strings.Contains(roleLower, "manager") {
		score += 10
	}

	// 3. Enterprise Tech Stack Alignment
	techCount := len(req.DetectedTechStack)
	if techCount >= 5 {
		score += 15
	} else if techCount >= 2 {
		score += 10
	}

	// 4. Domain / Email Signal Analysis
	emailLower := strings.ToLower(req.Email)
	if strings.HasSuffix(emailLower, "@gmail.com") || strings.HasSuffix(emailLower, "@yahoo.com") || strings.HasSuffix(emailLower, "@hotmail.com") {
		score -= 25 // Free webmail deduction
	}

	// Enforce 1 - 100 boundaries
	if score > 100 {
		return 100
	}
	if score < 1 {
		return 1
	}
	return score
}

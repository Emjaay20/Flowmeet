package main

import (
	"strings"
	"time"
)

// Score thresholds. At or above vipThreshold a lead goes to an enterprise
// rep; at or above commercialThreshold to the commercial queue; anything
// lower is sent to self-serve.
const (
	vipThreshold        = 85
	commercialThreshold = 65
)

func regionMatches(region string, needles ...string) bool {
	for _, n := range needles {
		if strings.Contains(region, n) {
			return true
		}
	}
	return false
}

// EvaluateRoute scores a lead and picks a tier and a roster entry.
func EvaluateRoute(req *RouteRequest) *RouteResult {
	start := time.Now()

	score := CalculateICPScore(req)

	company := req.Company
	if company == "" {
		if _, domain, ok := strings.Cut(req.Email, "@"); ok && !isFreeMail(domain) {
			company = strings.ToUpper(strings.SplitN(domain, ".", 2)[0])
		} else {
			company = "Individual"
		}
	}

	region := strings.ToLower(req.Region)
	var (
		assigned AssignedMember
		tier     string
		action   string
		value    int
	)

	switch {
	case score >= vipThreshold:
		tier, action, value = "VIP_ENTERPRISE", "ENTERPRISE_REP_BOOKING", 65000
		switch {
		case regionMatches(region, "emea", "europe", "germany", "uk", "africa"):
			assigned = repEMEA
		case regionMatches(region, "apac", "asia", "australia", "singapore"):
			assigned = repAPAC
		default:
			assigned = repAmericas
		}
	case score >= commercialThreshold:
		tier, action, value = "COMMERCIAL", "COMMERCIAL_QUEUE_BOOKING", 24000
		assigned = repCommercial
	default:
		tier, action, value = "SELF_SERVE", "SEND_TO_DOCS", 4900
		assigned = repSelfServe
	}

	return &RouteResult{
		Status:            200,
		LeadEmail:         req.Email,
		Company:           company,
		FinalICPScore:     score,
		QualificationTier: tier,
		RoutingAction:     action,
		AssignedMember:    &assigned,
		SampleRoster:      sampleRoster,
		TierValueUSD:      value,
		ExecutionTimeNs:   time.Since(start).Nanoseconds(),
		Timestamp:         time.Now().UTC(),
	}
}

func isFreeMail(domain string) bool {
	switch strings.ToLower(domain) {
	case "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "proton.me", "protonmail.com", "aol.com":
		return true
	}
	return false
}

package main

import "time"

// RouteRequest is the lead data the router scores. Fields come from the
// scraper's signals or from a lead form.
type RouteRequest struct {
	Email             string   `json:"email"`
	Company           string   `json:"company,omitempty"`
	Role              string   `json:"role,omitempty"`
	Region            string   `json:"region,omitempty"`
	Employees         int      `json:"employees,omitempty"`
	EstimatedTier     string   `json:"estimated_tier,omitempty"`
	DetectedTechStack []string `json:"detected_tech_stack,omitempty"`
	ScraperIntent     int      `json:"scraper_intent,omitempty"`
}

// AssignedMember is the roster entry a lead is routed to.
type AssignedMember struct {
	Name      string `json:"name"`
	Title     string `json:"title"`
	Email     string `json:"email,omitempty"`
	Territory string `json:"territory"`
}

// RouteResult is the routing decision.
type RouteResult struct {
	Status            int             `json:"status"`
	LeadEmail         string          `json:"lead_email"`
	Company           string          `json:"company"`
	FinalICPScore     int             `json:"final_icp_score"`
	QualificationTier string          `json:"qualification_tier"`
	RoutingAction     string          `json:"routing_action"`
	AssignedMember    *AssignedMember `json:"assigned_member,omitempty"`
	// SampleRoster is true while the roster in roster.go is still the
	// placeholder one that ships with the repo.
	SampleRoster bool `json:"sample_roster"`
	// TierValueUSD is a fixed per-tier constant used for ordering and
	// escalation rules. It is not a forecast of deal size.
	TierValueUSD int `json:"tier_value_usd"`
	// ExecutionTimeNs is the measured time spent inside EvaluateRoute.
	ExecutionTimeNs int64     `json:"execution_time_ns"`
	Timestamp       time.Time `json:"timestamp"`
}

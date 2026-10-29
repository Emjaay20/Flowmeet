package main

import "time"

// RouteRequest represents incoming firmographics from our Rust scraper or live lead forms
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

// AssignedMember represents the sales or onboarding specialist matched to the lead
type AssignedMember struct {
	Name           string `json:"name"`
	Title          string `json:"title"`
	Email          string `json:"email"`
	CalendarURL    string `json:"calendar_url"`
	Territory      string `json:"territory"`
	ResponseTimeMs int    `json:"response_time_ms"`
}

// RouteResult represents the sub-50ms decision output produced by the Go Concierge engine
type RouteResult struct {
	Status             int            `json:"status"`
	LeadEmail          string         `json:"lead_email"`
	Company            string         `json:"company"`
	FinalICPScore      int            `json:"final_icp_score"`
	QualificationTier  string         `json:"qualification_tier"`
	RoutingAction      string         `json:"routing_action"`
	AssignedMember     *AssignedMember `json:"assigned_member,omitempty"`
	AutomatedGreeting  string         `json:"automated_greeting"`
	EstimatedDealARR   int            `json:"estimated_deal_arr_usd"`
	ExecutionTimeMicro int64          `json:"execution_time_microseconds"`
	Timestamp          time.Time      `json:"timestamp"`
	WorkerNode         string         `json:"worker_node"`
}

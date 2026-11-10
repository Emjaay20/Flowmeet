package main

import "testing"

func TestEvaluateRouteTiers(t *testing.T) {
	cases := []struct {
		name string
		req  RouteRequest
		tier string
		rep  string
	}{
		{"emea enterprise", RouteRequest{Email: "cto@acme.io", Role: "CTO", Region: "EMEA", Employees: 1200, DetectedTechStack: []string{"a", "b", "c", "d", "e"}}, "VIP_ENTERPRISE", "EMEA enterprise AE"},
		{"americas default", RouteRequest{Email: "vp@acme.io", Role: "VP Engineering", Region: "Americas", Employees: 1500, DetectedTechStack: []string{"a", "b"}}, "VIP_ENTERPRISE", "Yusuf Abubakar"},
		{"free mail", RouteRequest{Email: "x@gmail.com"}, "SELF_SERVE", "Self-serve"},
		{"mid market", RouteRequest{Email: "m@acme.io", Role: "Manager", Employees: 60, ScraperIntent: 50, DetectedTechStack: []string{"a", "b"}}, "COMMERCIAL", "Commercial AE"},
	}
	for _, c := range cases {
		got := EvaluateRoute(&c.req)
		if got.QualificationTier != c.tier || got.AssignedMember.Name != c.rep {
			t.Errorf("%s: got tier=%s rep=%s (score %d), want %s / %s", c.name, got.QualificationTier, got.AssignedMember.Name, got.FinalICPScore, c.tier, c.rep)
		}
		if got.ExecutionTimeNs <= 0 {
			t.Errorf("%s: execution time not measured", c.name)
		}
	}
}

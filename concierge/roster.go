package main

// Roster is the set of people (or queues) leads can be routed to.
//
// Everything here except the Americas/global entry is a placeholder. Replace
// these entries with your own team and set sampleRoster to false.
const sampleRoster = true

var (
	repEMEA = AssignedMember{
		Name:      "EMEA enterprise AE",
		Title:     "Placeholder roster entry",
		Territory: "EMEA",
	}
	repAPAC = AssignedMember{
		Name:      "APAC enterprise AE",
		Title:     "Placeholder roster entry",
		Territory: "APAC",
	}
	repAmericas = AssignedMember{
		Name:      "Yusuf Abubakar",
		Title:     "Founder",
		Email:     "yusuf@yusufsaka.dev",
		Territory: "Americas and everywhere else",
	}
	repCommercial = AssignedMember{
		Name:      "Commercial AE",
		Title:     "Placeholder roster entry",
		Territory: "Mid-market, all regions",
	}
	repSelfServe = AssignedMember{
		Name:      "Self-serve",
		Title:     "No rep assigned",
		Territory: "Docs and quickstart",
	}
)

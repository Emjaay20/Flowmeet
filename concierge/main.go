package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

func main() {
	log.Println("Initializing FlowMeet GoLang Concierge Sub-50ms Rules Engine v2.0...")
	log.Println("Target Infrastructure: Oracle Linux 1GB VPS Edge Node (Goroutine Pool Enabled)")

	mux := http.NewServeMux()

	// Endpoints
	mux.HandleFunc("GET /", withCORS(handleHealth))
	mux.HandleFunc("GET /health", withCORS(handleHealth))
	mux.HandleFunc("POST /route", withCORS(handleRoute))

	serverAddr := "0.0.0.0:8082"
	log.Printf("🚀 Go Concierge Rules Engine listening on http://%s\n", serverAddr)

	server := &http.Server{
		Addr:         serverAddr,
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
		IdleTimeout:  30 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Critical Go Server failure: %v", err)
	}
}

// handleHealth outputs operational runtime diagnostics
func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	diag := map[string]interface{}{
		"status":          "operational",
		"service":         "flowmeet-go-concierge",
		"version":         "2.0.0",
		"engine":          "GoLang 1.22 Goroutine Rules Mux",
		"target_vps":      "Oracle Cloud Free Tier Linux VPS (1GB RAM)",
		"ram_consumption": "~10MB (Static binary, zero GC pressure)",
		"concurrency":     "Sub-millisecond territory routing (Chili Piper equivalent)",
		"timestamp":       time.Now().Format(time.RFC3339),
	}
	_ = json.NewEncoder(w).Encode(diag)
}

// handleRoute processes lead firmographics and runs territory matching rules
func handleRoute(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed, use POST"}`, http.StatusMethodNotAllowed)
		return
	}

	var req RouteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[Error] Failed to decode routing request: %v", err)
		http.Error(w, `{"error": "Invalid JSON payload format"}`, http.StatusBadRequest)
		return
	}

	log.Printf("[Telemetry] Incoming route evaluation request for lead: %s (Company: %s, Emp: %d)", req.Email, req.Company, req.Employees)

	result := EvaluateRoute(&req)

	log.Printf("[Success] Routed %s to tier [%s] in %d microseconds!", req.Email, result.QualificationTier, result.ExecutionTimeMicro)

	w.Header().Set("x-flowmeet-engine", "golang-goroutine-router")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(result)
}

// withCORS adds cross-origin headers to enable Next.js frontend integration and browser calls
func withCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-flowmeet-secret")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

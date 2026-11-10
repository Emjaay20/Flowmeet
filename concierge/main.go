package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /", withCORS(handleHealth))
	mux.HandleFunc("GET /health", withCORS(handleHealth))
	mux.HandleFunc("POST /route", withCORS(handleRoute))
	mux.HandleFunc("OPTIONS /route", withCORS(func(w http.ResponseWriter, r *http.Request) {}))

	server := &http.Server{
		Addr:         "0.0.0.0:8082",
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
		IdleTimeout:  30 * time.Second,
	}

	log.Printf("concierge listening on %s", server.Addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"status":        "ok",
		"service":       "flowmeet-concierge",
		"sample_roster": sampleRoster,
		"timestamp":     time.Now().UTC().Format(time.RFC3339),
	})
}

func handleRoute(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	r.Body = http.MaxBytesReader(w, r.Body, 64*1024)
	var req RouteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid JSON body"})
		return
	}
	if req.Email == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "email is required"})
		return
	}

	result := EvaluateRoute(&req)
	log.Printf("routed %s to %s (score %d, %dns)", req.Email, result.QualificationTier, result.FinalICPScore, result.ExecutionTimeNs)
	_ = json.NewEncoder(w).Encode(result)
}

func withCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next(w, r)
	}
}

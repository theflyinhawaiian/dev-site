package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
)

func main() {
	if err := initDB(); err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/projects", handleProjects)
	mux.HandleFunc("GET /api/jobs", handleJobs)
	mux.HandleFunc("GET /api/jobs/{id}", handleJob)

	log.Printf("API server running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}

func jsonResponse(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func handleProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := getProjects()
	if err != nil {
		log.Printf("getProjects: %v", err)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}
	jsonResponse(w, http.StatusOK, projects)
}

func handleJobs(w http.ResponseWriter, r *http.Request) {
	jobs, err := getJobs()
	if err != nil {
		log.Printf("getJobs: %v", err)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}
	jsonResponse(w, http.StatusOK, jobs)
}

func handleJob(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "invalid job ID"})
		return
	}
	job, err := getJob(id)
	if err == errNotFound {
		jsonResponse(w, http.StatusNotFound, map[string]string{"error": "job not found"})
		return
	}
	if err != nil {
		log.Printf("getJob: %v", err)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}
	jsonResponse(w, http.StatusOK, job)
}

package main

import (
	"fmt"
	"net/http"

	"github.com/rs/cors"
)

func main() {
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
	})
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Hello, World!")
	})
	http.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		Message := r.Body
		fmt.Fprintln(w, Message)
	})
	handler := corsHandler.Handler(http.DefaultServeMux)
	http.ListenAndServe(":8080", handler)
}

package main

import (
	"chat-app-backend/Auth"
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
	http.HandleFunc("/auth/login", Auth.Login)
	// http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
	// 	fmt.Fprintln(w, "Hello, World!")
	// })

	Auth.ConnectDB()
	handler := corsHandler.Handler(http.DefaultServeMux)
	http.ListenAndServe(":8080", handler)
}

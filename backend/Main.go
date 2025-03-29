package main

import (
	"chat-app-backend/Auth"
	configurations "chat-app-backend/Configurations"
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
	DB := configurations.ConnectDB()
	store := configurations.ConfigSessions()
	http.HandleFunc("/auth/login", func(w http.ResponseWriter, r *http.Request) {
		Auth.Login(w, r, store)
	})
	http.HandleFunc("/auth/signup", func(w http.ResponseWriter, r *http.Request) {
		Auth.SignUp(w, r, DB)
	})
	http.HandleFunc("/isloggedin", func(w http.ResponseWriter, r *http.Request) {
		Auth.IsloggedIn(w, r, store)
	})
	http.HandleFunc("/auth/logout", func(w http.ResponseWriter, r *http.Request) {
		Auth.Logout(w, r, store)
	})
	handler := corsHandler.Handler(http.DefaultServeMux)
	http.ListenAndServe(":8080", handler)
}

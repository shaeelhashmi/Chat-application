package main

import (
	"chat-app-backend/Auth"
	configurations "chat-app-backend/Configurations"
	"chat-app-backend/Socket"
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
	DB := configurations.ConnectDB()
	store := configurations.ConfigSessions()
	go Auth.CheckSessions(DB)
	http.HandleFunc("/auth/login", func(w http.ResponseWriter, r *http.Request) {
		Auth.Login(w, r, store, DB)
	})
	http.HandleFunc("/auth/signup", func(w http.ResponseWriter, r *http.Request) {
		Auth.SignUp(w, r, DB)
	})
	http.HandleFunc("/isloggedin", func(w http.ResponseWriter, r *http.Request) {
		Auth.IsloggedIn(w, r, store, DB)
	})
	http.HandleFunc("/auth/logout", func(w http.ResponseWriter, r *http.Request) {
		Auth.Logout(w, r, store)
	})
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		sender := r.URL.Query().Get("sender")
		fmt.Println("Sender: ", sender)
		Socket.SocketHandler(w, r, sender)
	})
	handler := corsHandler.Handler(http.DefaultServeMux)
	http.ListenAndServe(":8080", handler)
}

package main

import (
	apis "chat-app-backend/APIS"
	"chat-app-backend/Auth"
	block "chat-app-backend/Block"
	configurations "chat-app-backend/Configurations"
	friends "chat-app-backend/Friends/AddFriend"
	delete "chat-app-backend/Friends/DeleteRequests"
	"chat-app-backend/Friends/Exists"
	removefriend "chat-app-backend/Friends/RemoveFriend"
	messages "chat-app-backend/Messages"
	"chat-app-backend/Settings"
	"chat-app-backend/Socket"
	unblock "chat-app-backend/Unblock"
	"log"
	"net/http"
	"os"
	"chat-app-backend/Activity"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS", "DELETE"},
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
	http.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
		apis.ImportUsers(w, r, DB, store)
	})
	http.HandleFunc("/api/messages", func(w http.ResponseWriter, r *http.Request) {
		apis.ImportMessages(w, r, DB, store)
	})
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		Socket.SocketHandler(w, r, DB)
	})
	http.HandleFunc("/addfriend", func(w http.ResponseWriter, r *http.Request) {
		friends.SendFriendRequest(w, r, DB, store)
	})
	http.HandleFunc("/requests/sent", func(w http.ResponseWriter, r *http.Request) {
		apis.SentRequests(w, r, DB, store)
	})
	http.HandleFunc("/requests/recieved", func(w http.ResponseWriter, r *http.Request) {
		apis.RecievedRequests(w, r, DB, store)
	})
	http.HandleFunc("/acceptrequest", func(w http.ResponseWriter, r *http.Request) {
		friends.AcceptRequests(w, r, DB, store)
	})
	http.HandleFunc("/api/friends", func(w http.ResponseWriter, r *http.Request) {
		apis.Friends(w, r, DB, store)
	})
	http.HandleFunc("/api/friends/blocked", func(w http.ResponseWriter, r *http.Request) {
		apis.BlockedUsers(w, r, DB, store)
	})
	http.HandleFunc("/delete/request", func(w http.ResponseWriter, r *http.Request) {

		delete.DeleteReceivedRequest(w, r, DB, store)
	})
	http.HandleFunc("/delete/sentrequest", func(w http.ResponseWriter, r *http.Request) {
		delete.DeleteSentRequest(w, r, DB, store)
	})
	http.HandleFunc("/settings/username", func(w http.ResponseWriter, r *http.Request) {
		Settings.ChangeUserName(w, r, DB, store)
	})
	http.HandleFunc("/settings/password", func(w http.ResponseWriter, r *http.Request) {
		Settings.ChangePassword(w, r, DB, store)
	})
	http.HandleFunc("/friend/exists", func(w http.ResponseWriter, r *http.Request) {
		Exists.Exists(w, r, DB, store)
	})
	http.HandleFunc("/friend/remove", func(w http.ResponseWriter, r *http.Request) {
		removefriend.RemoveFriend(w, r, DB, store)
	})
	http.HandleFunc("/message/delete", func(w http.ResponseWriter, r *http.Request) {
		messages.DeleteMessage(w, r, DB, store)
	})
	http.HandleFunc("/block", func(w http.ResponseWriter, r *http.Request) {
		block.BlockHandler(w, r, DB, store)
	})
	http.HandleFunc("/unblock", func(w http.ResponseWriter, r *http.Request) {
		unblock.UnblockUser(w, r, store, DB)
	})
	http.HandleFunc("/user/event", func(w http.ResponseWriter, r *http.Request) {
		apis.UserActivity(w, r, DB, store)
	})
	http.HandleFunc("/delete/event", func(w http.ResponseWriter, r *http.Request) {
		activity.DeleteActivity(w, r, DB, store)
	})
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	handler := corsHandler.Handler(http.DefaultServeMux)
	http.ListenAndServe(os.Getenv("Address"), handler)
}

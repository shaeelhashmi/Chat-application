package apis

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/sessions"
)

func ImportUsers(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {

	loginUser, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	users, err := DB.Query("SELECT username FROM users WHERE username != ?", loginUser.Values["username"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer users.Close()

	var usernames []string
	for users.Next() {
		var username string
		if err := users.Scan(&username); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		usernames = append(usernames, username)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(usernames)

}

func ImportMessages(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	User, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	reciever := r.URL.Query().Get("reciever")
	if reciever == "" {
		http.Error(w, "Reciever is required", http.StatusBadRequest)
		return
	}
	var messages []struct {
		Sender    string    `json:"sender"`
		Reciever  string    `json:"reciever"`
		Message   string    `json:"message"`
		CreatedAt time.Time `json:"created_at"`
	}
	rows, err := DB.Query("SELECT sender, reciever, message, created_at FROM messsages WHERE (sender = ? AND reciever = ?) OR (reciever = ? AND sender = ?)", User.Values["username"], reciever, User.Values["username"], reciever)
	fmt.Println(rows)
	if err != nil {
		fmt.Println("Error fetching messages:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var msg struct {
			Sender    string    `json:"sender"`
			Reciever  string    `json:"reciever"`
			Message   string    `json:"message"`
			CreatedAt time.Time `json:"created_at"`
		}
		var createdAt string
		if err := rows.Scan(&msg.Sender, &msg.Reciever, &msg.Message, &createdAt); err != nil {
			fmt.Println("Error scanning message:", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		msg.CreatedAt, err = time.Parse("2006-01-02 15:04:05", createdAt)
		if err != nil {
			fmt.Println("Error parsing created_at:", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		messages = append(messages, msg)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func SentRequests(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	User, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	var sentRequests []struct {
		ID        int       `json:"id"`
		Reciever  string    `json:"reciever"`
		CreatedAt time.Time `json:"created_at"`
	}
	rows, err := DB.Query("SELECT id,receiver, created_at FROM friends WHERE sender = ? AND status=?", User.Values["username"], "pending")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var request struct {
			ID        int       `json:"id"`
			Reciever  string    `json:"reciever"`
			CreatedAt time.Time `json:"created_at"`
		}
		var createdAt string
		if err := rows.Scan(&request.ID, &request.Reciever, &createdAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		request.CreatedAt, err = time.Parse("2006-01-02 15:04:05", createdAt)
		if err != nil {

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		sentRequests = append(sentRequests, request)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sentRequests)

}
func RecievedRequests(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	User, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	var recievedRequests []struct {
		ID        int       `json:"id"`
		Sender    string    `json:"sender"`
		CreatedAt time.Time `json:"created_at"`
	}
	rows, err := DB.Query("SELECT id,sender, created_at FROM friends WHERE receiver = ? AND status=?", User.Values["username"], "pending")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var request struct {
			ID        int       `json:"id"`
			Sender    string    `json:"sender"`
			CreatedAt time.Time `json:"created_at"`
		}
		var createdAt string
		if err := rows.Scan(&request.ID, &request.Sender, &createdAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		request.CreatedAt, err = time.Parse("2006-01-02 15:04:05", createdAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		recievedRequests = append(recievedRequests, request)
	}
	fmt.Println(recievedRequests)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(recievedRequests)

}

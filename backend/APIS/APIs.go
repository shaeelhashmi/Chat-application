package apis

import (
	utils "chat-app-backend/Utils"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/sessions"
)

type friends struct {
	Friends string `json:"friend"`
	Id      int    `json:"id"`
}

func Friends(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	User, err := store.Get(r, "Login-session")
	fmt.Println("Request User:", User.Values["username"])
	if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
		return
	}
	if User.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	name := User.Values["username"]
	var recieverId int
	err = DB.QueryRow("SELECT id FROM users WHERE username = ?", name).Scan(&recieverId)
	if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
		return
	}
	rows, err := DB.Query("SELECT id,Friend1 FROM friends WHERE Friend2 = ? ", recieverId)
	if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
		return
	}
	defer rows.Close()

	var friendList []friends
	for rows.Next() {
		var friend int
		var friendId int
		if err := rows.Scan(&friendId, &friend); utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
			return
		}
		var friendName string
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", friend).Scan(&friendName)
		if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
			return
		}
		friendList = append(friendList, friends{friendName, friendId})
	}
	rows, err = DB.Query("SELECT Friend2 FROM friends WHERE Friend1 = ?", recieverId)
	if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
		return
	}
	defer rows.Close()
	for rows.Next() {
		var friend int
		var friendId int
		if err := rows.Scan(&friendId, &friend); utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
			return
		}
		var friendName string
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", friend).Scan(&friendName)
		if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
			return
		}
		friendList = append(friendList, friends{friendName, friendId})
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(friendList)

}
func ImportUsers(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {

	loginUser, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "User not logged in", http.StatusUnauthorized) {
		return
	}
	if loginUser.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	users, err := DB.Query("SELECT username FROM users WHERE username != ?", loginUser.Values["username"])
	if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
		return
	}

	defer users.Close()

	var usernames []string
	for users.Next() {
		var username string
		if err := users.Scan(&username); utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
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
	if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
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
	var recieverId int
	err = DB.QueryRow("SELECT id FROM users WHERE username = ?", reciever).Scan(&recieverId)
	if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
		return
	}
	var senderId int
	err = DB.QueryRow("SELECT id FROM users WHERE username = ?", User.Values["username"]).Scan(&senderId)
	if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
		return
	}

	rows, err := DB.Query("SELECT sender, receiver, message, created_at FROM messages WHERE (sender = ? AND receiver = ?) OR (receiver = ? AND sender = ?)", senderId, recieverId, senderId, recieverId)
	if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
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
		var senderId, recieverId int
		if err := rows.Scan(&senderId, &recieverId, &msg.Message, &createdAt); utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
			return
		}
		msg.CreatedAt, err = time.Parse("2006-01-02 15:04:05", createdAt)
		if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
			return
		}
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", senderId).Scan(&msg.Sender)
		if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
			return
		}
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", recieverId).Scan(&msg.Reciever)
		if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
			return
		}

		messages = append(messages, msg)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func SentRequests(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	User, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
		return
	}
	var sentRequests []struct {
		ID        int       `json:"id"`
		Reciever  string    `json:"reciever"`
		CreatedAt time.Time `json:"created_at"`
	}
	name := User.Values["username"]
	var senderId int
	err = DB.QueryRow("SELECT id FROM users WHERE username = ?", name).Scan(&senderId)
	if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {

		return
	}
	rows, err := DB.Query("SELECT id,receiver, created_at FROM requests WHERE sender = ? AND status=?", senderId, "pending")
	if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
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
		var recieverId int
		if err := rows.Scan(&request.ID, &recieverId, &createdAt); utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
			return
		}
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", recieverId).Scan(&request.Reciever)
		if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
			return
		}
		request.CreatedAt, err = time.Parse("2006-01-02 15:04:05", createdAt)
		if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
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
	name := User.Values["username"]
	var recieverId int
	err = DB.QueryRow("SELECT id FROM users WHERE username = ?", name).Scan(&recieverId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	rows, err := DB.Query("SELECT id,sender, created_at FROM requests WHERE receiver = ? AND status=?", recieverId, "pending")
	if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
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
		var senderId int
		if err := rows.Scan(&request.ID, &senderId, &createdAt); utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
			return
		}
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", senderId).Scan(&request.Sender)
		if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
			return
		}
		request.CreatedAt, err = time.Parse("2006-01-02 15:04:05", createdAt)
		if utils.HandleError(w, err, err.Error(), http.StatusInternalServerError) {
			return
		}
		recievedRequests = append(recievedRequests, request)
	}
	fmt.Println(recievedRequests)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(recievedRequests)

}

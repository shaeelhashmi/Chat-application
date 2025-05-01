package friends

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/go-sql-driver/mysql"
	"github.com/gorilla/sessions"
)

func SendFriendRequest(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	var username struct {
		Username string `json:"username"`
	}
	session, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, "Failed to get session", http.StatusInternalServerError)
		return
	}
	if session.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	user := session.Values["username"].(string)
	fmt.Println("AddFriend: ", r.Body)

	data, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	err = json.Unmarshal(data, &username)
	if err != nil {
		http.Error(w, "Failed to unmarshal request body", http.StatusBadRequest)
		return
	}
	if username.Username == user {
		http.Error(w, "Cannot add yourself as a friend", http.StatusBadRequest)
		return
	}
	tx, err := DB.Begin()
	if err != nil {
		http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()
	var exists bool
	err = DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username=?)", username.Username).Scan(&exists)
	if err != nil {
		http.Error(w, "Failed to check if user exists", http.StatusInternalServerError)
		return
	}
	if !exists {
		http.Error(w, "User does not exist", http.StatusNotFound)
		return
	}
	fmt.Println("User: ", user)
	fmt.Println("Friend: ", username.Username)
	var userId int
	err = DB.QueryRow("SELECT id FROM users WHERE username=?", user).Scan(&userId)
	if err != nil {
		http.Error(w, "Failed to get user ID", http.StatusInternalServerError)
		return
	}
	var friendId int
	err = DB.QueryRow("SELECT id FROM users WHERE username=?", username.Username).Scan(&friendId)
	if err != nil {
		http.Error(w, "Failed to get friend ID", http.StatusInternalServerError)
		return
	}
	_, err = tx.Exec("INSERT INTO friends (sender, receiver) VALUES (?, ?)", userId, friendId)
	if err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			http.Error(w, "Friend request already exists", http.StatusConflict)
			return
		}
		http.Error(w, "Failed to insert friend request", http.StatusInternalServerError)
		return
	}
	err = tx.Commit()
	if err != nil {
		http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
func AcceptRequests(w http.ResponseWriter, r *http.Request, DB *sql.DB) {

	data, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	var id struct {
		ID int
	}
	err = json.Unmarshal(data, &id)
	if err != nil {
		http.Error(w, "Failed to unmarshal request body", http.StatusBadRequest)
		return
	}
	_, err = DB.Exec("UPDATE friends SET status = 'accepted' WHERE id=?", id.ID)
	if err != nil {
		http.Error(w, "Failed to check if user exists", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

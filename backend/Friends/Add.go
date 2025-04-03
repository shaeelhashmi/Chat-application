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

func AddFriend(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
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
		fmt.Println("Error checking if user exists:", err)
		http.Error(w, "Failed to check if user exists", http.StatusInternalServerError)
		return
	}
	if !exists {
		http.Error(w, "User does not exist", http.StatusNotFound)
		return
	}

	_, err = tx.Exec("INSERT INTO friends (sender, receiver) VALUES (?, ?)", user, username.Username)
	if err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			http.Error(w, "Friend request already exists", http.StatusConflict)
			return
		}
		fmt.Println("Error inserting friend request:", err)
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

package Settings

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"chat-app-backend/Socket"

	"github.com/gorilla/sessions"
)

func ChangeUserName(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	var username string
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
	var exists bool
	err = DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username=?)", username).Scan(&exists)
	if err != nil {
		http.Error(w, "Failed to check if user exists", http.StatusInternalServerError)
		return
	}
	if exists {
		http.Error(w, "User already exists", http.StatusBadRequest)
		return
	}
	err = DB.QueryRow("UPDATE users SET username=? WHERE username=?", username, user).Err()
	if err != nil {
		http.Error(w, "Failed to update username", http.StatusInternalServerError)
		return
	}

	session.Values["username"] = username
	session.Save(r, w)
	err = DB.QueryRow("UPDATE sessions SET username=? WHERE username=?", username, user).Err()
	if err != nil {
		fmt.Println("Error updating session username:", err)
		http.Error(w, "Failed to update session username", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Username updated successfully"))
	delete(Socket.Connections, user)

}
func ChangePassword(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	var passwords string
	data, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	err = json.Unmarshal(data, &passwords)
	if err != nil {
		http.Error(w, "Failed to unmarshal request body", http.StatusBadRequest)
		return
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
	var exists bool
	err = DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username=? )", user).Scan(&exists)
	if err != nil {
		http.Error(w, "Failed to check if user exists", http.StatusInternalServerError)
		return
	}
	if !exists {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	err = DB.QueryRow("UPDATE users SET password=? WHERE username=?", passwords, user).Err()
	if err != nil {
		http.Error(w, "Failed to update password", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Password updated successfully"))
}

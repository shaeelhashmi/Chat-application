package Settings

import (
	"chat-app-backend/Auth"
	"chat-app-backend/Socket"
	utils "chat-app-backend/Utils"
	"database/sql"
	"encoding/json"
	"io"
	"net/http"

	"github.com/gorilla/sessions"
)

func ChangeUserName(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	var username string
	data, err := io.ReadAll(r.Body)
	if utils.HandleError(w, err, "Failed to read request body", http.StatusBadRequest) {
		return
	}
	err = json.Unmarshal(data, &username)
	if utils.HandleError(w, err, "Failed to unmarshal request body", http.StatusBadRequest) {
		return
	}
	session, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "Failed to get session", http.StatusInternalServerError) {
		return
	}
	if session.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	user := session.Values["username"].(string)
	var exists bool
	err = DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username=?)", username).Scan(&exists)
	if utils.HandleError(w, err, "Failed to check if user exists", http.StatusInternalServerError) {
		return
	}
	if exists {
		http.Error(w, "User already exists", http.StatusBadRequest)
		return
	}
	err = DB.QueryRow("UPDATE users SET username=? WHERE username=?", username, user).Err()
	if utils.HandleError(w, err, "Failed to update username", http.StatusInternalServerError) {
		return
	}

	session.Values["username"] = username
	session.Save(r, w)
	err = DB.QueryRow("UPDATE sessions SET username=? WHERE username=?", username, user).Err()
	if utils.HandleError(w, err, "Failed to update session username", http.StatusInternalServerError) {
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Username updated successfully"))
	delete(Socket.Connections, user)

}
func ChangePassword(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	var passwords string
	data, err := io.ReadAll(r.Body)
	if utils.HandleError(w, err, "Failed to read request body", http.StatusBadRequest) {
		return
	}
	err = json.Unmarshal(data, &passwords)
	if utils.HandleError(w, err, "Failed to unmarshal request body", http.StatusBadRequest) {
		return
	}
	session, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "Failed to get session", http.StatusInternalServerError) {
		return
	}
	if session.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	user := session.Values["username"].(string)
	var exists bool
	err = DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username=? )", user).Scan(&exists)
	if utils.HandleError(w, err, "Failed to check if user exists", http.StatusInternalServerError) {
		return
	}
	if !exists {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	salt := Auth.GenerateRandomSalt(16)
	passwords = Auth.HashPassword(passwords, salt)
	err = DB.QueryRow("UPDATE users SET password=?, salt=? WHERE username=?", passwords, salt, user).Err()
	if utils.HandleError(w, err, "Failed to update password", http.StatusInternalServerError) {
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Password updated successfully"))
}

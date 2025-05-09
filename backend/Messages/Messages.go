package messages

import (
	utils "chat-app-backend/Utils"
	"database/sql"
	"net/http"

	"github.com/gorilla/sessions"
)

func DeleteMessage(w http.ResponseWriter, r *http.Request, store *sessions.CookieStore, db *sql.DB) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	session, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "Failed to get session", http.StatusInternalServerError) {
		return
	}
	userName := session.Values["username"].(string)
	if userName == "" {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	messageID := r.URL.Query().Get("messageID")
	if messageID == "" {
		http.Error(w, "Missing message ID", http.StatusBadRequest)
		return
	}
	_, err = db.Exec("DELETE FROM messages WHERE id = ? AND username = ?", messageID, userName)
	if utils.HandleError(w, err, "Failed to delete message", http.StatusInternalServerError) {
		return
	}
	w.WriteHeader(http.StatusOK)
}

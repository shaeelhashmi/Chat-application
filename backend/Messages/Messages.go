package messages

import (
	utils "chat-app-backend/Utils"
	"database/sql"
	"net/http"

	"github.com/gorilla/sessions"
)

func DeleteMessage(w http.ResponseWriter, r *http.Request, db *sql.DB, store *sessions.CookieStore) {
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
	messageID := r.URL.Query().Get("id")
	if messageID == "" {
		http.Error(w, "Missing message ID", http.StatusBadRequest)
		return
	}
	var id int
	err = db.QueryRow("SELECT id FROM users WHERE username = ?", userName).Scan(&id)
	if utils.HandleError(w, err, "Failed to get message ID", http.StatusInternalServerError) {
		return
	}
	_, err = db.Exec("DELETE FROM messages WHERE id = ? AND (sender = ? OR receiver=?)", messageID, id, id)
	if utils.HandleError(w, err, "Failed to delete message", http.StatusInternalServerError) {
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Message deleted successfully"))
}

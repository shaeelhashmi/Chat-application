package block

import (
	utils "chat-app-backend/Utils"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gorilla/sessions"
)

func BlockHandler(w http.ResponseWriter, r *http.Request, db *sql.DB, store *sessions.CookieStore) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	// Check if the user is logged in
	session, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "Failed to get session", http.StatusInternalServerError) {
		return
	}
	if session.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	username := session.Values["username"].(string)
	var userID int
	err = db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID)
	if utils.HandleError(w, err, "Failed to get user ID", http.StatusInternalServerError) {
		return
	}
	friendName := r.URL.Query().Get("friend_name")
	if friendName == "" {
		http.Error(w, "Friend ID is required", http.StatusBadRequest)
		return
	}
	var friendID int
	err = db.QueryRow("SELECT id FROM users WHERE username = ?", friendName).Scan(&friendID)
	if utils.HandleError(w, err, "Failed to get friend ID", http.StatusInternalServerError) {
		return
	}
	tx, err := db.Begin()
	if utils.HandleError(w, err, "Failed to begin transaction", http.StatusInternalServerError) {
		return
	}
	defer tx.Rollback()
	_, err = tx.Exec("INSERT INTO blocked_users (blocked_by, blocked) VALUES (?, ?)", userID, friendID)
	if utils.HandleError(w, err, "Failed to block user", http.StatusInternalServerError) {
		return
	}
	friendShipID := r.URL.Query().Get("friendship_id")
	if friendShipID == "" {
		http.Error(w, "Friendship ID is required", http.StatusBadRequest)
		return
	}
	_, err = tx.Exec("DELETE FROM friends WHERE id = ?", friendShipID)
	if utils.HandleError(w, err, "Failed to delete friendship", http.StatusInternalServerError) {
		return
	}
	query := fmt.Sprintf("Blocked user %s by user %s", friendName, username)
	_, err = tx.Exec("INSERT INTO events (Evnt,relatedTo) VALUES (?,?)", query, userID)
	if utils.HandleError(w, err, "Failed to insert event", http.StatusInternalServerError) {
		return
	}
	err = tx.Commit()
	if utils.HandleError(w, err, "Failed to commit transaction", http.StatusInternalServerError) {
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User blocked successfully"))
}

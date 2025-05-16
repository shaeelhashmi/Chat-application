package removefriend

import (
	utils "chat-app-backend/Utils"
	"database/sql"
	"net/http"

	"github.com/gorilla/sessions"
)

func RemoveFriend(w http.ResponseWriter, r *http.Request, db *sql.DB, store *sessions.CookieStore) {
	session, err := store.Get(r, "Login-session")
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if utils.HandleError(w, err, "Error getting session", http.StatusInternalServerError) {
		return
	}
	if session.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	friendID := r.URL.Query().Get("friendid")
	if friendID == "" {
		http.Error(w, "Friend ID is required", http.StatusBadRequest)
		return
	}
	friendName := r.URL.Query().Get("friendname")
	if friendName == "" {
		http.Error(w, "Friend name is required", http.StatusBadRequest)
		return
	}
	username := session.Values["username"].(string)
	var userID int

	err = db.QueryRow("SELECT id FROM users WHERE username=?", username).Scan(&userID)
	if utils.HandleError(w, err, "Error getting user ID", http.StatusInternalServerError) {
		return
	}
	var friendIDInt int
	err = db.QueryRow("SELECT id FROM users WHERE username=?", friendName).Scan(&friendIDInt)
	if utils.HandleError(w, err, "Error getting friend ID", http.StatusInternalServerError) {
		return
	}
	tx, err := db.Begin()
	if utils.HandleError(w, err, "Error starting transaction", http.StatusInternalServerError) {
		return
	}
	defer tx.Rollback()

	_, err = tx.Exec("DELETE FROM requests WHERE (sender=? AND receiver=?) OR (sender=? AND receiver=?)", userID, friendIDInt, friendIDInt, userID)
	if utils.HandleError(w, err, "Error deleting request", http.StatusInternalServerError) {
		return
	}
	_, err = tx.Exec("DELETE FROM friends WHERE id=? AND (friend1=? OR friend2=?)", friendID, userID, userID)
	if utils.HandleError(w, err, "Error removing friend", http.StatusInternalServerError) {
		return
	}
	_, err = tx.Exec("INSERT INTO events (Evnt,relatedTo) VALUES (?,?)", "Removed friend "+friendName, userID)

	if utils.HandleError(w, err, "Error inserting event", http.StatusInternalServerError) {
		return
	}
	err = tx.Commit()
	if utils.HandleError(w, err, "Error committing transaction", http.StatusInternalServerError) {
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Friend removed successfully"))

}

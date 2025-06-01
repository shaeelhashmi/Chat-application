package Exists

import (
	utils "chat-app-backend/Utils"
	"database/sql"
	"net/http"

	"github.com/gorilla/sessions"
)

func Exists(w http.ResponseWriter, r *http.Request, db *sql.DB, store *sessions.CookieStore) {
	session, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "Error getting session", http.StatusInternalServerError) {
		return
	}
	if session.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	username := session.Values["username"].(string)

	if username == "" {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	friendUsername := r.URL.Query().Get("friend")
	if friendUsername == "" {
		http.Error(w, "Friend username not provided", http.StatusBadRequest)
		return
	}
	friendShipID := r.URL.Query().Get("friendid")
	if friendShipID == "" {
		http.Error(w, "Friend ID not provided", http.StatusBadRequest)
		return
	}
	var exists bool
	err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM friends WHERE id=?)", friendShipID).Scan(&exists)
	if utils.HandleError(w, err, "Error checking if friend exists", http.StatusInternalServerError) {
		return
	}
	if exists {
		var FriendFullName string
		err = db.QueryRow("SELECT fullName FROM users WHERE username=?", friendUsername).Scan(&FriendFullName)
		if utils.HandleError(w, err, "Error getting friend full name", http.StatusInternalServerError) {
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(FriendFullName))
		return
	}
	http.Error(w, "Friendship does not exist", http.StatusNotFound)
}

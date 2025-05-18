package unblock

import (
	utils "chat-app-backend/Utils"
	"database/sql"
	"net/http"

	"github.com/gorilla/sessions"
)

func UnblockUser(w http.ResponseWriter, r *http.Request, store *sessions.CookieStore, db *sql.DB) {
	username, err := utils.GiveUserName(store, r)
	if username == "" {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	if utils.HandleError(w, err, "Failed to get username from session", http.StatusInternalServerError) {
		return
	}
	BlockedID := r.URL.Query().Get("blockedid")
	if BlockedID == "" {
		http.Error(w, "BlockedID is required", http.StatusBadRequest)
		return
	}
	err = db.QueryRow("DELETE FROM blocked_users WHERE ID=?", BlockedID).Err()
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		utils.HandleError(w, err, "Failed to unblock user", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User unblocked successfully"))

}

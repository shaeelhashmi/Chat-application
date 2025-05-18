package activity

import (
	utils "chat-app-backend/Utils"
	"database/sql"
	"net/http"

	"github.com/gorilla/sessions"
)

func DeleteActivity(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	username, err := utils.GiveUserName(store, r)
	if err != nil {
		if err.Error() == "userName not found in session" {
			utils.HandleError(w, err, "User not logged in", http.StatusUnauthorized)
			return
		}
		utils.HandleError(w, err, "Failed to get username from session", http.StatusInternalServerError)
		return
	}
	if username == "" {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	activityID := r.URL.Query().Get("id") // Assuming you have a way to get the activity ID
	if activityID == "" {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	err = DB.QueryRow("DELETE FROM events WHERE id = ?", activityID).Err()
	if utils.HandleError(w, err, "Failed to delete activity", http.StatusInternalServerError) {
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Activity deleted successfully"))
}

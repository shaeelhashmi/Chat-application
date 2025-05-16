package utils

import (
	"fmt"
	"net/http"

	"github.com/gorilla/sessions"
)

func HandleError(w http.ResponseWriter, err error, message string, statusCode int) bool {
	if err != nil {
		fmt.Println(message, err)
		http.Error(w, message, statusCode)
		return true
	}
	return false
}
func GiveUserName(store *sessions.CookieStore, r *http.Request) (string, error) {
	session, err := store.Get(r, "Login-session")
	if err != nil {
		return "", err
	}
	userName, ok := session.Values["username"].(string)
	if !ok {
		return "", fmt.Errorf("userName not found in session")
	}
	return userName, nil
}

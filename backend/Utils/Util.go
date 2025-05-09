package utils

import (
	"net/http"
)

func HandleError(w http.ResponseWriter, err error, message string, statusCode int) bool {
	if err != nil {
		http.Error(w, message, statusCode)
		return true
	}
	return false
}

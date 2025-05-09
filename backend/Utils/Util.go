package utils

import (
	"fmt"
	"net/http"
)

func HandleError(w http.ResponseWriter, err error, message string, statusCode int) bool {
	if err != nil {
		fmt.Println(message, err)
		http.Error(w, message, statusCode)
		return true
	}
	return false
}

package Auth

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/go-sql-driver/mysql"
	"github.com/gorilla/sessions"
	"github.com/joho/godotenv"
)

var store = sessions.NewCookieStore([]byte("secret-key")) // Replace with your own secret key
var Db *sql.DB

func ConnectDB() *sql.DB {
	err1 := godotenv.Load()
	if err1 != nil {
		log.Fatal("Error loading .env file")
	}
	cfg := mysql.Config{
		User:                 os.Getenv("DBUSER"),
		Passwd:               os.Getenv("DBPASS"),
		Net:                  "tcp",
		Addr:                 "127.0.0.1:3306",
		DBName:               "auth",
		AllowNativePasswords: true,
	}
	// Get a database handle.
	var err error
	Db, err = sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		log.Fatal(err)
	}

	pingErr := Db.Ping()
	if pingErr != nil {
		log.Fatal(pingErr)
	}
	log.Println("Connected to database")
	return Db
}
func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	type User struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	var user User
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	json.Unmarshal(body, &user)
	defer r.Body.Close()
	fmt.Println(user.Username, user.Password)

	session, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, "Failed to get session", http.StatusInternalServerError)
		return
	}
	if user.Username == "shaeel" && user.Password == "123" {
		session.Values["username"] = user.Username
		session.Save(r, w)
		response := map[string]string{
			"message": "Login successful",
			"user":    user.Username,
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	} else {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
	}
}
func IsloggedIn(w http.ResponseWriter, r *http.Request) {
	session, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, "Failed to get session", http.StatusInternalServerError)
		return
	}
	if session.Values["username"] == nil {
		http.Error(w, "Not logged in", http.StatusUnauthorized)
		return
	}
	response := map[string]string{
		"message": "Logged in",
		"user":    session.Values["username"].(string),
	}
	fmt.Println("Logged in user:", session.Values["username"].(string))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

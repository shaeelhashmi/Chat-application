package configurations

import (
	"database/sql"
	"log"
	"os"

	"github.com/go-sql-driver/mysql"
	"github.com/gorilla/sessions"
	"github.com/joho/godotenv"
)

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

func ConfigSessions() *sessions.CookieStore {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	var store = sessions.NewCookieStore([]byte("secret-key"))
	// Configure session options
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   3600,
		HttpOnly: true,
		Secure:   true,
	}
	return store

}

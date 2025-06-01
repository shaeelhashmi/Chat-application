package GiveFriends

import (
	"database/sql"
	"fmt"
)

type Friend struct {
	Friends string `json:"friend"`
	Id      int    `json:"id"`
}

func GiveFriends(DB *sql.DB, userID int, query string) ([]Friend, error) {
	var secondQuery string
	if query == "Friend1" {
		secondQuery = "Friend2"
	} else {
		secondQuery = "Friend1"
	}
	dbQuery := fmt.Sprintf("SELECT id, %s FROM friends WHERE %s=?", secondQuery, query)
	rows, err := DB.Query(dbQuery, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var friends []Friend
	for rows.Next() {
		var Friendid int
		var friend int
		if err := rows.Scan(&Friendid, &friend); err != nil {
			return nil, err
		}
		var friendName string
		err = DB.QueryRow("SELECT username FROM users WHERE id=?", friend).Scan(&friendName)
		if err != nil {
			return nil, err
		}
		friends = append(friends, Friend{Friends: friendName, Id: Friendid})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return friends, nil
}

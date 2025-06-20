# Chat-application
## Summary:
This project is built using Golang, React and SQL with the integration of web sockets for real-time communication between users
## Features
- Real time communication
- Adding, removing and blocking friends
- Storing user history and interactions with other users
## Getting started:
### Prerequisites:
- XAAMP server
- Golang
- Node.js
### Video demonstration:
Watch this video to see the website in action. Video link [here](https://www.youtube.com/watch?v=6v7y6cmazsw)
### Installation:
* You can install the zip file of the project from [here](https://github.com/shaeelhashmi/Chat-application)
* If you have git installed type
```
git clone https://github.com/shaeelhashmi/Chat-application
```
### Execution:
Do the following thing in your MySQL shell
- Create a database name auth
- Table creation, type the following commands to create the tables
```
CREATE TABLE `users` (
  `id` int(255) NOT NULL AUTO_INCREMENT,
  `username` varchar(15) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `salt` blob DEFAULT NULL,
  `fullName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) 
```
```
CREATE TABLE `sessions` (
  `username` varchar(15) NOT NULL,
  `sessionID` varchar(255) NOT NULL,
  `EndDate` datetime DEFAULT (current_timestamp() + interval 1 hour),
  PRIMARY KEY (`username`)
)
```
```
CREATE TABLE `friends` (
  `id` int(255) NOT NULL AUTO_INCREMENT,
  `Friend1` int(255) DEFAULT NULL,
  `Friend2` int(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `Friend1` (`Friend1`),
  KEY `Friend2` (`Friend2`),
  CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`Friend1`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`Friend2`) REFERENCES `users` (`id`) ON DELETE CASCADE
) 
```
```
CREATE TABLE `requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender` int(255) DEFAULT NULL,
  `receiver` int(255) DEFAULT NULL,
  `status` enum('Pending','Accepted') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `sender` (`sender`),
  KEY `receiver` (`receiver`),
  CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`sender`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`receiver`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) 
```
```
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender` int(255) DEFAULT NULL,
  `receiver` int(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `sender` (`sender`),
  KEY `receiver` (`receiver`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) 
```
```
CREATE TABLE `events` (
  `id` int(255) NOT NULL AUTO_INCREMENT,
  `Evnt` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `relatedTo` int(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `events_ibfk_1` (`relatedTo`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`relatedTo`) REFERENCES `users` (`id`) ON DELETE CASCADE
) 
```
```
CREATE TABLE `blocked_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `blocked_by` int(11) DEFAULT NULL,
  `blocked` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `blocked` (`blocked`),
  KEY `blocked_users_ibfk_1` (`blocked_by`),
  CONSTRAINT `blocked_users_ibfk_1` FOREIGN KEY (`blocked_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blocked_users_ibfk_2` FOREIGN KEY (`blocked`) REFERENCES `users` (`id`)
)
```
Once in the Chat-application folder run: 
```
  cd backend
```
In this directory [set up your .env file](#setting-up-env) and then run
```
go run main.go
```
Then start the frontend server by typing the following commands in the terminal at the root directory:
```
cd chat-app-frontend
```
Once in the directory install the necessary packages.
```
npm install
```
After installation start the server.
```
npm run dev
```
### Setting up .env
The env file has this format:
</br>
` DBUSER="Your database username" `
</br>
` Address="Backend server link" `
</br>
` DBPASS="Database password" `
</br>
` SESSION_KEY="A random key for creating a secure session" `

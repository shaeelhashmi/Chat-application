import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Main() {
    const navigate = useNavigate();
    const [user, setUser] = useState("");
    const [wsMessage, setWsMessage] = useState("");
    const [messages, setMessages] = useState<string>("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                console.log("Fetching user...");
                const response = await axios.get("http://localhost:8080/isloggedin", { withCredentials: true });
                setUser(response.data.user);
                console.log(response.data)
            } catch (error) {
                navigate("/auth/login");
            }
        };
        fetchUser();
        const socket = new WebSocket("ws://localhost:8080/ws")

try {
        socket.addEventListener("open", event => {
        socket.send(user)
        socket.send("Connection established")
        });

// Listen for messages
    socket.addEventListener("message", event => {
        console.log("Message from server ", event.data);
      setMessages(event.data)
    });
}catch (error) {
    console.log(error)
}
    }, []);

    return (
        <div>
            <button onClick={() => {
                axios.get("http://localhost:8080/auth/logout", { withCredentials: true })
                    .then((res) => {
                        console.log(res.data);
                        navigate("/auth/login");
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }}>Logout</button>
            <input type="text" value={wsMessage} onChange={(e) => setWsMessage(e.target.value)} />
            <button onClick={() => {
                const socket = new WebSocket("ws://localhost:8080/ws?user="+user+"&receiver=abcde");
                socket.addEventListener("open", event => {
                    socket.send(wsMessage);
                });
            }}>Send</button>
            <p>{messages}</p>
        </div>
    );
}
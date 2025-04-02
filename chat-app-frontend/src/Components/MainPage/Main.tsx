import { useEffect, useState } from "react";
import axios from "axios";
import ChatSideBar from "./ChatSideBar";

export default function Main() {

    const [users, setUsers] = useState<string[]>([]);
    useEffect(() => {
        
      
        const fetchusers =async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/users", { withCredentials: true });
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
        fetchusers();
    }, []);
    
    return (
        <div className='grid grid-cols-[20%,1fr] w-[95vw]'>
            <ChatSideBar users={users}/>
        </div>
    );
}
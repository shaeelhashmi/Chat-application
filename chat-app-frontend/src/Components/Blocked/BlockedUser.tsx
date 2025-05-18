import axios from "axios"
import { useEffect, useState } from "react";
interface BlockedUser {
    id: string;
    username: string;
    created_at: Date;
}
export default function BlockedUser() {
    const [block,setBlocked]=useState<BlockedUser[]>([])
    const fetchBlockedUsers = async () => {
        try {
        const response = await axios.get("http://localhost:8080/api/friends/blocked", { withCredentials: true });
        setBlocked(response.data);
        console.log(response.data);
        } catch (error) {
        console.error("Error fetching blocked users:", error);
        }
    }
    useEffect(() => {
        fetchBlockedUsers();
    }, []);
  return (
    <div className="sm:mt-28 mt-36  ml-20">
    {
    block != null && block.length > 0  ?
    <>
    <div className="w-full text-black mt-16">
        <h1 className="text-4xl font-bold text-center">Blocked Users</h1>
        </div>
{block.map((user: BlockedUser) => (
  <div key={user.id } className="  my-8 text-black grid grid-cols-2 justify-between bg-gray-300 p-4 rounded-lg shadow-md">
          <p className="text-start sm:text-base text-sm my-3">{user.username}</p>
          <div className="justify-self-end">
            <button className="bg-green-400 p-3 rounded-md justify-self-end my-3" onClick={()=>{
            axios.get(`http://localhost:8080/unblock?blockedid=${user.id}`, { withCredentials: true })
          }}>Unblock user</button>   </div>
          <p className="text-start sm:text-sm text-[0.6rem] justify-self-end col-start-2">Blocked on: {user.created_at.toLocaleString()}</p>
       
        </div>
))}
  
    </>:
  
        <h1 className="text-4xl font-bold text-center">No Blocked Users</h1>
 
}
    </div>
  )
}

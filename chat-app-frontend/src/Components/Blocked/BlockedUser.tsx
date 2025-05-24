import axios from "axios"
import { useEffect, useState } from "react";
import TextBox from "../Util/TextBox";
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
        <h1 className="sm:text-4xl text-2xl font-bold text-center">Blocked Users</h1>
        </div>
{block.map((user: BlockedUser) => (

  <TextBox handleSubmit={()=>{
    try{
    axios.get(`http://localhost:8080/unblock?blockedid=${user.id}`, { withCredentials: true })

    }catch (error){

    }
  }}
  element={{id:+user.id,text:user.username,created_at:user.created_at}}
  buttonText="Unblock user"
  buttonColor="bg-green-300 hover:bg-green-400 transition duration-500 ease-in-out"
  dateRepresentation="Blocked on: "
  />
 
      
))}
  
    </>:
  
        <h1 className="sm:text-4xl text-2xl font-bold text-center">No Blocked Users</h1>
 
}
    </div>
  )
}

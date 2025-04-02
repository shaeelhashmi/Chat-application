import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import FriendPopup from "./Popups/FriendPopup";
interface NavbarProps {
  users: string[];
}
export default function Navbar(props: NavbarProps) {
  const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();
  return (
    <div className="fixed top-0 w-screen p-3 bg-[#13135b] flex justify-end z-50 items-end">
      {showPopup && <FriendPopup users={props.users} setState={setShowPopup}/>}
       <div className="justify-self-end pr-10">
        <button className="bg-[#127834] p-2 rounded-md text-white mr-4" onClick={()=>{
          setShowPopup(!showPopup)
        }}>Add friends</button>
        <button className="bg-[#1d1d7d] p-2 rounded-md text-white"
        onClick={() => {
            axios.get("http://localhost:8080/auth/logout", { withCredentials: true })
                .then(() => navigate("/auth/login"))
                .catch((err) => console.error("Logout error:", err));
        }}>Logout</button>
       </div>
    </div>
  )
}

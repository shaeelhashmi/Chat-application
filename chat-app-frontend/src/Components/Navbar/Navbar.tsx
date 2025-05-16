import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import FriendPopup from "./Popups/FriendPopup";
import { Link } from "react-router-dom";
import {useSelector} from "react-redux";
interface NavbarProps {
  users: string[];
}
export default function Navbar(props: NavbarProps) {
  const [user,setUser]=useState<string>("")
  const selector=useSelector((state:any)=>state.userName)
  const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
      setUser(selector.userName)
    },[selector])
  return (
    <div className="fixed top-0 w-screen p-3 pt-4 bg-[#d3d3ff] flex z-50  ">
      {showPopup && <FriendPopup users={props.users} setState={setShowPopup}/>}

      <div className=" w-1/2 pr-10">
        <h1 className="text-black text-2xl font-bold">{user}</h1>
      </div>
      <div className="w-full pr-10 relative top-1">
        <Link to="/chat" className="text-white w-[49px] p-2 bg-[#d7d7fd] bg-opacity-50  hover:shadow-xl duration-500 transition-all mx-3 text-black border-b-2 border-[#9898ff]">Home</Link>
        <Link to="/requests/recieved" className="text-black w-[49px] p-2 bg-[#d7d7fd] bg-opacity-50  hover:shadow-xl duration-500 transition-all mx-3 border-b-2 border-[#9898ff]">Pending requests</Link>
        <Link to="/requests/sent" className="text-black w-[49px] p-2 bg-[#d7d7fd] bg-opacity-50  hover:shadow-xl duration-500 transition-all mx-3 border-b-2 border-[#9898ff]">Sent requests</Link>
        <Link to="/settings" className="text-black w-[49px] p-2 bg-[#d7d7fd] bg-opacity-50  hover:shadow-xl duration-500 transition-all mx-3 border-b-2 border-[#9898ff]">Settings</Link>
      </div>
       <div className="flex justify-end w-full ">
       <div className=" pr-10">
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
       
    </div>
  )
}

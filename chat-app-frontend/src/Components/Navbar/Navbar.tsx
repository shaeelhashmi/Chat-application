import axios from "axios";
import Elipsis from "../SVG/Elipsis";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import FriendPopup from "./Popups/FriendPopup";
import { Link } from "react-router-dom";
import {useSelector} from "react-redux";
import Hamburger from "../SVG/Hamburger";
import { useDispatch } from "react-redux";
import { setSidebar } from "../Slice/SideBar";
interface NavbarProps {
  users: string[];
}
export default function Navbar(props: NavbarProps) {
  const dispatch = useDispatch();
  const [user,setUser]=useState<string>("")
  const selector=useSelector((state:any)=>state.userName)
  const [showPopup, setShowPopup] = useState(false);
  const [options,setOptions]=useState(false)
    const navigate = useNavigate();
    useEffect(() => {
      setUser(selector.userName)
    },[selector])
  return (
    <div className="fixed top-0 w-screen lg:p-3 p-1 py-4 bg-[#d3d3ff] grid  z-50  grid-cols-[20%,70%,10%]">
      {showPopup && <FriendPopup users={props.users} setState={setShowPopup}/>}

      <div className=" w-1/2 lg:pr-10 pr-2 flex flex-row gap-2">
        <button className=" flex items-center justify-center" onClick={()=>{dispatch(setSidebar())}}>
          <Hamburger />
        </button>
        <div className="flex items-center justify-center">
        <h1 className="text-black lg:text-lg font-bold text-sm">{user}</h1>
        </div>
  
      </div>
      <div className="w-full pr-10 relative top-1 grid lg:grid-cols-4 grid-cols-2 lg:gap-0">
        <div>
        <Link to="/chat" className="text-black w-16 p-2 bg-[#d7d7fd] bg-opacity-50  hover:shadow-xl duration-500 transition-all mx-3 text-black border-b-2 border-[#9898ff] text-[0.6rem] sm:text-[0.7rem] lg:text-sm">Home</Link>
        </div>
        <div>
        <Link to="/requests/recieved" className="text-black w-16 p-2 bg-[#d7d7fd] bg-opacity-50  hover:shadow-xl duration-500 transition-all mx-3 border-b-2 border-[#9898ff] text-[0.6rem] sm:text-[0.7rem] lg:text-sm">Pending requests</Link>
        </div>
        <div>
        <Link to="/requests/sent" className="text-black w-16 p-2 bg-[#d7d7fd] bg-opacity-50  hover:shadow-xl duration-500 transition-all mx-3 border-b-2 border-[#9898ff] text-[0.6rem] sm:text-[0.7rem] lg:text-sm">Sent requests</Link>
        </div>
        <div>
        <Link to="/settings" className="text-black w-16 p-2 bg-[#d7d7fd] bg-opacity-50  hover:shadow-xl duration-500 transition-all mx-3 border-b-2 border-[#9898ff] text-[0.6rem] sm:text-[0.7rem] lg:text-sm">Settings</Link>
        </div>
      </div>
       <div className="flex justify-end w-full ">
        <div>
          <button onClick={()=>setOptions(!options)} >
                <Elipsis/>
          </button>
    
        <div className={` ${options?"scale-100":"scale-0"} transition-all duration-500 absolute top-10 right-2 origin-top-right `}>
        <div className="py-4  flex flex-col items-center justify-center relative top-2  sm:w-[200px] w-[100px] bg-[#bdbdf9] text-[0.6rem] sm:text-[0.7rem] lg:text-sm">
          <div className="w-full"><button className="border-b-2 border-white w-full my-2 py-3 hover:bg-[#a3a3ff] duration-500 transition-all" onClick={()=>{
          setShowPopup(!showPopup)
        }}>Add friends</button></div>
          <div className="w-full">  <button className="border-b-2 border-white w-full my-2 py-3 hover:bg-[#a3a3ff] duration-500 transition-all" onClick={() => {
            axios.get("http://localhost:8080/auth/logout", { withCredentials: true })
                .then(() => navigate("/auth/login"))
                .catch((err) => console.error("Logout error:", err));
        }}>Logout</button></div>
          
        
          </div>
          </div>
          </div>

       </div>
       
    </div>
  )
}

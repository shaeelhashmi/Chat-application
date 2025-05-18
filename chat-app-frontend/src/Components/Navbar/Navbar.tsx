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
import { setSettingsidebar } from "../Slice/SettingSidebar";
import { House } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { UserCheck } from 'lucide-react';
import { Settings } from 'lucide-react';
import ToolTipbtn from "./ToolTip/ToolTipbtn";
interface NavbarProps {
  users: string[];
}
export default function Navbar(props: NavbarProps) {
  const dispatch = useDispatch();
  const [user,setUser]=useState<string>("")
  const selector=useSelector((state:any)=>state.userName)
  const [showPopup, setShowPopup] = useState(false);
  const [options,setOptions]=useState(false)
  const [isSetting, setIsSetting] = useState(false)
    const navigate = useNavigate();
    useEffect(() => {
      console.log(window.location.pathname)
  if (window.location.pathname.startsWith("/settings")) {
          console.log(window.location.pathname)
    setIsSetting(true);
  }
}, []);
    useEffect(() => {
      setUser(selector.userName)
    },[selector])
  return (
    <nav className="fixed top-0 w-screen   bg-[#d3d3ff] grid  z-50  xsm:grid-cols-[30%,1fr,5%] grid-cols-[40%,1fr,5%] md:grid-cols-[20%,1fr,5%]">
      {showPopup && <FriendPopup users={props.users} setState={setShowPopup}/>}

      <div className=" lg:pr-10 pr-2 flex flex-row xxs:gap-2 gap-0">
        <button className=" flex items-center justify-center" onClick={()=>{
          if(isSetting){
            dispatch(setSettingsidebar())
            return
          }
          dispatch(setSidebar())
          }}>
          <Hamburger />
        </button>
        <div className="flex items-center justify-center">
        <h1 className="text-black lg:text-lg font-bold text-sm xxs:text-[0.8rem]">{user}</h1>
        </div>
  
      </div>
      <div className="w-full pr-10  flex justify-center items-start sm:gap-20 xsm:gap-10 gap-2">
        <div>
        <Link to="/chat" className="mx-3 " onClick={()=>setIsSetting(false)}><ToolTipbtn text={<House className="sm:w-[24px] w-[15px]"/>} info="Home"/></Link>
        </div>
        <div>
        <Link to="/requests/recieved" className=" mx-3 " onClick={()=>setIsSetting(false)}><ToolTipbtn text={<UserCheck className="sm:w-[24px] w-[15px]"/>} info="Recieved requests"/></Link>
        </div>
        <div>
        <Link to="/requests/sent" className=" mx-3" onClick={()=>setIsSetting(false)}>
        <ToolTipbtn text={<ArrowUpRight className="sm:w-[24px] w-[15px] "/>} info="Sent requests"/></Link>
        </div>
        <div>
        <Link to="/settings" className=" mx-3 " onClick={()=>setIsSetting(true)}><ToolTipbtn text={<Settings className="sm:w-[24px] w-[15px]"/>} info="Settings"/></Link>
        </div>
      </div>
       <div className="flex justify-end w-full ">
        <div>
          <div className="items-center justify-center flex relative top-7">
          <button onClick={()=>setOptions(!options)} className="xsm:mr-3 mr-1">
                <Elipsis/>
          </button>
          </div>
    
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
       
    </nav>
  )
}

import axios from "axios";
import { Ellipsis } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import FriendPopup from "./Popups/FriendPopup";
import { Link } from "react-router-dom";
import {useSelector} from "react-redux";
import { Menu } from 'lucide-react';
import { useDispatch } from "react-redux";
import { setSidebar } from "../Slice/SideBar";
import { setSettingsidebar } from "../Slice/SettingSidebar";
import { House } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { UserCheck } from 'lucide-react';
import { Settings } from 'lucide-react';
import ToolTipbtn from "./ToolTip/ToolTipbtn";
import { setPage } from '../../Components/Slice/CurrentPage';
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
      if (
         !( window.location.pathname.startsWith('/chat') &&
          window.location.pathname.startsWith('/settings') &&
          window.location.pathname.split('/').length <= 2)
        ) {
         dispatch(setPage(" "));
        }
  if (window.location.pathname.startsWith("/settings")) {
    setIsSetting(true);
  }
}, []);
    useEffect(() => {
      setUser(selector.userName)
    },[selector])
  return (
    <nav className="fixed top-0 w-screen   bg-black grid  z-20  xsm:grid-cols-[30%,1fr,5%] grid-cols-[40%,1fr,5%] md:grid-cols-[20%,1fr,5%] text-white">
      {showPopup && <FriendPopup users={props.users} setState={setShowPopup}/>}

      <div className=" lg:pr-10 pr-2 flex flex-row xxs:gap-2 gap-0">
        <button className=" flex items-center justify-center" onClick={()=>{
          if(isSetting){
            dispatch(setSettingsidebar())
            return
          }
          dispatch(setSidebar())
          }}>
          <Menu className="lg:hidden block"/>
        </button>
        <div className="flex items-center justify-center">
        <h1 className="text-white lg:text-xl font-bold text-[0.8rem] xxs:text-lg">{user}</h1>
        </div>
  
      </div>
      <div className="w-full pr-10  flex justify-center items-start sm:gap-20 xsm:gap-10 gap-3">
        <div>
        <Link to="/chat" className="mx-3 bg-[#ffffff] " onClick={()=>{setIsSetting(false) 
        dispatch(setPage(" "));}}><ToolTipbtn text={<House className="sm:w-[24px] w-[15px]" />} bg="bg-[#212121] " info="Home" link="chat"/></Link>
        </div>
        <div>
        <a href="/requests/recieved" className=" mx-3 " onClick={()=>setIsSetting(false)}><ToolTipbtn bg="bg-[#212121] " text={<UserCheck className="sm:w-[24px] w-[15px]"/>} info="Recieved requests" link="requests/recieved"/></a>
        </div>
        <div>
        <a href="/requests/sent" className=" mx-3" onClick={()=>setIsSetting(false)}>
        <ToolTipbtn bg="bg-[#212121]" text={<ArrowUpRight className="sm:w-[24px] w-[15px] "/>} info="Sent requests" link="requests/sent"/></a>
        </div>
        <div>
        <Link to="/settings" className=" mx-3 " onClick={()=>{setIsSetting(true)
          dispatch(setPage(" "));
        }}><ToolTipbtn bg="bg-[#212121] " text={<Settings className="sm:w-[24px] w-[15px]"/>} info="Settings"  link="settings"/></Link>
        </div>
      </div>
       <div className="flex justify-end w-full ">
        <div>
          <div className="items-center justify-center flex relative top-7">
          <button onClick={()=>setOptions(!options)} className="xsm:mr-3 mr-1 relative right-5">
                <Ellipsis/>
          </button>
          </div>
    
        <div className={` ${options?"scale-100":"scale-0"} transition-all duration-500 absolute top-10 right-2 origin-top-right `}>
        <div className="py-4  flex flex-col items-center justify-center relative top-2  sm:w-[200px] w-[100px] bg-[#111111] lg:text-sm">
          <div className="w-full"><button className="  w-full my-2 py-3 hover:bg-[#262626] duration-500 transition-all" onClick={()=>{
          setShowPopup(!showPopup)
        }}>Add friends</button></div>
          <div className="w-full">  <button className="  w-full my-2 py-3 hover:bg-[#262626] duration-500 transition-all" onClick={() => {
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

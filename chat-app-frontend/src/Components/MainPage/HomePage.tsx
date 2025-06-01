import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setPage } from "../Slice/CurrentPage";
import { Dot } from 'lucide-react';
export default function HomePage(props:{
  socket: React.RefObject<WebSocket | null>;
  sessionID: string;
  onlineUsers: string[];
}) {
  const dispatch = useDispatch();
useEffect(()=>{
 console.log("Online",props.onlineUsers)
 },[props.onlineUsers])
  useEffect(() => {
    dispatch(setPage(window.location.pathname.slice(1)));
    
    
  }, []);
  
  return (
    <>
    <div className="mt-20 flex justify-center items-center flex-col text-white p-3 ml-2">
    <div className="my-5  lg:text-5xl font-bold text-center sm:text-4xl  text-3xl">
      <h1>Welcome to We Chat</h1>
    </div>
    <div className="my-5"><p className="sm:text-base text-sm " >Select a chat to start messaging</p></div>
    {
      props.onlineUsers && props.onlineUsers.length>0?
    <div className="my-5 w-full flex justify-center flex-col ml-5">
      <p className="text-center lg:text-2xl sm:text-xl text-lg font-bold my-3">Online Users</p>
      {
        props.onlineUsers?.map((user: string, index: number) => (
          <div key={index} className="w-full bg-[#080628] text-white p-2 rounded-md flex justify-between items-center mx-auto">
            <p className="lg:text-md sm:text-sm text-xs">{user}</p>
            <p className="text-green-700"><Dot size={"50"}></Dot></p>
          </div>
        ))
      }
    </div>:
    <div className="my-5 w-full flex justify-center flex-col ml-5">
      <p className="text-center lg:text-2xl sm:text-xl text-lg font-bold my-3">No one is online right now</p>
    </div>
}
    </div>
    </>
  )
}

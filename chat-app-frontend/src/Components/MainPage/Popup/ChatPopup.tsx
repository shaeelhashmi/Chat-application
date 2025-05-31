import { useState } from "react";
import { CircleEllipsis } from "lucide-react";
interface user{
    id: string;
    friend: string;
}
interface ChatPopupProps {
    user: user;
    removeFriend: (id:string|undefined,name: string|undefined) => void;
    handleBlock: (id:string|undefined,name: string|undefined) => void;
}
export default function ChatPopup(props: ChatPopupProps) {
    const [popup,setPopup]=useState(false)
    const {id, friend} = props.user;
  return (
    <>
        <div className="flex justify-end text-white">
       <button  onClick={()=>setPopup(!popup)}>
        <CircleEllipsis className=" text-white"/>
        </button>
        </div>
        <div className={`text-sm relative lg:right-32 right-24 bg-[#111111]  w-[150px] flex justify-center flex-col ${popup ? "scale-100":"scale-0"} transition-all duration-500 ease-in-out origin-top-right p-2 rounded-lg shadow-lg`} onClick={()=>setPopup(!popup)}>
          <button className=" text-center my-2 hover:bg-[#262626]  p-2 duration-500 transition-all text-white" onClick={()=>props.handleBlock(id,friend)}>Block</button>
          <br/>
          <button className=" text-center my-2 hover:bg-[#262626]  p-2 duration-500 transition-all text-white"  onClick={()=>props.removeFriend(id,friend)}>Unfriend</button>
          <br/>
          <a className="text-center  my-2 hover:bg-[#262626] p-2 duration-500 transition-all  text-white" href={`/friend/${props.user.id}/${props.user.friend}`}>Profile information</a>
          </div>
    </>
  )
}

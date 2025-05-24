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
        <div className="flex justify-end ">
       <button  onClick={()=>setPopup(!popup)}>
        <CircleEllipsis/>
        </button>
        </div>
        <div className={`text-sm relative lg:right-32 right-24 bg-[#abff6b]  w-[150px] flex justify-center flex-col ${popup ? "scale-100":"scale-0"} transition-all duration-500 ease-in-out origin-top-right p-2 rounded-lg shadow-lg`} onClick={()=>setPopup(!popup)}>
          <button className=" border-[#ffffff] border-b-2 my-2 hover:bg-[#c2ff94]  p-2 duration-500 transition-all" onClick={()=>props.handleBlock(id,friend)}>Block</button>
          <br/>
          <button className=" border-[#ffffff] border-b-2 my-2 hover:bg-[#c2ff94]  p-2 duration-500 transition-all"  onClick={()=>props.removeFriend(id,friend)}>Unfriend</button>
          <br/>
          <a className="text-center border-[#ffffff] border-b-2 my-2 hover:bg-[#c2ff94] p-2 duration-500 transition-all " href={`/friend/${props.user.id}/${props.user.friend}`}>Profile information</a>
          </div>
    </>
  )
}

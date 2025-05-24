import { useEffect } from "react";
import { useSelector } from "react-redux";
import Coverpage from "../Coverpage";
import ChatPopup from "./Popup/ChatPopup";


interface ChatSideBarProps {
    users: any[];
    removeFriend: (id:string|undefined,name: string|undefined) => void;
    handleBlock: (id:string|undefined,name: string|undefined) => void;
}

export default function ChatSideBar(props: ChatSideBarProps) {
  const selector = useSelector((state: any) => state.show);
  useEffect(() => {
    console.log(selector);
  }, [selector]);

  return (  
    <>
   
    <div>
      {selector.open && <Coverpage />}

    <aside className={`lg:w-1/5 sm:w-[70%] bg-[#dafdc0] p-4  xsm:w-[80%] w-[90%]  h-screen fixed left-0 mx-0 overflow-y-auto  ${selector.open ?"scale-100":"scale-0"} transition-all duration-500 ease-in-out origin-top-left z-10 overflow-hidden`}>
        <div className="mt-16">
      {props.users?.map((user, index) => (
        <div key={index} className="grid items-center cursor-pointer grid-cols-[90%,10%] gap-2 my-4">
          <a className="text-black p-4  hover:bg-[#e6fdd1] text-start border-[#ffffff] border-b-2  transition-all duration-500 py-2" href={`/chat/${user.friend}`}>{user.friend}</a>
          <div className=" h-[20px]">
           <ChatPopup user={user} removeFriend={props.removeFriend} handleBlock={props.handleBlock}/>
        </div>
        </div>
     
      ))}
      </div>
    
    </aside>
    </div>

  
    </>
  )
}

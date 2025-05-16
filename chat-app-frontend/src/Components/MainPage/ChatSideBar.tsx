
interface ChatSideBarProps {
    users: any[];
}

export default function ChatSideBar(props: ChatSideBarProps) {

  return (  
    <>
   
    <div>
    <aside className="w-1/5 bg-[#cbcbff] p-4  h-screen fixed left-0 mx-0 overflow-y-auto">
        <div className="mt-16">
      {props.users?.map((user, index) => (
        <div key={index} className="grid items-center cursor-pointer grid-cols-[70%,30%] gap-2">
          <a className="text-black p-4  hover:bg-[#d5d5fa] text-start border-[#ffffff] border-b-2  transition-all duration-500 py-2" href={`/chat/${user.friend}`}>{user.friend}</a>
            <a className=" transition-all duration-500 flex items-center justify-center  text-black rounded-md bg-[#c5c5ff] p-1 hover:bg-[#bdbdff] py-2" href={`/friend/${user.id}/${user.friend}`}>
              Options
            </a>

        </div>
     
      ))}
      </div>
    
    </aside>
    </div>

  
    </>
  )
}

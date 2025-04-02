import MessageBody from './MessageBody';
interface ChatSideBarProps {
    users: string[];
}
export default function ChatSideBar(props: ChatSideBarProps) {
  return (  
    <>
    <div className='grid grid-cols-[20%,1fr] w-[95vw]'>
    <div>
    <aside className="w-1/5 bg-[#13135b] p-4  h-screen fixed left-0 mx-0">
        <div className="mt-10">
      {props.users.map((user, index) => (
        <div key={index} className="flex items-center cursor-pointer ">
          <a className="text-white p-4 w-[100%] hover:bg-[#141474] text-start border-[#141474] border-b-2  transition-all duration-500" href={`?reciever=${user}`}>{user}</a>
        </div>
      ))}
      </div>
    
    </aside>
    </div>
    <MessageBody  ></MessageBody>
    </div>
    </>
  )
}

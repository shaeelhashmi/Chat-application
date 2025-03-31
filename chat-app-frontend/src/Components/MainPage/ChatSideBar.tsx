
interface ChatSideBarProps {
    users: string[];
}
export default function ChatSideBar(props: ChatSideBarProps) {
  return (
    <aside className="w-1/5 bg-[#13135b] p-4  h-screen fixed left-0 mx-0">
        <div className="mt-10">
      {props.users.map((user, index) => (
        <div key={index} className="flex items-center mb-2 p-0 py-4 cursor-pointer border-[#141474] border-b-2 hover:bg-[#141474]">
          <span className="text-white p-1">{user}</span>
        </div>
      ))}
      </div>
    </aside>
  )
}

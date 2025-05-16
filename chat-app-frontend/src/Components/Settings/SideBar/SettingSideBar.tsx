import { Link } from "react-router-dom"

export default function SettingSideBar() {
  return (
    <>
        <div>
    <aside className="w-1/5 bg-[#cbcbff] py-4  h-screen fixed left-0 mx-0 overflow-y-auto">
        <div className="mt-16">
      
        <div  className="flex items-center cursor-pointer my-2">
          <Link className="text-black p-4  hover:bg-[#d5d5fa] text-start border-[#ffffff] border-b-2  transition-all duration-500 py-2 w-full" to='/settings/user'>Change UserName</Link>
        </div>
        <div  className="flex items-center cursor-pointer my-2">
          <Link className="text-black p-4  hover:bg-[#d5d5fa] text-start border-[#ffffff] border-b-2  transition-all duration-500 py-2 w-full" to='/settings/password'>Change Password</Link>
        </div>
         <div  className="flex items-center cursor-pointer my-2">
          <Link className="text-black p-4  hover:bg-[#d5d5fa] text-start border-[#ffffff] border-b-2  transition-all duration-500 py-2 w-full" to='/settings/activity'>Activity log</Link>
        </div>
      </div>
    
    </aside>
    </div>
    </>
  )
}

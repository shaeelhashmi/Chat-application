import { Link } from "react-router-dom"

export default function SettingSideBar() {
  return (
    <>
        <div>
    <aside className="w-1/5 bg-[#13135b] p-4  h-screen fixed left-0 mx-0 overflow-y-auto">
        <div className="mt-16">
      
        <div  className="flex items-center cursor-pointer ">
          <Link className="text-white p-4 w-[100%] hover:bg-[#141474] text-start border-[#141474] border-b-2  transition-all duration-500" to='/settings/user'>Change UserName</Link>
        </div>
        <div  className="flex items-center cursor-pointer ">
          <Link className="text-white p-4 w-[100%] hover:bg-[#141474] text-start border-[#141474] border-b-2  transition-all duration-500" to='/settings/password'>Change Password</Link>
        </div>
      </div>
    
    </aside>
    </div>
    </>
  )
}

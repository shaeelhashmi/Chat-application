import { Link } from "react-router-dom"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import Coverpage from "../../Coverpage"
export default function SettingSideBar() {
  const selector = useSelector((state: any) => state.showSetting)
  useEffect(() => {
    console.log(selector)
  }, [selector]);
  return (
    <>
        <div>
           {selector.open && <Coverpage />}
    <aside className={`lg:w-1/5 w-[90%] bg-[#dafdc0] p-4  h-screen fixed left-0 mx-0 overflow-y-auto  ${selector.open ?"scale-100":"scale-0"} transition-all duration-500 ease-in-out origin-top-left z-40`}>
        <div className="mt-16">
      
        <div  className="flex items-center cursor-pointer my-2">
          <Link className="text-black p-4  hover:bg-[#e6fdd1] text-start border-[#ffffff] border-b-2  transition-all duration-500 py-2 w-full" to='/settings/user'>Change UserName</Link>
        </div>
        <div  className="flex items-center cursor-pointer my-2">
          <Link className="text-black p-4  hover:bg-[#e6fdd1] text-start border-[#ffffff] border-b-2  transition-all duration-500 py-2 w-full" to='/settings/password'>Change Password</Link>
        </div>
         <div  className="flex items-center cursor-pointer my-2">
          <Link className="text-black p-4  hover:bg-[#e6fdd1] text-start border-[#ffffff] border-b-2  transition-all duration-500 py-2 w-full" to='/settings/activity'>Activity log</Link>
        </div>
        <div  className="flex items-center cursor-pointer my-2">
          <Link className="text-black p-4  hover:bg-[#e6fdd1] text-start border-[#ffffff] border-b-2  transition-all duration-500 py-2 w-full" to='/settings/blocked'>Blocked Users</Link>
          </div>
          <div  className="flex items-center cursor-pointer my-2">
          <Link className="text-black p-4  hover:bg-[#e6fdd1] text-start border-[#ffffff] border-b-2  transition-all duration-500 py-2 w-full" to='/settings/info'>Profile info</Link>
          </div>
        
        
      </div>
    
    </aside>
    </div>
    </>
  )
}

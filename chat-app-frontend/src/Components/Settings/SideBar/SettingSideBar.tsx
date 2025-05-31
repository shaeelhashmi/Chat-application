import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import Coverpage from "../../Coverpage"
import { setPage } from "../../Slice/CurrentPage"
export default function SettingSideBar() {
  const dispatch=useDispatch()
  const selector = useSelector((state: any) => state.showSetting)
  return (
    <>
        <div>
           {selector.open && <Coverpage />}
    <aside className={`lg:w-1/5 w-[90%] bg-black p-4  h-screen fixed left-0 mx-0 overflow-y-auto  ${selector.open ?"scale-100":"scale-0"} transition-all duration-500 ease-in-out origin-top-left z-10 lg:scale-100 mt-5`}>
        <div className="mt-16">
      
        <div  className="flex items-center cursor-pointer my-2">
            <Link
            className={`text-white p-4 hover:bg-[#212121] text-start transition-all duration-500 py-2 w-full ${
              window.location.pathname === "/settings/user" ? "bg-[#212121]" : ""
            }`}
            to='/settings/user' onClick={()=>{
              dispatch(setPage(" "))
            }}
            >
            Change user name
            </Link>
        </div>
        <div  className="flex items-center cursor-pointer my-2 sm:text-base text-sm">
          <Link className={`text-white p-4 hover:bg-[#212121] text-start transition-all duration-500 py-2 w-full ${
              window.location.pathname === "/settings/password" ? "bg-[#212121]" : ""
            }`} to='/settings/password' onClick={()=>{
              dispatch(setPage(" "))
            }}>Change password</Link>
        </div>
            <div  className="flex items-center cursor-pointer my-2">
          <Link className={`text-white p-4 hover:bg-[#212121] text-start transition-all duration-500 py-2 w-full ${
              window.location.pathname === "/settings/fullname" ? "bg-[#212121]" : ""
            }`} to='/settings/fullname' onClick={()=>{
              dispatch(setPage(" "))
            }}>Change full name</Link>
          </div>
         <div  className="flex items-center cursor-pointer my-2">
          <Link className={`text-white p-4 hover:bg-[#212121] text-start transition-all duration-500 py-2 w-full ${
              window.location.pathname === "/settings/activity" ? "bg-[#212121]" : ""
            }`} to='/settings/activity' onClick={()=>{
              dispatch(setPage(" "))
            }}>Activity log</Link>
        </div>
        <div  className="flex items-center cursor-pointer my-2">
          <Link className={`text-white p-4 hover:bg-[#212121] text-start transition-all duration-500 py-2 w-full ${
              window.location.pathname === "/settings/blocked" ? "bg-[#212121]" : ""
            }`} to='/settings/blocked' onClick={()=>{
              dispatch(setPage(" "))
            }}>Blocked users</Link>
          </div>
          <div  className="flex items-center cursor-pointer my-2">
          <Link className={`text-white p-4 hover:bg-[#212121] text-start transition-all duration-500 py-2 w-full ${
              window.location.pathname === "/settings/info" ? "bg-[#212121]" : ""
            }`} to='/settings/info' onClick={()=>{
              dispatch(setPage(" "))
            }}>Profile info</Link>
          </div>
      
          

        
        
      </div>
    
    </aside>
    </div>
    </>
  )
}

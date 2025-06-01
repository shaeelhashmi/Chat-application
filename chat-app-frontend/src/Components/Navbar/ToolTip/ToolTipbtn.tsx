import { useEffect,useState } from "react";
import { useSelector } from "react-redux";
interface ToolTipProps {
  text:React.ReactNode;
  bg?:string;
  info:string;
  link:string
}
export default function ToolTipbtn(props:ToolTipProps) {
  const [page,setPage]=useState<string>("")
  const selector=useSelector((state:any)=>state.currentPage.page)
  useEffect(()=>{
    setPage(selector)
  },[selector])
    
  return (
<div className={`group relative   w-fit sm:text-base text-sm text-white hover:bg-white/10  hover:rounded-full sm:p-2 p-1 duration-500 transition-all ${page==props.link?"bg-white/10  ":"bg-transparent"} rounded-full`}>
    <span>{props.text}</span>
    <div
      className={`${props.bg?props.bg:"bg-zinc-300"} p-2 rounded-md group-hover:flex hidden absolute -bottom-2 translate-y-full  -translate-x-1/2 left-1/2 `}
    >
      <span className="text-white whitespace-nowrap sm:text-base xsm:text-sm text-xs">{props.info}</span>
      <div
        className="bg-inherit rotate-45 p-2 absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2"
      ></div>
    </div>
  </div>
  )
}

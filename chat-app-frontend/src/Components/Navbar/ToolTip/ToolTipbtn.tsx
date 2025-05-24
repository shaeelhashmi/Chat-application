

export default function ToolTipbtn(props:any) {
  return (
<div className="group relative   w-fit sm:text-base text-sm">
    <span>{props.text}</span>
    <div
      className={`${props.bg?props.bg:"bg-zinc-300"} p-2 rounded-md group-hover:flex hidden absolute -bottom-2 translate-y-full  -translate-x-1/2 left-1`}
    >
      <span className="text-black whitespace-nowrap">{props.info}</span>
      <div
        className="bg-inherit rotate-45 p-2 absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2"
      ></div>
    </div>
  </div>
  )
}

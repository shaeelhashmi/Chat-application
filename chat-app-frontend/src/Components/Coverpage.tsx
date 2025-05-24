
export default function Coverpage(prop:{isMedia?:boolean}) {
  return (
    <div className={`fixed top-0 left-0 w-screen h-screen  bg-black bg-opacity-30 ${prop.isMedia?" z-30":"z-[5] lg:hidden"}`}>
      
    </div>
  )
}

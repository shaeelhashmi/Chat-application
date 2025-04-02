import Fuse from "fuse.js"
import { useState } from "react"
interface FriendPopupProps {
    users: string[]
    setState: React.Dispatch<React.SetStateAction<boolean>>
}
export default function FriendPopup(props: FriendPopupProps) {
    const options = {
        includeScore: true,
        threshold: 1,
    }
    const fuse = new Fuse(props.users, options)
    const [searchResults, setSearchResults] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState("")

  return (
<div className="h-screen w-screen bg-black bg-opacity-50 flex justify-center items-center absolute top-0 left-0 z-50">
    <div className=" bg-white shadow-lg rounded-md p-6 w-96 h-96">
        <h1 className="text-3xl text-center my-2 font-bold">Add friends</h1>
        <div className="flex flex-col">
            <div className="flex flex-col">
            <input type="text" placeholder="Search for friends" className="border p-2 rounded-md my-4" value={searchQuery} onChange={(e)=>{
                
                setSearchQuery(e.target.value)
                if (e.target.value.length === 0) {
                    console.log("searchQuery is empty")
                    setSearchResults([])
                    return
                }
                const results = fuse.search(searchQuery)
                const limitedResults = results.slice(0, 5).map(result => result.item);
                setSearchResults(limitedResults);
                
            }}/>
            <div className="h-10">
            <div className={`${searchResults.length==0?"bg-white rounded-none shadow-none":"bg-slate-200 rounded-b-md shadow-lg"} z-50  relative top-[-13px]  p-4 `}>
                {searchResults.map((user: string, index: number) => (
                    <div key={index}>
                        <button className="text-md border-b-2 w-full text-start p-1">
                            {user}
                        </button>
                    </div>
                ))}
            </div>
            </div>
            </div>
            <button className="bg-[#127834] p-2 rounded-md text-white my-4">Add</button>
            <button className="bg-[#1d1d7d] p-2 rounded-md text-white my-4" onClick={()=>{
                props.setState(false)
            }}>Cancel</button>
        </div>
    </div>
    </div>
  )
}

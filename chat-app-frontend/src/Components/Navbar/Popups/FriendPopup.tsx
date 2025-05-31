import Fuse from "fuse.js"
import { useState } from "react"
import axios from "axios"
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
    const [error,setError ] = useState("")
    const addFriend = async (friend: string) => {
        setError("")
        try{
            const response = await axios.post("http://localhost:8080/addfriend", {
               username:friend
            },{withCredentials: true})
            if (response.status === 200) {
                setError("Friend added successfully")
            } else {
                console.log("Error adding friend")
            }
        }
        catch (error:any) {
            console.log(error)
            setError(error.response?.data || error.message || "Error adding friend")
            console.log("Error adding friend")
        }
    }
  return (
<div className="h-screen w-screen bg-black bg-opacity-50 flex justify-center items-center absolute top-0 left-0 z-50" onClick={()=>{
    setSearchResults([])
}}>
    <div className=" bg-white shadow-lg rounded-md p-6 w-96 h-96">
        <h1 className="text-3xl text-center my-2 font-bold text-black">Add friends</h1>
        <div className="flex flex-col"> 
            <div className="flex flex-col">
            <input type="text" placeholder="Search for friends" className="border p-2 rounded-md my-4 text-black" value={searchQuery} onChange={(e)=>{
                
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
            <div className="h-4">
            <div className={`${searchResults.length==0?"bg-white rounded-none shadow-none":"bg-slate-200 rounded-b-md shadow-lg"} z-50  relative top-[-13px]  p-4 text-black`}>
                {searchResults.map((user: string, index: number) => (
                    <div key={index}>
                        <button className="text-md border-b-2 w-full text-start p-1" onClick={()=>{
                            setSearchQuery(user)
                            setSearchResults([])
                        }}>
                            {user}
                        </button>
                    </div>
                ))}
            </div>
            </div>
            <div className=" h-6 text-red-400 mb-1 text-center">
                {error}
            </div>
            </div>
            <button className="bg-[#127834] p-2 rounded-md text-white my-4 hover:bg-[#288246] duration-500 transition-all" onClick={() => addFriend(searchQuery)}>Add</button>
            <button className="bg-[#1d1d7d] p-2 rounded-md text-white my-4 hover:bg-[#2d2d8d] duration-500 transition-all" onClick={()=>{
                props.setState(false)
            }}>Cancel</button>
        </div>
    </div>
    </div>
  )
}

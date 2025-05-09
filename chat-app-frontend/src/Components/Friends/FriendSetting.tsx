import { useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { useEffect, useState } from "react"
import axios from "axios"
export default function FriendSetting() {
  const { id, name } = useParams()
  const [user,setUser]=useState<string>("")
  const [found,setFound]=useState<boolean>(true)
  const selector=useSelector((state:any)=>state.userName)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        await axios.get(`http://localhost:8080/friend/exists?friend=${name}&friendid=${id}`, {withCredentials:true});
      } catch (error) {
        setFound(false)

      }
    };
    fetchUser();
  },[])
  useEffect(() => {
    setUser(selector.userName)
    console.log(user)
  },[selector])
  useEffect(()=>{
    console.log(user)
  },[user])
 

  return (
    <>
   {
    found ?
    <div className="mt-20 text-white">
      <h2 className="text-4xl text-center">Friend </h2>
      <div className="mx-10">
      <h2 className="text-2xl">Id information</h2>
      <p className="text-md ">Name:{name}</p>
      <div className="flex gap-2 justify-center items-center mt-5 w-full">
      <button onClick={() => alert("Unfriend functionality not implemented yet")} className="rounded-md bg-red-500 text-white px-4 py-2 hover:bg-red-600 transition duration-300">
        Unfriend
      </button>
      <button onClick={() => alert("Block functionality not implemented yet")} className="rounded-md bg-red-500 text-white px-4 py-2 hover:bg-red-600 transition duration-300">
        Block
      </button>
      </div>
      </div>
    </div>
    :
    <div className="mt-20 text-white">
      <h2 className="text-4xl text-center">Friend not found</h2>
      </div>
    }
    </>
  )
}

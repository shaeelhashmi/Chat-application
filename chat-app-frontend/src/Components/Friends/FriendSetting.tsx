import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
interface props
{
  removeFriend: (id: string|undefined, name: string|undefined) => void;
  handleBlock: (id: string|undefined, name: string|undefined) => void;
}
export default function FriendSetting(props: props) {
  const { id, name } = useParams()
  const [found,setFound]=useState<boolean>(true)
  const [fullName,setName]=useState<string>("")
  
  const {removeFriend, handleBlock } = props;
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response=await axios.get(`http://localhost:8080/friend/exists?friend=${name}&friendid=${id}`, {withCredentials:true});
        setName(response.data)
      } catch (error) {
        setFound(false)
      }
    };
    fetchUser();
  },[])
 

  return (
    <>
   {
    found ?
    <div className="mt-20 text-white sm:text-lg xsm:text-sm text-xs">
      <h2 className="sm:text-5xl xsm:text-3xl text-xl text-center">Friend </h2>
      <div className="mx-10">
      <h2 className="text-2xl">Id information</h2>
      <p className="my-3">username:{name}</p>
      <p className="my-3">Full name:{fullName}</p>
      <div className="flex gap-2 justify-center items-center mt-5 w-full">
      <button onClick={()=>removeFriend(id,name)} className="rounded-md bg-red-700 text-white px-4 py-2 hover:bg-red-600 transition duration-300">
        Unfriend
      </button>
      <button onClick={()=>handleBlock(id,name)} className="rounded-md bg-red-700 text-white px-4 py-2 hover:bg-red-600 transition duration-300">
        Block
      </button>
      </div>
      </div>
    </div>
    :
    <div className="mt-20 text-black">
      <h2 className="text-4xl text-center font-bold">Friend not found</h2>
      </div>
    }
    </>
  )
}

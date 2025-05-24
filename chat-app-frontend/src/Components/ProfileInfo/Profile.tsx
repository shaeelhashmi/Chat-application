import axios from "axios"
import {  useEffect,useState } from "react"
import { useSelector } from "react-redux"
export default function Profile() {
    const [fullName, setFullName] = useState<string>("")
    const [friend,setFriend] = useState<number>(0)
    const [blocked,setBlocked] = useState<number>(0)
    const selector = useSelector((state: any) => state.userName)
    
    useEffect(() => {
        const fetchInfo=async()=>{
            try {
                const response = await axios.get(`http://localhost:8080/user/info`, { withCredentials: true })
                console.log(response)
                setFullName(response.data.fullname)
                setFriend(response.data.totalFriends)
                setBlocked(response.data.totalBlocked)
            } catch (error) {
                console.error("Error fetching user info:", error)
            }
        }
        fetchInfo()
        
    }, [])

  return (
    <div className="mt-28 text-black    ml-5 text-lg">  
    <h1 className="text-5xl text-black text-center">Profile Information  </h1>
      <p className="my-3">Full name: {fullName}</p>
        <p className="my-3">Total friends: {friend}</p>
        <p className="my-3">Total people blocked: {blocked}</p>
        <p className="my-3">Username: {selector.userName}</p>
        <div className="flex justify-center items-center "><button className="bg-red-700 text-white hover:bg-red-600 p-2 text-lg transition-all duration-500 rounded-md">Delete Account</button></div>
    </div>
  )
}

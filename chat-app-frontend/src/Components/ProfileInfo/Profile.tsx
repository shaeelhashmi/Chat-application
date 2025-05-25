import axios from "axios"
import {  useEffect,useState } from "react"
import { useSelector } from "react-redux"
import WarningBox from "./Popup/WarningBox"
import Coverpage from "../Coverpage"
import ConfirmDeletion from "./Popup/ConfirmDeletion"
export default function Profile() {
    const [fullName, setFullName] = useState<string>("")
    const [friend,setFriend] = useState<number>(0)
    const [blocked,setBlocked] = useState<number>(0)
    const [Popup,setPopup] = useState<boolean>(false)
    const [secondPopup,setSecondPopup] = useState<boolean>(false)
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
    <div className="mt-28 text-black    ml-5 sm:text-lg xsm:text-sm text-xs">  
    <h1 className="sm:text-5xl xsm:text-3xl text-xl text-black text-center">Profile Information  </h1>
      <p className="my-3">Full name: {fullName}</p>
        <p className="my-3">Total friends: {friend}</p>
        <p className="my-3">Total people blocked: {blocked}</p>
        <p className="my-3">Username: {selector.userName}</p>
        <div className="flex justify-center items-center flex-col mt-5"><button className="bg-red-700 text-white hover:bg-red-600 p-2 sm:text-lg text-sm transition-all duration-500 rounded-md" onClick={()=>setPopup(true)}>Delete Account</button>
        <p className="text-red-500 sm:text-lg xsm:text-sm text-xs my-3">
        Warning: Deleting your account is permanent and cannot be undone.
      </p>
      <p className="text-red-500 sm:text-lg xsm:text-sm text-xs">
        Please ensure you have saved any important data before proceeding.
      </p>
      </div>
      {(Popup || secondPopup )&& <Coverpage isMedia={true}></Coverpage>}
        <WarningBox popup={Popup} setPopup={setPopup} setSecondPopup={setSecondPopup}/>
        <ConfirmDeletion secondPopup={secondPopup} setSecondPopup={setSecondPopup}></ConfirmDeletion>
    </div>
  )
}

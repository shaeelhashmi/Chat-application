import { useEffect,useState } from "react"
import axios from "axios"
import Tick from "../SVG/Tick"
import Cross from "../SVG/Cross"
export default function RecievedRequest() {
    const [recievedRequests, setRecievedRequests] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get("http://localhost:8080/requests/recieved", { withCredentials: true })
            setRecievedRequests(response.data)
        } 
        fetchData()
    },[])
    const handleAccept = async (requestId: string) => {
        try {
            
             await axios.post(`http://localhost:8080/acceptrequest`, {
              ID: requestId
            }, { withCredentials: true })
            setRecievedRequests((prevRequests) => prevRequests.filter((request:any) => request.id !== requestId))
        } catch (error) {
            console.error("Error accepting request:", error)
        }
    }
  return (
    <div className="mt-20">
      {
        recievedRequests?.map((request:any) => (
          <div key={request.id} className="flex justify-between items-center p-2 border-b border-gray-300  ml-20 text-white my-5">
            <div className="flex items-center ">
              <span>{request.sender}</span>
            </div>
            <div className="flex items-center">
                <button className="ml-5 p-1 bg-green-700 text-white rounded-lg" onClick={()=>handleAccept(request.id)}><Tick/></button>
                <button className="ml-5 p-1 bg-red-700 text-white rounded-lg"><Cross/></button>           
            </div>
          </div>
        ))

      }
    </div>
  )
}

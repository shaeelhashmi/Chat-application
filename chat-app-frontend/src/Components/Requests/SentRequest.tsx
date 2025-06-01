import { useState,useEffect } from "react"
import axios from "axios"
export default function SentRequest() {
    const [sentRequests, setSentRequests] = useState([])
    useEffect(() => {
        const fetchSentRequests = async () => {

        try{ 
            const response = await axios.get("http://localhost:8080/requests/sent", {withCredentials:true});
            setSentRequests(response.data);
            
        }catch(error:any)
        {
          
        }
        }
        fetchSentRequests()
    }, [])
    const handleDeleteRequest = async (requestId:any) => {
        try {
            await axios.delete(`http://localhost:8080/delete/sentrequest?id=${requestId}`, {withCredentials:true});
            setSentRequests((prevRequests) => prevRequests.filter((request:any) => request.id !== requestId));
        } catch (error) {
            console.error("Error deleting request:", error);
        }
    }
  return (
    <div className="mt-20">
      {
        sentRequests?.map((request:any) => (
          <div key={request.id} className="flex justify-between items-center p-2 border-b border-gray-600 my-5 ml-20 text-white">
            <div className="flex items-center ">
              <span>{request.reciever}</span>
            </div>
            <div className="flex items-center">
  
                <button className="ml-5 p-1 bg-red-700 text-white rounded-lg py-2" onClick={()=>handleDeleteRequest(request.id)}>Delete request</button>           
            </div>
          </div>
        ))

      }
    </div>
  )
}

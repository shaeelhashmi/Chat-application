import { useState,useEffect } from "react"
import axios from "axios"
export default function SentRequest() {
    const [sentRequests, setSentRequests] = useState([])
    useEffect(() => {
        const fetchSentRequests = async () => {

        try{ 
            const response = await axios.get("http://localhost:8080/requests/sent", {withCredentials:true});
            setSentRequests(response.data);
            console.log("Sent Requests:", response.data);
            
        }catch(error:any)
        {
            console.log("Error fetching sent requests:", error);
        }
        }
        fetchSentRequests()
    }, [])
  return (
    <div>
      {
        sentRequests?.map((request:any) => (
          <div key={request.id} className="flex justify-between items-center p-2 border-b border-gray-300 mt-20 ml-20 text-white">
            <div className="flex items-center ">
              <span>{request.reciever}</span>
            </div>
            <div className="flex items-center">
                <span>Status: Pending</span>
                <button className="ml-5 p-1 bg-red-700 text-white rounded-lg">Delete request</button>           
            </div>
          </div>
        ))

      }
    </div>
  )
}

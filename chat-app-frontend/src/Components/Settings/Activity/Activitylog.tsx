import { useEffect,useState} from "react"
import axios from "axios"
export default function Activitylog() {
    const [activity, setActivity] = useState<any[]>([])
    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const response = await axios.get("http://localhost:8080/user/event", { withCredentials: true })
                
                // Map and convert created_at to Date objects
                const activitiesWithDate = response.data.map((item: any) => ({
                    ...item,
                    created_at: new Date(item.created_at)
                }));
                // Sort so oldest is at the last index (descending order)
                activitiesWithDate.sort((a: any, b: any) => b.created_at.getTime() - a.created_at.getTime());
                setActivity(activitiesWithDate);
                console.log(activitiesWithDate);
                console.log("Activity log fetched and sorted successfully");
            } catch (error) {
                console.error("Error fetching activity log:", error)
            }
        }
        fetchActivity()
    }, [])
  return (
    <div className="mt-16">
      {activity?.map((item: any) => (
        <div key={item.id } className="items-center  my-8 text-black flex justify-between bg-gray-200 p-4 rounded-lg shadow-md ml-20">
          <p className="text-start">{item.activity}</p>
          <p className="text-start">{item.created_at.toLocaleString()}</p>
        </div>
      ))}
            
    </div>
  )
}

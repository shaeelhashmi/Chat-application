import { useEffect,useState} from "react"
import axios from "axios"
import TextBox from "../../Util/TextBox"
export default function Activitylog() {
    const [activity, setActivity] = useState<any[]>([])
    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const response = await axios.get("http://localhost:8080/user/event", { withCredentials: true })

                const activitiesWithDate = response.data?.map((item: any) => ({
                    ...item,
                    created_at: new Date(item.created_at)
                }));
     
                activitiesWithDate?.sort((a: any, b: any) => b.created_at.getTime() - a.created_at.getTime());
                setActivity(activitiesWithDate);

            } catch (error) {
                console.error("Error fetching activity log:", error)
            }
        }
        fetchActivity()
    }, [])
  return (
    <div className="mt-16 ml-20">
      {activity?.map((item: any) => (
        <>
        <TextBox handleSubmit={()=>{
          try
          {
            axios.get(`http://localhost:8080/delete/event?id=${item.id}`, { withCredentials: true })
            location.reload();
          }catch (error){

          }
          }} element={{id:item.id,text:item.activity,created_at:item.created_at}} buttonText="Delete activity" buttonColor=" bg-[rgb(116_185_62)]  hover:bg-[rgb(112_177_62)] "></TextBox>

        </>
      ))}
            
    </div>
  )
}

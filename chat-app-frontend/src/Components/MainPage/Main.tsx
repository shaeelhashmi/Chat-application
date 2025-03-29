import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function Main() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    useEffect(() => {
        const fetchUser = async () => {
            try {
              const response = await axios.get("http://localhost:8080/isloggedin", { withCredentials: true });
            setUser(response.data.user)
            } catch (error:any) {
            navigate("/login")
            }
        }
        fetchUser()
    }, [])
  return (
    <div>
      
    </div>
  )
}

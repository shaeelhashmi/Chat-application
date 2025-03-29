import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function Main() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    useEffect(() => {
        const fetchUser = async () => {
            try {
              console.log("Fetching user...")
              const response = await axios.get("http://localhost:8080/isloggedin", { withCredentials: true });
            setUser(response.data.user)
            } catch (error:any) {
            navigate("/auth/login")
            }
        }
        fetchUser()
    }, [])
  return (
    <div>
      <button onClick={() =>{
        axios.get("http://localhost:8080/auth/logout", { withCredentials: true }).then((res) => {
          console.log(res.data)
          navigate("/auth/login")
        }).catch((err) => {
          console.log(err)
        })
      }}>Logout</button>
    </div>
  )
}

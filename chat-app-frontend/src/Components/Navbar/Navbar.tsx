import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function Navbar() {
    const navigate = useNavigate();
  return (
    <div className="fixed top-0 w-screen p-3 bg-[#13135b] flex justify-end z-50 items-end">
       <div className="justify-self-end">
        <button className="bg-[#1d1d7d] p-2 rounded-md text-white"
        onClick={() => {
            axios.get("http://localhost:8080/auth/logout", { withCredentials: true })
                .then(() => navigate("/auth/login"))
                .catch((err) => console.error("Logout error:", err));
        }}>Logout</button>
       </div>
    </div>
  )
}

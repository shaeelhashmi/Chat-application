
import axios from "axios"
import { useState } from "react"
export default function ChangePassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const ChangePassword = async () => {
    try {
      if (password.length === 0) {
        setError("Password cannot be empty")
        return
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }
      const response = await axios.post(
        "http://localhost:8080/settings/password",
        JSON.stringify(password),
        { withCredentials: true }
      )
      setError(response.data)
      location.reload()
    } catch (error) {
      setError("Internal server error")
      console.log(error)
    }
  }

  return (
    <div className="mt-28">
    <div>
      <div className="flex justify-center flex-col">
        <div className="flex justify-center items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">Change Password</h1>
        </div>

    <div className="flex justify-center items-center mb-4">
    <input type="text" placeholder="Password" className="border border-gray-300 rounded px-4 py-2 mb-4" value={password} onChange={(e)=>setPassword(e.target.value)}/>
    </div>
    <div className="flex justify-center items-center mb-4">
    <input type="text" placeholder="Confirm password" className="border border-gray-300 rounded px-4 py-2 mb-4" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}/>
    </div>
    <div className="flex justify-center items-center mb-4">
    <div className='w-full text-red-600 h-4 text-center'>{error}</div>
    </div>
    <div className="flex justify-center items-center mb-4">
    <button className="bg-blue-800 hover:bg-blue-600 duration-500 text-white px-4 py-2 rounded" onClick={()=>{
      ChangePassword()
      setPassword("")
      setConfirmPassword("")
    }}>Change Password</button>
    </div>
    

    </div>
    </div>
    </div>
  )
}

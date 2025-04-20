import {  useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
export default function Signup() {
 const [error, setError] = useState<string>("")
 const [username, setUsername] = useState<string>("")
 const [password, setPassword] = useState<string>("")
 const navigate = useNavigate()

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (username.length > 15) {
        setError("Username must be less than 15 characters")
        return 
    }
    else if (username.length < 3) {
        setError("Username must be more than 3 characters")
        return 
    }
    else if (username === "") {
        setError("Username is required")
        return 
    } else if (password === "") {
        setError("Password is required")
        return 
    }
    try {
        const res = await axios.post("http://localhost:8080/auth/signup", {
            username: username,
            password: password
        }, { withCredentials: true })
        setError(res.data.message)
        navigate("/auth/login")
        return 
    } catch (err: any) {
        console.log(err.response.data)
        setError(err.response.data)
    }
 }

  return (
    <div className="flex items-center justify-center h-screen m-0">
    <form action="" className="p-3 h-[400px] w-[350px] bg-white border-2 border-solid shadow-lg text-md" onSubmit={handleSubmit} >
      <h1 className="mb-4 text-4xl font-bold text-center">Signup</h1>
      <div className="flex flex-col ">
          <label htmlFor="username">Username:</label>
          <input type="text" name="username" id="username" placeholder="nick"  className="w-[90%] my-4 h-10 rounded-sm p-2 mx-auto border-b-2 border-solid bg-[#F5F5F5]"
        value={username}
        onChange={(e) =>{
            const value = e.target.value.replace(/\W/g, '')
            const lowerCaseValue = value.toLowerCase();
            if (value.length > 15) {
                setError("Username must be less than 15 characters")
            } else {
                setError("")
            }
            setUsername(lowerCaseValue)
        }}
      />
      
      </div>
      <div className="flex flex-col">
      <label htmlFor="password">Password:</label>
      <input type="password" name="password" id="password" placeholder="*****"  className="w-[90%] my-4 h-10 rounded-sm p-2 mx-auto border-b-2 border-solid bg-[#F5F5F5]"
        value={password}
        onChange={(e)=>{
            setPassword(e.target.value)
        }}/>
      </div>
      <div className="w-full h-10 text-red-500">{error}</div>
      <a href="/auth/login" className="h-10 ">Already have an account? <span className="text-blue-600">Login</span></a>
      <div className="flex items-center justify-center my-3">
<button
  type="submit"
  className="w-[200px] h-10 text-center bg-blue-600 text-white rounded-lg"
>
  SignUp
</button>
</div>
    </form>
  </div>
  )
}
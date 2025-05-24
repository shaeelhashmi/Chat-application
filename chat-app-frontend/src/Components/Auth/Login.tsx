import { useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setUsername } from "../Slice/UserName"
export default function Login() {
  const dispatch = useDispatch()
const [error, setError] = useState<string>("")
const [user, setUser] = useState<string>("")
const [password, setPassword] = useState<string>("")
const handleSubmit =async  (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(user.length > 15) {
        setError("Username must be less than 15 characters")
        return 
    } else if (user.length < 3) {
        setError("Username must be more than 3 characters")
        return 
    }

    else if (user === "") {
        setError("Username is required")
        return 
    } else if (password === "") {
        setError("Password is required")
        return 
    } 
    try
    {
    const res=await axios.post("http://localhost:8080/auth/login", {
        username: user,
        password: password
    }
  ,{withCredentials: true})
    setError(res.data.message)
   dispatch(setUsername(res.data.user))
   window.location.href = "/chat"
    return 
}catch(err:any) {
  if(err.response) {
    setError(err.response.data)
}
else{
    setError("Something went wrong")
}
}

}

  return (
    <div className="flex items-center justify-center h-screen m-0">
      <form className="p-3 max-w-[500px] min-w-[200px]  w-[500px] xsm:text-md text-sm " onSubmit={handleSubmit} >
        <h1 className="xsm:text-3xl text-xl font-bold">Welcome back!</h1>
        <p className="text-lg my-2 mb-5">Enter your credentials to access your account</p>
        <div className="my-3 font-semibold"><label htmlFor="username">Username:</label></div>
          <input type="text" className="border-2 border-solid w-full p-2 rounded-sm" placeholder="Enter your name" value={user} onChange={(e) =>{
            const value = e.target.value.replace(/\W/g, '')
            const lowerCaseValue = value.toLowerCase();
            if (value.length > 15) {
                setError("Username must be less than 15 characters")
            } else {
                setError("")
            }
            setUser(lowerCaseValue)
        }} id="username" />
        <div className="my-3 font-semibold"><label htmlFor="password">Password</label></div>
        <input type="password" className="border-2 border-solid w-full p-2 rounded-sm" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} id="password" />
       <p className="my-3 h-[20px] text-red-500">{error}</p>
     
    <button type="submit" className="w-full bg-[#3A5B22] my-3 text-white p-2 xsm:text-lg text-md rounded-lg">Login</button>
    <p className="text-center my-2">Or</p>
     <p >Don't have an account? <Link to="/auth/signup" className="text-blue-600">Signup</Link></p>
       
      </form>
    </div>
  )
}
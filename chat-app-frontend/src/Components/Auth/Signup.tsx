import {  useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
export default function Signup() {
 const [error, setError] = useState<string>("")
 const [username, setUsername] = useState<string>("")
 const [password, setPassword] = useState<string>("")
 const [Name,setFullName] = useState<string>("")
 const [confirmPassword, setConfirmPassword] = useState<string>("")
 const navigate = useNavigate()

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirmPassword) {
        setError("Passwords do not match")
        return 
    }
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
            password: password,
            fullName: Name
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
    <form action="" className="p-3 max-w-[500px] min-w-[200px]  w-[500px] xsm:text-md text-sm" onSubmit={handleSubmit} >
      <h1 className="xsm:text-3xl text-xl font-bold">Get started now</h1>
      <div className="my-3 font-semibold"><label htmlFor="name">Name</label></div>
      <input type="text" className="border-2 border-solid w-full p-2 rounded-sm" placeholder="Enter your name" value={Name} onChange={(e) => {
        if (e.target.value.length > 70) {
            setError("Name must be less than 30 characters")
            return
        }
        setFullName(e.target.value)
        }} id="name" />
      <div className="my-3 font-semibold"><label htmlFor="username">Username</label></div>
      <input type="text" className="border-2 border-solid w-full p-2 rounded-sm" placeholder="Enter your username" value={username} onChange={(e) =>{
            const value = e.target.value.replace(/\W/g, '')
            const lowerCaseValue = value.toLowerCase();
            if (value.length > 15) {
                setError("Username must be less than 15 characters")
            } else {
                setError("")
            }
            setUsername(lowerCaseValue)
        }} id='username'/>
      <div className="my-3 font-semibold"><label htmlFor="password">Password</label></div>
      <input type="password" className="border-2 border-solid w-full p-2 rounded-sm" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} id="password" />
      <div className="my-3 font-semibold"><label htmlFor="confirmpassword">Confirm password</label> </div>
      <input type="password" className="border-2 border-solid w-full p-2 rounded-sm" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} id="confirmpassword"/>
      <p className="my-3 h-[20px] text-red-500">{error}</p>
     
    <button type="submit" className="w-full bg-[#3A5B22] my-3 text-white p-2 xsm:text-lg text-md rounded-lg">Sign up</button>
    <p className="text-center my-2">Or</p>
     <p >Already have an account? <Link to="/auth/login" className="text-blue-600">Login</Link></p>
    </form>
  </div>
  )
}
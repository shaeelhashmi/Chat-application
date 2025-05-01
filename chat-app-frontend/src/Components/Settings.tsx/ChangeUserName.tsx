import { useState } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux';
import { setUsername } from '../Slice/UserName'
export default function ChangeUserName() {
    const dispatch = useDispatch()
    const [username, SetUsername] = useState('')
    const ChangeUserName = async () => {
        try {
             const response =await axios.post('http://localhost:8080/settings/username',   JSON.stringify(username), { withCredentials: true })

            dispatch(setUsername(username))
            console.log(response.data)

        } catch (error) {
            console.log(error)
        }
    }
  return (
    <div className="mt-28">
    <div className="flex justify-center flex-col">
        <div className="flex justify-center items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">Change UserName</h1>
        </div>

    <div className="flex justify-center items-center mb-4">
    <input type="text" placeholder="Enter new username" className="border border-gray-300 rounded px-4 py-2 mb-4"  value={username} onChange={(e:any)=>SetUsername(e.target.value)}/>
    </div>
   
    <div className="flex justify-center items-center mb-4">
    <button className="bg-blue-800 hover:bg-blue-600 duration-500 transition-all text-white px-4 py-2 rounded" onClick={ChangeUserName}>Change UserName</button>
    </div>
    </div>
    </div>

  )
}

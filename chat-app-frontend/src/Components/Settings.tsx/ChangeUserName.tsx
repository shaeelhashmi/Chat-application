import { useState } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux';
import { setUsername } from '../Slice/UserName'
export default function ChangeUserName() {
    const dispatch = useDispatch()
    const [username, SetUsername] = useState('')
    const [error, setError] = useState('')

    const ChangeUserName = async () => {
        try {
            if (username.length === 0) {
                setError('Username cannot be empty')
                return
            }
            if (username.length < 3) {
                setError('Username must be at least 3 characters long')
                return
            }
            if (username.length > 15) {
                setError('Username must be at most 20 characters long')
                return
            }
             const response =await axios.post('http://localhost:8080/settings/username',   JSON.stringify(username), { withCredentials: true })

            dispatch(setUsername(username))
            setError(response.data)

        } catch (error:any) {
          setError(error.response.data || 'An error occurred while changing the username')
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
    <input type="text" placeholder="Enter new username" className="border border-gray-300 rounded px-4 py-2 mb-4"  value={username}  onChange={(e) =>{
            const value = e.target.value.replace(/\W/g, '')
            const lowerCaseValue = value.toLowerCase();
            if (value.length > 15) {
                setError("Username must be less than 15 characters")
            } else {
                setError("")
            }
            SetUsername(lowerCaseValue)
        }}/>
    </div>
    <div className="flex justify-center items-center mb-4">
    <div className='w-full text-red-600 h-4 text-center'>{error}</div>
    </div>

    <div className="flex justify-center items-center my-4">
    
    <button className="bg-blue-800 hover:bg-blue-600 duration-500 transition-all text-white px-4 py-2 rounded" onClick={ChangeUserName}>Change UserName</button>
    </div>
    </div>
    </div>

  )
}

import {useState} from 'react'
import axios from 'axios'

export default function ChangeFullName() {
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const changeFullName = async () => {
    try{
      axios.post('http://localhost:8080/user/name', 
        JSON.stringify(fullName)
      , {
        withCredentials: true
      })
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            setError(err.response.data.message)
          } else {
            setError('An error occurred while changing the full name')
          }
        } else {
          setError('An unexpected error occurred')
        }
      }
    }
  
  return (
    <div className="mt-28">
    <div className="flex justify-center flex-col">
        <div className="flex justify-center items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">Change Full name</h1>
        </div>

    <div className="flex justify-center items-center mb-4">
    <input type="text" placeholder="Enter new name" className="border border-gray-300 rounded px-4 py-2 mb-4"  value={fullName}  onChange={(e) =>{
        if (e.target.value.length > 70) {
            setError("Fullname must be less than 30 characters")
            return
        }
        setFullName(e.target.value)
        }}/>
    </div>
    <div className="flex justify-center items-center mb-4">
    <div className='w-full text-red-600 h-4 text-center'>{error}</div>
    </div>

    <div className="flex justify-center items-center my-4">
    
    <button className="bg-blue-800 hover:bg-blue-600 duration-500 transition-all text-white px-4 py-2 rounded" onClick={changeFullName}>Change Full name</button>
    </div>
    </div>
    </div>

  )
}

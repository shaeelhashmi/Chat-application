
import { useState } from "react";
import axios from "axios";
export default function ConfirmDeletion(props:{secondPopup:boolean
    setSecondPopup: (value: boolean) => void
}) {
    
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const deleteAccount=async()=>{
        if (password.length==0){
            setError("Password cannot be empty")
        }
        try{
             await axios.post("http://localhost:8080/user/delete", { password }, { withCredentials: true })
            location.reload();
        }catch(error:any) {
            if (error.response.status==401){
                setError("Incorrect Password")
            }
        }
    }
  return (
    <div className={`fixed transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-lg p-6 flex items-center justify-center flex-col gap-4 z-50 sm:w-[400px] w-[300px] h-[300px] sm:h-[400px] transition-all duration-500 ease-out
        ${props.secondPopup ? 'top-1/2 left-1/2 opacity-100' : 'top-1/2 left-full opacity-0'}
      z-40`}>
        <h2 className="sm:text-2xl text-lg font-bold text-red-600">Confirm Deletion</h2>
        <p className="text-red-500 sm:text-md text-xs">This desicion is final and cannot be changed later on</p>
        <div><label htmlFor="password" className="text-md sm:text-lg">Enter your password</label></div>
        <input id="password" className="p-2 border-2 w-full rounded-md text-black" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
        <p className="text-red-500 xsm:text-lg text-xs h-10">
            {error}
        </p>
        <div className="flex gap-7">
        <button className="bg-red-700 text-white hover:bg-red-600 p-2 sm:text-lg text-sm transition-all duration-500 rounded-md" onClick={deleteAccount}>
            Delete
        </button>
        <button className="bg-green-700 text-white hover:bg-green-600 sm:text-lg text-sm transition-all duration-500 rounded-md p-2" onClick={() => props.setSecondPopup(false)}>
            Cancel
        </button>
        </div>
    </div>
  )
}

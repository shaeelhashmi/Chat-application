import React from "react";
export default function Login() {

  return (
    <>
    <div className="flex items-center justify-center h-screen m-0">
      <form action="" className="p-3 h-[400px] w-[350px] bg-[#ffffff]  text-md shadow-2xl border-lg border-2" >
        <h1 className="mb-4 text-4xl font-bold text-center">Login</h1>
        <div className="flex flex-col ">
            <label htmlFor="username">Username:</label>
        <input type="text" name="username" id="username" placeholder="nick"  className="w-[90%] my-4 h-10 rounded-sm p-2 mx-auto border-b-2 border-solid bg-[#F5F5F5] border-[#d0d0d0]"
         />
        
        </div>
        <div className="flex flex-col">
        <label htmlFor="password">Password:</label>
        <input type="password" name="password" id="password" placeholder="*****"  className="w-[90%] my-4 h-10 rounded-sm p-2 mx-auto border-b-2 border-solid bg-[#F5F5F5] border-[#d0d0d0]"/>
        </div>
        <a href="/auth/signup" className="h-10 my-3 mb-10 ">Dont have an account? 
        <span className="text-blue-600">Signup</span></a>
        <div className="flex items-center justify-center my-3">
  <button
    type="submit"
    className="w-[200px] h-10 text-center bg-blue-600 text-white rounded-lg"
  >
    Login
  </button>
    </div>
      </form>
    </div>
    </>
  )
}
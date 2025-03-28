
export default function Signup() {
 
  return (
    <div className="flex items-center justify-center h-screen m-0">
    <form action="" className="p-3 h-[400px] w-[350px] bg-white border-2 border-solid shadow-lg text-md" >
      <h1 className="mb-4 text-4xl font-bold text-center">Signup</h1>
      <div className="flex flex-col ">
          <label htmlFor="username">Username:</label>
      <input type="text" name="username" id="username" placeholder="nick"  className="w-[90%] my-4 h-10 rounded-sm p-2 mx-auto border-b-2 border-solid bg-[#F5F5F5]"
    />
      
      </div>
      <div className="flex flex-col">
      <label htmlFor="password">Password:</label>
      <input type="password" name="password" id="password" placeholder="*****"  className="w-[90%] my-4 h-10 rounded-sm p-2 mx-auto border-b-2 border-solid bg-[#F5F5F5]"/>
      </div>
      {/* <div className="w-full h-10 text-red-500">{error}</div> */}
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
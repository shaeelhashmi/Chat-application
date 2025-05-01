

export default function ChangePassword() {
  return (
    <div className="mt-28">
    <div>
      <div className="flex justify-center flex-col">
        <div className="flex justify-center items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">Change Password</h1>
        </div>

    <div className="flex justify-center items-center mb-4">
    <input type="text" placeholder="Password" className="border border-gray-300 rounded px-4 py-2 mb-4" />
    </div>
    <div className="flex justify-center items-center mb-4">
    <input type="text" placeholder="Confirm password" className="border border-gray-300 rounded px-4 py-2 mb-4" />
    </div>
   
    <div className="flex justify-center items-center mb-4">
    <button className="bg-blue-800 hover:bg-blue-600 duration-500 text-white px-4 py-2 rounded">Change Password</button>
    </div>
    

    </div>
    </div>
    </div>
  )
}

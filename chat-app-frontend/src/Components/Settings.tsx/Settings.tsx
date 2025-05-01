
export default function Settings() {
  return (
    <div className=" mt-28">
        <h1 className="text-5xl text-white font-bold text-center my-10">Settings</h1>
      <div className="flex justify-center flex-col">
        <div className="flex justify-center items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">Change UserName</h1>
        </div>

    <div className="flex justify-center items-center mb-4">
    <input type="text" placeholder="Enter new username" className="border border-gray-300 rounded px-4 py-2 mb-4" />
    </div>
   
    <div className="flex justify-center items-center mb-4">
    <button className="bg-blue-500 text-white px-4 py-2 rounded">Change UserName</button>
    </div>
    

    </div>
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
    <button className="bg-blue-500 text-white px-4 py-2 rounded">Change Password</button>
    </div>
    

    </div>
    </div>
  )
}

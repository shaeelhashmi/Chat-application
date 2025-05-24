
import { TriangleAlert } from 'lucide-react';
export default function WarningBox(props:{popup:boolean
  setPopup: (value: boolean) => void
  setSecondPopup: (value: boolean) => void
}) {
  return (
    <div
      className={`fixed transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-lg p-6 flex items-center justify-center flex-col gap-4 z-50 sm:w-[400px] w-[300px] h-[300px] sm:h-[400px] transition-all duration-500 ease-out
        ${props.popup ? 'top-1/2 left-1/2 opacity-100' : 'top-1/2 left-full opacity-0'}
      z-40`}
    >
      <TriangleAlert className="text-red-500" size={48} />
      <h2 className="sm:text-2xl text-lg font-bold text-red-600">Warning</h2>
      <p>Are you sure you want to delete your account?</p>
      <button className="bg-red-700 text-white hover:bg-red-600 p-2 sm:text-lg text-sm transition-all duration-500 rounded-md" onClick={() => {
        props.setPopup(false);
        props.setSecondPopup(true)
      }}>
        yes, delete my account
      </button>
      <button className="bg-gray-300 text-black hover:bg-gray-400 p-2 sm:text-lg text-sm transition-all duration-500 rounded-md" onClick={() => props.setPopup(false)}>
        No, keep my account
      </button>
    </div>
  )
}

import VerticalElips from "../SVG/VerticalElips"
import { useState } from "react";
import axios from "axios";
interface prop{
  id: number;
  onDelete: (id: number) => void;
}
export default function DeleteMessageBtn(props:prop) {
 const [option, setOption] = useState(false);
 const handleDelete = async () => {
  try {
     await axios.delete(`http://localhost:8080/message/delete?id=${props.id}`, { withCredentials: true });
    props.onDelete(props.id);
    setOption(false);
  }
  catch (error) {
    console.error('Error deleting message:', error);
  }
}
  return (
    <div className="w-[5%] h-[10px]">
            <button className="h-[20px] mx-1 " onClick={() => setOption(!option)}>
              <VerticalElips/>
            </button>
            {
              
            <div className={`relative bg-[#c5ff9a] bottom-2 right-20  rounded-md text-center ${option?"opacity-100 w-[140px] h-[50px]":"opacity-0 w-0 h-0"} transition-all duration-500 origin-center`}>
             <button className={`text-black text-sm font-light p-2 hover:bg-[#d7ffbb] w-full transition-all duration-500 ${option?"":"hidden"} h-full`} onClick={handleDelete}>
                Delete message
            </button>
            
        </div>
          }
    </div>
  )
}

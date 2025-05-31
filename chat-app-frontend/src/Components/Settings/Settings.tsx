import { useEffect } from "react"
import { useDispatch } from "react-redux";
import { setPage } from "../Slice/CurrentPage";
export default function Settings() {
const dispatch = useDispatch();
useEffect(() => {
    dispatch(setPage(window.location.pathname.slice(1)));
  }, []);
  return (
    <div className=" sm:mt-28 mt-36 text-white">
        <h1 className="sm:text-5xl text-3xl  font-bold text-center my-10">Settings</h1>
        <p className='sm:text-xl text-sm xsm:text-base text-center'>Update your account information, change your password, and manage personal settings all in one place.</p>
    </div>
  )
}

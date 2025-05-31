import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setPage } from "../Slice/CurrentPage";
export default function HomePage() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPage(window.location.pathname.slice(1)));
  }, [dispatch]);

  return (
    <>
    <div className="mt-20 flex justify-center items-center flex-col text-white p-3 ">
    <div className="my-5  lg:text-5xl font-bold text-center sm:text-4xl  text-3xl">
      <h1>Welcome to We Chat</h1>
    </div>
    <div className="my-5"><p className="sm:text-base text-sm " >Select a chat to start messaging</p></div>
    </div>
    </>
  )
}

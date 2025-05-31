import './App.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { useEffect } from 'react'
import AppRoutes from './Routes/AppRoutes'
import { useDispatch } from "react-redux"
import { setPage } from "./Components/Slice/CurrentPage";
function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const requestNotificationPermission = async () => {
  await Notification.requestPermission();


    };
    requestNotificationPermission();
    if(!window.location.pathname.startsWith('/chat') &&
       !window.location.pathname.startsWith('/settings')){
       dispatch(setPage(window.location.pathname.slice(1)));
    }
   
  }, [])
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App;

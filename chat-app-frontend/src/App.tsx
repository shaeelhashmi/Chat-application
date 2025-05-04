import './App.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { useEffect } from 'react'
import AppRoutes from './Routes/AppRoutes'
function App() {
  useEffect(() => {
    const requestNotificationPermission = async () => {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
    
        console.log('Notification permission granted.');
      } else {
        console.log('Notification permission denied.');
      }
    };
    requestNotificationPermission();
    
  }, [])
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App;

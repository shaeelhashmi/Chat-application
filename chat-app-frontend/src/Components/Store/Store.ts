import { configureStore } from '@reduxjs/toolkit'
import userName from '../Slice/UserName'
import show from '../Slice/SideBar'
export default configureStore({
  reducer: {
    userName:userName
    ,show:show
  },
})
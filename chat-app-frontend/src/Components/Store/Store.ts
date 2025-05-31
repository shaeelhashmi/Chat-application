import { configureStore } from '@reduxjs/toolkit'
import userName from '../Slice/UserName'
import show from '../Slice/SideBar'
import  showSetting  from '../Slice/SettingSidebar'
import CurrentPage from '../Slice/CurrentPage'
export default configureStore({
  reducer: {
    userName:userName
    ,show:show
    ,showSetting:showSetting
    ,currentPage:CurrentPage
  },
})
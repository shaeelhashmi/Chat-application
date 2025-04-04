import { configureStore } from '@reduxjs/toolkit'
import userName from '../Slice/UserName'
export default configureStore({
  reducer: {
    userName:userName
  },
})
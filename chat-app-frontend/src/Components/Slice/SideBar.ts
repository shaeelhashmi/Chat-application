import { createSlice } from '@reduxjs/toolkit'

export const show = createSlice({
  name: 'sideBar',
  initialState: {
   open: false,
  },
  reducers: {
    setSidebar: (state) => {state.open = !state.open },
  },
})
export const { setSidebar } = show.actions

export default show.reducer
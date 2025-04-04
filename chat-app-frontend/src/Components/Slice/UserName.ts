import { createSlice } from '@reduxjs/toolkit'

export const show = createSlice({
  name: 'userName',
  initialState: {
   userName: "",
  },
  reducers: {
    setUsername: (state,actions) => {state.userName = actions.payload},
  },
})
export const { setUsername } = show.actions

export default show.reducer
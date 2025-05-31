import { createSlice } from '@reduxjs/toolkit'

export const showSetting = createSlice({
  name: 'currentPage',
  initialState: {
   page:" ",
  },
  reducers: {
    setPage: (state,actions) => {state.page = actions.payload },
  },
})
export const { setPage } = showSetting.actions

export default showSetting.reducer
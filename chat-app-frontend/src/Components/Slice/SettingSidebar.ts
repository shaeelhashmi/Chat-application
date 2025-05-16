import { createSlice } from '@reduxjs/toolkit'

export const showSetting = createSlice({
  name: 'settingSidebar',
  initialState: {
   open: false,
  },
  reducers: {
    setSettingsidebar: (state) => {state.open = !state.open },
  },
})
export const { setSettingsidebar } = showSetting.actions

export default showSetting.reducer
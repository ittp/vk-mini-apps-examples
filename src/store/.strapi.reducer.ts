import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'
export interface strapiState {
  data: []
}

const initialState: strapiState = {
  data: [{ id: 1 }],
}

const strapiSlice = createSlice({
  name: 'strapi',
  initialState,
  reducers: {
    setstrapiData(state, action: PayloadAction<{ id: number; name: string }>) {
      state.data = action.payload.data
    },

    setOnboardingComplete(state, action: PayloadAction<boolean>) {
      state.onboadrdingComplete = action.payload
    },
  },
})

const { reducer } = strapiSlice
export { reducer as strapiReducer }

export const selectOnboardingComplete = (state: RootState) => state.strapi.data

export const { setstrapiData, setOnboardingComplete } = strapiSlice.actions

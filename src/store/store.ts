import { configureStore } from '@reduxjs/toolkit'
import authReducer from './reducers/authReducer'
import userReducer from './reducers/userReducer'

const store = configureStore({
  reducer: {
    authReducer,
    userReducer,
  },
})

/** @deprecated Redux removed in Layer 3. */
export type RootState = ReturnType<typeof store.getState>
/** @deprecated Redux removed in Layer 3. */
export type AppDispatch = typeof store.dispatch
export default store

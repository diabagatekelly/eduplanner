import {configureStore} from "@reduxjs/toolkit";
// import authReducer from "./reducers/authReducer";
import counterReducer from "./features/counterSlice";

export const store = configureStore({
  reducer: {
    counterReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
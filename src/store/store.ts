import {configureStore} from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducer";
import userReducer from "./reducers/userReducer";

const store = configureStore({
  reducer: {
    authReducer,
    userReducer
  }
})

export default store;
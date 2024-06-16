import {configureStore} from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducer";
import userReducer from "./reducers/userReducer";
import hashReducer from "./reducers/windowLocationHashReducer";

const store = configureStore({
  reducer: {
    authReducer,
    userReducer,
    hashReducer
  }
})

export default store;
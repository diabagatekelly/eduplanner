import { IUser } from "@/types/IUser"
import { ISODateString } from "@/types/isoDateType"

export function setAuthToken({token, user}: {token: string, user: IUser}) {
  sessionStorage.setItem("user_token", token);
  const today = new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString 
  sessionStorage.setItem("created_on", today)
  sessionStorage.setItem("user_data", JSON.stringify(user))
  return {
    type: 'AUTH'
  };
}

export function removeAuthToken() {
  sessionStorage.removeItem("user_token");
  sessionStorage.removeItem("user_data");
  sessionStorage.removeItem("created_on");
  return {
    type: 'UNAUTH'
  };
}

export function hasToken() {
  const hasToken = sessionStorage.getItem('user_token') !== null;
  if (hasToken) {
    return {
      type: 'AUTH'
    };
  } else {
    return {
      type: 'UNAUTH'
    };
  }
}

export function hasExpired() {
  const createdOn = sessionStorage.getItem('created_on');
  const today = new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString 
  const hasExpired = today !== createdOn

  if (hasExpired) {
    sessionStorage.removeItem("user_token");
    sessionStorage.removeItem("user_data");
    sessionStorage.removeItem("created_on");
    return {
      type: 'UNAUTH'
    };
  } else {
    return {
      type: 'AUTH'
    };
  }
}
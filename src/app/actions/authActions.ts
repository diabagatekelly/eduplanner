export function setAuthToken(user) {
  sessionStorage.setItem("user_token", user.token)
  sessionStorage.setItem("user_data", JSON.stringify(user))
  return {
    type: 'AUTH'
  };
}

export function removeAuthToken() {
  sessionStorage.removeItem("user_token");
  sessionStorage.removeItem("user_data");
  // sessionStorage.removeItem("suites");
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
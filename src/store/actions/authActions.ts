export function setAuthToken(user) {
  sessionStorage.setItem("user_token", user.token)

  const today = new Date().toISOString().split('T')[0]
  sessionStorage.setItem("created_on", today)
  user.username = `${user.firstName}-${user.lastName}`
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
  const today = new Date().toISOString().split('T')[0]
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
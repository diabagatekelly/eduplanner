const INITIAL_STATE = {isAuthenticated : sessionStorage.getItem('user_token') !== null}

export default function auth(state = INITIAL_STATE, action) {
  switch(action.type) {
    case 'AUTH':
      return {...state, isAuthenticated: true}

    case 'UNAUTH':
      return {...state, isAuthenticated: false}

    default:
      return state;
  }
}
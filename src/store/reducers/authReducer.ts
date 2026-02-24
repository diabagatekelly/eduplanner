const INITIAL_STATE = { isAuthenticated: false }

export default function auth(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'AUTH':
      return { ...state, isAuthenticated: true }

    case 'UNAUTH':
      return { ...state, isAuthenticated: false }

    default:
      return state
  }
}

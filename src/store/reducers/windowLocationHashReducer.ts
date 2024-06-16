const INITIAL_STATE = window.location.hash

export default function windowLocationHash(hash = INITIAL_STATE, action: {type: string, hash: ''}) {
  switch(action.type) {
    case 'POPULATE':
      return hash

    default:
      return hash
  }
}
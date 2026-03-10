import auth from '../../../store/reducers/authReducer'

describe('Auth reducer', () => {
  it('should return isAuthenticated: true for AUTH action', () => {
    const result = auth({ isAuthenticated: false }, { type: 'AUTH' })
    expect(result.isAuthenticated).toBe(true)
  })

  it('should return isAuthenticated: false for UNAUTH action', () => {
    const result = auth({ isAuthenticated: true }, { type: 'UNAUTH' })
    expect(result.isAuthenticated).toBe(false)
  })

  it('should return current state for unknown action', () => {
    const state = { isAuthenticated: true }
    const result = auth(state, { type: 'UNKNOWN' })
    expect(result).toBe(state)
  })
})

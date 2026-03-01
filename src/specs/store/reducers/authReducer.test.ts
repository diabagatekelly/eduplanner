import auth from '../../../store/reducers/authReducer'

describe('Auth reducer', () => {
  it('should return isAuthenticated: false for UNAUTH action', () => {
    const result = auth({ isAuthenticated: true }, { type: 'UNAUTH' })
    expect(result.isAuthenticated).toBe(false)
  })
})

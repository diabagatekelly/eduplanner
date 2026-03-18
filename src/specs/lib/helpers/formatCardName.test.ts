import formatCardName from '../../../lib/helpers/formatCardName'

describe('formatCardName', () => {
  it('should return empty string when activityName is undefined', () => {
    expect(formatCardName('any-card-id', undefined)).toBe('')
  })
})

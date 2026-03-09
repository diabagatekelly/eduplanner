import { renderHook, act } from '@testing-library/react'
import { useMounted } from '../../../lib/helpers/useMounted'

describe('useMounted', () => {
  it('should return true after mounting', async () => {
    const { result } = renderHook(() => useMounted())
    await act(async () => {})
    expect(result.current).toBe(true)
  })
})

import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useActivateCard, useDeleteCard, useResetCardStage } from '../../hooks/use-card-mutations'
import { activateCard, deleteCard, resetCardStage } from '../../api/controller'
import { queryKeys } from '../../lib/query-keys'
import React from 'react'

jest.mock('../../api/controller')

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('Card mutation hooks invalidate both user and student query keys on success', () => {
  const userId = 'test-user-id'

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('useActivateCard should invalidate both user and student queries on success', async () => {
    ;(activateCard as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: { message: 'ok', details: {} },
    })

    const queryClient = createTestQueryClient()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useActivateCard(userId), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync({ activity: 'Quran', cardId: 'card-1' })
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.user(userId) })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.student(userId) })
  })

  it('useDeleteCard should invalidate both user and student queries on success', async () => {
    ;(deleteCard as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: { message: 'ok', details: {} },
    })

    const queryClient = createTestQueryClient()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteCard(userId), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync([{ activity: 'Quran', cardId: 'card-1' }])
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.user(userId) })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.student(userId) })
  })

  it('useResetCardStage should invalidate both user and student queries on success', async () => {
    ;(resetCardStage as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: { message: 'ok', details: {} },
    })

    const queryClient = createTestQueryClient()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useResetCardStage(userId), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync({ activity: 'Quran', cardId: 'card-1' })
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.user(userId) })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.student(userId) })
  })

  it('useActivateCard should not invalidate queries on failure', async () => {
    ;(activateCard as jest.Mock).mockRejectedValueOnce(new Error('Server error'))

    const queryClient = createTestQueryClient()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useActivateCard(userId), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync({ activity: 'Quran', cardId: 'card-1' }).catch(() => {})
    })

    expect(invalidateSpy).not.toHaveBeenCalled()
  })
})

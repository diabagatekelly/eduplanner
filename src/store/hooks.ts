/* istanbul ignore file -- typed wrappers, no logic to test; removed in Layer 3 */
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

/**
 * @deprecated Redux removed in Layer 3. Use `useSession()` from next-auth/react
 * or React Query for server state instead.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/**
 * @deprecated Redux removed in Layer 3. Use `useSession()` from next-auth/react
 * or React Query for server state instead.
 */
export const useAppSelector = useSelector.withTypes<RootState>()

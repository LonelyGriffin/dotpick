import {useNavigationState, NavigationState, useNavigation} from '@react-navigation/native'
import {useEffect} from 'react'
import {ScreensParams} from './screens_params'
import {useDispatch, useSelector} from 'react-redux'
import {GlobalState, GlobalStoreDispatch} from '../global_store'
import {setNavigationState, unqueueNavigationAction} from './navigation_slice'

export const NavigationStateSynchronizer = () => {
  const dispatch = useDispatch<GlobalStoreDispatch>()
  const actionsForExecutionQueue = useSelector((state: GlobalState) => state.navigation.actionsForExecutionQueue)
  const navigationState = useNavigationState((state) => state as NavigationState<ScreensParams>)
  const navigation = useNavigation()

  useEffect(() => {
    dispatch(setNavigationState(navigationState))
  }, [navigationState])

  useEffect(() => {
    if (actionsForExecutionQueue.length > 0) {
      navigation.dispatch(actionsForExecutionQueue[0])
      dispatch(unqueueNavigationAction())
    }
  }, [actionsForExecutionQueue])

  return null
}

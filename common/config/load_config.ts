import {Config} from './config'
import {CONFIG} from './result'
import {DynamicConfig} from './dynamic_config'
import {Result, ResultError} from '../../core/result'
import AsyncStorage from '@react-native-async-storage/async-storage'
import omit from 'lodash-es/omit'

export const loadConfig = async (): Promise<Config> => {
  const dynamicConfig = await loadDynamicConfig(CONFIG.dynamicConfigUrl)

  if (dynamicConfig.success) {
    return {
      ...CONFIG,
      ...omit(dynamicConfig.unwrap(), 'timestamp')
    }
  }

  return CONFIG
}

const loadDynamicConfig = async (serverConfigUrl: string) => {
  const serverDynamicConfig = await loadServerDynamicConfig(serverConfigUrl)

  if (serverDynamicConfig.success) {
    await tryStoreDynamicConfig(serverDynamicConfig.unwrap())
    return serverDynamicConfig
  }

  const storedDynamicConfig = await loadStoredDynamicConfig()

  if (storedDynamicConfig.success) {
    return storedDynamicConfig
  }

  return new ResultError<DynamicConfig>(new Error('Dynamic config not available'))
}

const loadServerDynamicConfig = async (configUrl: string) => {
  try {
    const response = await fetch(configUrl)
    return new Result<DynamicConfig>(await response.json())
  } catch (e) {
    return new ResultError<DynamicConfig>(e)
  }
}

const loadStoredDynamicConfig = async () => {
  try {
    const json = await AsyncStorage.getItem('DYNAMIC_CONFIG')

    if (json === null) {
      return new ResultError<DynamicConfig>(new Error('Dynamic config not found in async storage'))
    }

    return new Result<DynamicConfig>(JSON.parse(json))
  } catch (e) {
    return new ResultError<DynamicConfig>(e)
  }
}

const tryStoreDynamicConfig = async (config: DynamicConfig) => {
  try {
    await AsyncStorage.setItem('DYNAMIC_CONFIG', JSON.stringify(config))
  } catch {}
}

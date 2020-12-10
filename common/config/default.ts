import {Config} from './config'

export const DEFAULT_CONFIG: Config = {
  api: 'http://localhost:8000',
  dynamicConfigUrl: 'http://localhost:8000/runtime_config.json',
  storyIdsForPreloading: ['abc']
}

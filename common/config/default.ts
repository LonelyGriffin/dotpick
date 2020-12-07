import {Config} from './config'

export const DEFAULT_CONFIG: Config = {
  api: {
    baseUrl: 'localhost',
    port: 5555
  },
  dynamicConfigUrl: 'http://localhost:8000/runtime_config.json',
  storyIdsForPreloading: ['abc']
}

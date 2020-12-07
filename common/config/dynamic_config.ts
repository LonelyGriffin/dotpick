import {Config} from './config'

export type DynamicConfig = Partial<Config> & {
  timestamp: Date
}

import {DEFAULT_CONFIG} from './default'
import {LOCAL_CONFIG} from './local'
import {Config as ConfigType} from './config'

export type Config = ConfigType
export const CONFIG: Config = {...DEFAULT_CONFIG, ...LOCAL_CONFIG}

import {Config} from './config'
import {DEFAULT_CONFIG} from './default'
import {LOCAL_CONFIG} from './local'

export const CONFIG: Config = {...DEFAULT_CONFIG, ...LOCAL_CONFIG}

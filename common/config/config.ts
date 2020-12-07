export type Config = {
  api: {
    baseUrl: string
    port: number
  }
  dynamicConfigUrl: string
  storyIdsForPreloading: string[]
}

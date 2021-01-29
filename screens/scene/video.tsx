import React, {useCallback, useEffect, useRef} from 'react'
import {AVPlaybackStatus, Video} from 'expo-av'

type Props = {
  videoURI: string
  onFinished: () => void
  shouldPlay: boolean
}

export const VideoController = (props: Props) => {
  const playerRef = useRef<Video>(null)
  console.log('video render', props.shouldPlay)
  useEffect(() => {
    ;(async () => {
      if (!playerRef.current) {
        return
      }
      console.log('video effect', props.videoURI)
      await playerRef.current.loadAsync({uri: props.videoURI})
      console.log('video effect loaded', props.shouldPlay)
      await playerRef.current.setStatusAsync({shouldPlay: props.shouldPlay, positionMillis: 0})
      console.log('video effect finish')
    })()
  }, [props.videoURI])

  const handlePlayBackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded === false) {
      return
    }

    if (status.didJustFinish) {
      props.onFinished()
    }
  }, [])

  return (
    <Video
      ref={playerRef}
      rate={1.0}
      volume={0.5}
      resizeMode='stretch'
      progressUpdateIntervalMillis={16}
      style={{flex: 1}}
      onPlaybackStatusUpdate={handlePlayBackStatusUpdate}
    />
  )
}

export default VideoController

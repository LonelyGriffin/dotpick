import React, {useEffect, useRef} from 'react'
import {Screen} from '../common/layout/Screen'
import { Video } from 'expo-av'
import * as FileSystem from 'expo-file-system';

const TestScreen = () => {
  const playerRef = useRef<Video>(null)
  useEffect(() => {
    console.log('0')


    void (async () => {
      const videoResponse = await fetch('http://192.168.0.11:9080/video.mp4', {
        headers: {
          'Content-Type': 'video/mp4'
        }
      })

      const downloadResumable = FileSystem.createDownloadResumable(
        'http://192.168.0.11:9080/video.mp4',
        FileSystem.documentDirectory + 'small.mp4',
        {},
        () => {}
      );

      const { uri } = (await downloadResumable.downloadAsync())!;

      console.log('1', uri)

      // const blob = new Blob([await videoResponse.blob()], {
      //   type: 'video/mp4'
      // })

      // const videoUrl = URL.createObjectURL(new Blob())


      if (!playerRef.current) {
        return
      }

      await playerRef.current.loadAsync({
        uri: uri
      })

      await playerRef.current.playAsync()
    })()
  }, [])

  return (
    <Screen>
      <Video
        ref={playerRef}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={{ flex: 1 }}
      />
    </Screen>
  )
}

export default TestScreen

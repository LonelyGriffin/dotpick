import React, {useCallback, useEffect, useRef} from 'react'
import {AVPlaybackStatus, Video} from 'expo-av'
import {Text} from 'react-native'

type Props = {
  videoURI: string
  onFinished: () => void
  shouldPlay: boolean
}

type State = {
  loading: boolean
}

class VideoController extends React.Component<Props, State> {
  state: State = {
    loading: false
  }
  private playerRef1 = React.createRef<Video>()
  private playerRef2 = React.createRef<Video>()

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (nextProps.videoURI !== this.props.videoURI) {
      void this.play1(this.props.videoURI, true)
    }
    // return nextState.loading !== this.state.loading
    return false
  }

  componentDidMount() {
    this.play1(this.props.videoURI, this.props.shouldPlay)
  }

  async play1(videoURI: string, shouldPlay: boolean) {
    if (!this.playerRef1.current) {
      return
    }
    console.log('video1 effect', videoURI)
    // await this.playerRef1.current.unloadAsync()
    await this.playerRef1.current.loadAsync({uri: videoURI}, {shouldPlay: shouldPlay, positionMillis: 0})
    console.log('video1 effect finish')
  }

  handlePlayBackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded === false) {
      return
    }

    if (status.didJustFinish) {
      this.props.onFinished()
    }
  }

  componentWillUnmount() {
    console.log('video unmount')
  }

  render() {
    return (
      <Video
        ref={this.playerRef1}
        rate={1.0}
        volume={0.5}
        resizeMode='contain'
        progressUpdateIntervalMillis={16}
        style={{flex: 1, backgroundColor: 'red'}}
        onPlaybackStatusUpdate={this.handlePlayBackStatusUpdate}
      />
    )
  }
}

export default VideoController

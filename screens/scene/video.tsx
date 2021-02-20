import React from 'react'
import {AVPlaybackStatus, Video} from 'expo-av'

type Props = {
  videoURI: string
  onFinished: () => void
  from: number
  to: number
}

type State = {
  loading: boolean
}

class VideoController extends React.Component<Props, State> {
  private playerRef = React.createRef<Video>()
  private finished = false

  shouldComponentUpdate(nextProps: Props) {
    if (nextProps.from !== this.props.from) {
      this.playerRef.current!.setStatusAsync({positionMillis: nextProps.from, shouldPlay: true}).then(() => {
        this.finished = false
      })
    }
    // console.log(nextProps.from, nextProps.to)
    return false
  }

  componentDidMount() {
    console.log(this.props.from, this.props.to)
    this.playerRef
      .current!.loadAsync({uri: this.props.videoURI}, {shouldPlay: true, positionMillis: this.props.from})
      .then(() => {
        this.finished = false
      })
  }

  handlePlayBackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded === false || this.finished) {
      return
    }

    if (status.didJustFinish || status.positionMillis >= this.props.to) {
      this.finished = true
      this.playerRef.current!.pauseAsync().then(() => {
        this.props.onFinished()
      })
    }
  }

  render() {
    return (
      <Video
        ref={this.playerRef}
        rate={1.0}
        volume={0.5}
        resizeMode='cover'
        progressUpdateIntervalMillis={4}
        style={{flex: 1}}
        onPlaybackStatusUpdate={this.handlePlayBackStatusUpdate}
      />
    )
  }
}

export default VideoController

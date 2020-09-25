import React from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, Image, Text } from "@tarojs/components";
import { AtSlider, AtMessage, AtIcon } from "taro-ui";

import { neteaseApiHost } from "../../../src/service";
import { getSingerName } from "../../utils";

import "./index.scss";

const playMode = {
  1: {
    type: "repeat-play",
    name: "列表循环",
    icon: <AtIcon value="repeat-play" size="24"></AtIcon>,
  },
  2: {
    type: "shuffle-play",
    name: "随机播放",
    icon: <AtIcon value="shuffle-play" size="24"></AtIcon>,
  },
  3: {
    type: "reload",
    name: "单曲循环",
    icon: <AtIcon value="reload" size="24"></AtIcon>,
  },
};

type LyricsType = {
  time: string;
  content: string;
};

type SongType = {
  name: string;
};

type StateType = {
  isPlay: boolean;
  isCollect: boolean;
  timeLength: number;
  songs: SongType;
  playTime: number;
  audioCtx: Taro.BackgroundAudioManager;
  img: string;
  singerName: string;
  lyrics: LyricsType[];
  currentPlayMode: number;
};

interface Play {
  state: StateType;
}

class Play extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPlay: true,
      isCollect: false,
      timeLength: 0,
      songs: { name: "" },
      playTime: 0,
      audioCtx: {} as Taro.BackgroundAudioManager,
      img: "",
      singerName: "",
      lyrics: [],
      currentPlayMode: 1,
    };
  }
  componentDidMount() {
    const id = this.current.router?.params.id || "";
    if (id) {
      this.initPlayer(id);
    } else {
      Taro.atMessage({
        message: "播放错误，自动播放下一首",
        type: "error",
        duration: 1500,
      });
    }
  }
  // 路由
  current = getCurrentInstance();
  initPlayer = (id) => {
    Promise.all([
      Taro.request({
        url: `${neteaseApiHost}/song/url`,
        data: { id: id },
      }),
      Taro.request({
        url: `${neteaseApiHost}/song/detail?ids=${id}`,
      }),
    ]).then((res) => {
      this.getLyrics(id);
      const song = res[1].data.songs[0];
      Taro.setNavigationBarTitle({
        title: song.name,
      });
      this.setState({
        songs: song,
        img: song.al.picUrl,
        singerName: getSingerName(song.ar),
      });
      const tempFilePath = res[0].data.data[0].url;
      const bgMusic = Taro.getBackgroundAudioManager();
      if (Taro.getStorageSync("songId") != id) {
        // 这里必须配置title，不然不播放
        bgMusic.title = song.name;
        bgMusic.src = tempFilePath;
        Taro.setStorageSync("songId", id);
        Taro.setStorageSync("songImg", song.al.picUrl);
      } else {
        bgMusic.title = song.name;
        bgMusic.src = tempFilePath;
      }
      bgMusic.onTimeUpdate(() => {
        this.setState({
          timeLength: bgMusic.duration,
          playTime: bgMusic.currentTime,
        });
      });
      bgMusic.onEnded(() => {
        this.next();
      });
      bgMusic.onError(() => {
        Taro.atMessage({
          message: "播放错误，自动播放下一首",
          type: "error",
          duration: 1500,
        });
        setTimeout(() => {
          this.next();
        }, 2000);
      });
      this.setState({
        audioCtx: bgMusic,
      });
    });
  };
  //获取歌词
  getLyrics(id) {
    this.setState({
      lyrics: [],
    });
    Taro.request({
      url: `${neteaseApiHost}/lyric?id=${id}`,
      header: {
        "content-type": "application/json",
      },
    }).then((res) => {
      const lines = res.data.nolyric ? [] : res.data.lrc.lyric.split("\n");
      let result = [] as LyricsType[];
      for (var i = 0; i < lines.length - 1; i++) {
        var subTxt = lines[i].substring(
          lines[i].indexOf("[") + 1,
          lines[i].indexOf("]")
        );
        var c = lines[i].substr(lines[i].lastIndexOf("]") + 1);
        var obj = {} as LyricsType;
        obj.time = subTxt.split(".")[0];
        obj.content = c.trim();
        result.push(obj);
      }
      this.setState({
        lyrics: result,
      });
    });
  }
  getPlayLyrics(time) {
    const { lyrics } = this.state;
    const currentTime = this.conversion(time);
    for (var j = 0; j < lyrics.length; j++) {
      if (j === lyrics.length - 1) {
        return lyrics[lyrics.length - 1].content;
      } else {
        if (lyrics[j].time <= currentTime && lyrics[j + 1].time > currentTime) {
          return lyrics[j].content;
        }
      }
    }
  }
  prev() {
    const songList = Taro.getStorageSync("songList");
    const songId = Taro.getStorageSync("songId");
    for (let i = 0; i < songList.length; i++) {
      if (songList[i].id == songId) {
        if (i === 0) {
          var num = Number(songList.length);
          var id = songList[num - 1].id;
          this.initPlayer(id);
        } else {
          var id = songList[--i].id;
          this.initPlayer(id);
        }
      }
    }
  }
  // 播放下一首
  next() {
    const songList = Taro.getStorageSync("songList");
    const songId = Taro.getStorageSync("songId");
    for (let i = 0; i < songList.length; i++) {
      if (songList[i].id == songId) {
        var num = Number(songList.length) - 1;
        if (i === num) {
          var id = songList[0].id;
          this.initPlayer(id);
        } else {
          var id = songList[++i].id;
          this.initPlayer(id);
        }
      }
    }
  }
  play() {
    const { isPlay, audioCtx } = this.state;
    if (isPlay) {
      audioCtx.pause();
      Taro.removeStorageSync("songId");
    } else {
      audioCtx.play();
      Taro.getStorageSync("songId");
    }
    this.setState({
      isPlay: !isPlay,
    });
  }
  pattern() {
    const { currentPlayMode } = this.state;
    const length = Object.keys(playMode).length;
    this.setState(
      {
        currentPlayMode: currentPlayMode === length ? 1 : currentPlayMode + 1,
      },
      () => {
        Taro.showToast({
          title: `已切换到${playMode[currentPlayMode].name}`,
          icon: "none",
        });
      }
    );
  }
  format(time) {
    let minutes = (time / 60) | 0; // |是向下取正
    let seconds = time % 60 | 0;
    let temp = JSON.stringify(seconds);
    if (seconds < 10) {
      temp = "0" + seconds;
    }
    return minutes + ":" + temp;
  }
  conversion(time) {
    let minutes = (time / 60) | 0; // |是向下取正
    let seconds = time % 60 | 0;
    let tempM = JSON.stringify(minutes);
    let tempS = JSON.stringify(seconds);
    if (minutes < 10) {
      tempM = "0" + minutes;
    }
    if (seconds < 10) {
      tempS = "0" + seconds;
    }
    return tempM + ":" + tempS;
  }
  sliderChange(e) {
    this.state.audioCtx.seek(e);
    this.getPlayLyrics(e);
  }
  collection() {
    // if (!this.state.isCollect) {
    //   wx.showToast({
    //     title: "表面收藏成功",
    //     image: imgsrc,
    //   });
    // } else {
    //   wx.showToast({
    //     title: "取消收藏成功",
    //     image: imgsrc,
    //   });
    // }
    this.setState({
      isCollect: !this.state.isCollect,
    });
  }
  render() {
    const {
      isPlay,
      isCollect,
      timeLength,
      songs,
      playTime,
      img,
      singerName,
      lyrics,
      currentPlayMode,
    } = this.state;
    return (
      <View className="play">
        <Image className="bg-img" src={img} />
        <View className="components">
          <View className="music-name">{songs.name}</View>
          <View className="singer-name">{singerName}</View>
          <View className="singer-img">
            <Image
              className={
                isPlay ? "rotate music-img" : "rotate rotate-pause music-img"
              }
              src={img}
            />
          </View>
          <View className="lyric">
            {lyrics.length != 0
              ? this.getPlayLyrics(playTime)
              : "玩命加载中..."}
          </View>
          <View>
            <View className="slider">
              <Text className="start-time">{this.format(playTime)}</Text>
              <AtSlider
                className="slider-width"
                step={1}
                value={playTime}
                max={timeLength}
                onChange={(e) => this.sliderChange(e)}
                activeColor="#f60"
                backgroundColor="#BDBDBD"
                blockColor="#f60"
                blockSize={12}
              ></AtSlider>
              <Text className="end-time">{this.format(timeLength)}</Text>
            </View>
            <View className="play-button">
              <View className="type" onClick={() => this.pattern()}>
                {playMode[currentPlayMode].icon}
              </View>
              <View className="prev" onClick={() => this.prev()}>
                <AtIcon value="chevron-left" size="24"></AtIcon>
              </View>
              <View className="play-btn" onClick={() => this.play()}>
                {isPlay ? (
                  <AtIcon value="pause" size="24"></AtIcon>
                ) : (
                  <AtIcon value="play" size="24"></AtIcon>
                )}
              </View>
              <View className="next" onClick={() => this.next()}>
                <AtIcon value="chevron-right" size="24"></AtIcon>
              </View>
              <View className="heart" onClick={() => this.collection()}>
                {isCollect ? (
                  <AtIcon value="heart-2" size="24"></AtIcon>
                ) : (
                  <AtIcon value="heart" size="24"></AtIcon>
                )}
              </View>
            </View>
          </View>
        </View>
        <AtMessage />
      </View>
    );
  }
}
export default Play;

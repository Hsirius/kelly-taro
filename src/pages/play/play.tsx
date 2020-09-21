import Taro from "@tarojs/taro";
import React from "react";
import { View } from "@tarojs/components";
import { inject, observer } from "mobx-react";

type PageStateProps = {
  store: {
    playUrl: {
      info: {
        url: string;
        name: string;
      };
    };
  };
};

interface Play {
  props: PageStateProps;
}

@inject("store")
@observer
class Play extends React.Component {
  componentDidMount() {
    const {
      playUrl: { info },
    } = this.props.store;
    Taro.setNavigationBarTitle({
      title: info.name
    })
    this.initPlayer(info.url);
  }
  initPlayer = (url) => {
    const innerAudioContext = Taro.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.src = url;
    innerAudioContext.onPlay(() => { });
    innerAudioContext.onError((err) => {
      Taro.showToast({
        title: JSON.stringify(err),
      });
    });
  };

  render() {
    return <View className="index">play</View>;
  }
}

export default Play;

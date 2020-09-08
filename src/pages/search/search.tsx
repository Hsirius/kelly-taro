import Taro from "@tarojs/taro";
import React, { useState, useEffect } from "react";
import { View, Input, Icon, Text } from "@tarojs/components";
import { AtTabs, AtTabsPane } from "taro-ui";

import { qqGetSong, qqGetSongUrl } from "../../../src/service";

import "./search.scss";

interface Search {
  val: string;
}

const Search = () => {
  const [val, setVal] = useState("");
  const [current, setCurrent] = useState(0);
  const [qqsong, setQQSong] = useState([] as any[]);
  const [neteaseSong, setNeteaseSong] = useState([] as any[]);

  const handleInput = (e) => {
    setVal(e.target.value);
  };
  const getSearchData = async () => {
    try {
      Taro.request({
        url: qqGetSong,
        data: { w: val },
      }).then((res) => {
        let result = res.data.replace(/^callback\(/, "");
        result = JSON.parse(result.substr(0, result.length - 1)) as any[];
        setQQSong([...result.data.song.list]);
      });
      Taro.request({
        url: "http://localhost:4000/search",
        data: { keywords: val },
      }).then((res) => {
        console.log(res.data.result.songs);
        setNeteaseSong(res.data.result.songs);
      });
    } catch (error) {
      Taro.showToast({
        title: "载入远程数据错误",
      });
    }
  };

  const readyToPlay = (item) => {
    const timeStamp = String(new Date().getTime()).substr(-9);
    try {
      Taro.request({
        url: qqGetSongUrl,
        data: { songid: item.songmid },
      }).then((res) => {
        console.log(res.data);
      });
    } catch (error) {
      Taro.showToast({
        title: "载入远程数据错误",
      });
    }
  };

  const readyToPlayNetease = (item) => {
    try {
      Taro.request({
        url: "http://localhost:4000/song/url",
        data: { id: item.id },
      }).then((res) => {
        const tempFilePath = res.data.data[0].url;
        Taro.playVoice({
          filePath: tempFilePath,
          complete: function () {},
        });
      });
    } catch (error) {
      Taro.showToast({
        title: "载入远程数据错误",
      });
    }
  };

  useEffect(() => {
    if (val) getSearchData();
  }, [val]);

  return (
    <View>
      <View className="header">
        <Input
          className="search-inp"
          type="text"
          focus
          value={val}
          placeholder="搜索歌手或歌曲名"
          onInput={handleInput}
        />
        <Icon size="20" className="search-icon" type="search" />
      </View>
      <AtTabs
        current={current}
        scroll
        tabList={[{ title: "网易" }, { title: "QQ" }, { title: "标签页3" }]}
        onClick={(index) => setCurrent(index)}
      >
        <AtTabsPane current={current} index={0}>
          <View className="list-box">
            {neteaseSong.map((item) => (
              <View
                key={item.id}
                className="list"
                onClick={() => readyToPlayNetease(item)}
              >
                <View>{item.name}</View>
                <View className="info">
                  {item.artists.map((artist, index) => (
                    <Text key={artist.id}>
                      <Text>{artist.name}</Text>
                      {index < item.artists.length - 1 && <Text>/</Text>}
                    </Text>
                  ))}
                  <Text> - </Text>
                  <Text decode>{item.album.name}</Text>
                </View>
              </View>
            ))}
          </View>
        </AtTabsPane>
        <AtTabsPane current={current} index={1}>
          <View className="list-box">
            {qqsong.map((item) => (
              <View
                key={item.alertid}
                className="list"
                onClick={() => readyToPlay(item)}
              >
                <View>{item.songname}</View>
                <View className="info">
                  {item.singer.map((artist, index) => (
                    <Text key={artist.id}>
                      <Text>{artist.name}</Text>
                      {index < item.singer.length - 1 && <Text>/</Text>}
                    </Text>
                  ))}
                  <Text> - </Text>
                  <Text decode>{item.albumname}</Text>
                </View>
              </View>
            ))}
          </View>
        </AtTabsPane>
        <AtTabsPane current={current} index={2}>
          <View style="font-size:18px;text-align:center;height:100px;">
            标签页三的内容
          </View>
        </AtTabsPane>
      </AtTabs>
    </View>
  );
};

export default Search;

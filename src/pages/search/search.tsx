import Taro from "@tarojs/taro";
import React, { useState, useEffect } from "react";
import { View, Input, Icon, Text } from "@tarojs/components";
import { AtTabs, AtTabsPane } from "taro-ui";

import playUrl from "../../store/playUrl";
import { neteaseApiHost, qqGetSong, qqGetSongUrl } from "../../../src/service";

import "./search.scss";

interface Search {
  val: string;
}

const Search = () => {
  const [val, setVal] = useState("");
  const [current, setCurrent] = useState(0);
  const [qqsong, setQQSong] = useState([] as any[]);
  const [neteaseSong, setNeteaseSong] = useState([] as any[]);
  // 处理input的值
  const handleInput = (e) => {
    setVal(e.target.value);
  };
  // 处理qq返回结果
  const handleQqResult = (d) => {
    let result = d.data.replace(/^callback\(/, "");
    result = JSON.parse(result.substr(0, result.length - 1)) as any[];
    setQQSong([...result.data.song.list]);
  };
  // 处理网易返回结果
  const handleNeteaseResult = (d) => {
    setNeteaseSong(d.data.result.songs);
  };
  const getSearchData = async () => {
    try {
      Promise.all([
        Taro.request({
          url: qqGetSong,
          data: { w: val },
        }),
        Taro.request({
          url: `${neteaseApiHost}/search`,
          data: { keywords: val },
        }),
      ]).then((res) => {
        handleQqResult(res[0]);
        handleNeteaseResult(res[1]);
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
        url: `${neteaseApiHost}/song/url`,
        data: { id: item.id },
      }).then((res) => {
        console.log(res);
        console.log(item);

        const tempFilePath = res.data.data[0].url;
        const info = Object.assign(item, { url: tempFilePath });
        playUrl.resetSongInfo(info);
        Taro.navigateTo({
          url: "/pages/play/play",
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

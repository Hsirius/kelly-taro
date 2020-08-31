import Taro from "@tarojs/taro";
import React, { useState, useEffect } from "react";
import { View, Input, Icon } from "@tarojs/components";

import qqApiHost from "../../../src/service";

import "./search.scss";

interface Search {
  val: string;
}

const Search = () => {
  const [val, setVal] = useState("");
  const [song, setSong] = useState([] as any[]);

  const handleInput = (e) => {
    setVal(e.target.value);
  };
  const getSearchData = async () => {
    try {
      Taro.request({
        url: qqApiHost,
        data: { w: val },
      }).then((res) => {
        let result = res.data.replace(/^callback\(/, "");
        result = JSON.parse(result.substr(0, result.length - 1)) as any[];
        setSong([...result.data.song.list]);
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
      <View>
        {song.map((item) => (
          <div>{item.songname}</div>
        ))}
      </View>
    </View>
  );
};

export default Search;

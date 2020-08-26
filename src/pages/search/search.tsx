import Taro from "@tarojs/taro";
import React, { useState, useEffect } from "react";
import { View, Input, Icon } from "@tarojs/components";

import "./search.scss";

interface Search {
  val: string;
}

const Search = () => {
  const [val, setVal] = useState("");
  const handleInput = (e) => {
    setVal(e.target.value);
  };
  const getSearchData = async (key) => {
    try {
      Taro.request({ url: "test.php" }).then((res) => {
        console.log(res);
      });
    } catch (error) {
      Taro.showToast({
        title: "载入远程数据错误",
      });
    }
  };

  useEffect(() => {
    getSearchData(val);
  }, [val]);

  return (
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
  );
};

export default Search;

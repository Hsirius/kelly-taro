import Taro from "@tarojs/taro";
import React from "react";
import { View, Input } from "@tarojs/components";

import "./index.scss";

const Index = () => {
  const toSearch = () => {
    Taro.navigateTo({
      url: "/pages/search/search",
    });
  };

  return (
    <View className="index">
      <Input
        className="search-box"
        type="text"
        placeholder="搜索"
        onClick={toSearch}
      />
    </View>
  );
};

export default Index;

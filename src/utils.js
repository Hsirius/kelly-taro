// 格式化歌手名称
export const getSingerName = (singers) => {
  let result = "";
  if (Array.isArray(singers)) {
    singers.forEach((item, index) => {
      if (index === singers.length - 1) {
        result += item.name;
      } else {
        result += `${item.name}/`;
      }
    });
  } else {
    result = singers;
  }
  return result;
};

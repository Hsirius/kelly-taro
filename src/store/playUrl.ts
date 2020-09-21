import { action, observable } from "mobx";

const playUrl = observable({
  info: {},
  resetSongInfo: action((info) => {
    playUrl.info = info;
  }),
});

export default playUrl;

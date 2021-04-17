<template>
  <div id="app">
    <pulldown-list
      class="list"
      :load-status="loadStatus"
      :refresh-status="refreshStatus"
      @refresh="onRefresh"
      @load="onLoad"
    >
      <div class="list__container">
        <div class="item" v-for="item in list" :key="item">{{ item }}</div>
      </div>
    </pulldown-list>
  </div>
</template>

<script>
import PulldownList from "./components/PulldownList";
export default {
  name: "App",
  data() {
    return {
      refreshStatus: "none",
      loadStatus: "none",
      list: 20,
      page: 1,
    };
  },
  components: {
    PulldownList,
  },
  methods: {
    async getList() {
      await new Promise((resolve) => setTimeout(resolve, 6000));
      this.list = this.page === 1 ? 20 : this.list + 20;
    },
    async onRefresh() {
      this.page = 1;
      this.refreshStatus = "refreshing";
      await this.getList();
      this.refreshStatus = "success";
    },
    async onLoad() {
      this.page++;
      this.loadStatus = "loading";
      await this.getList();
      this.loadStatus = this.list === 60 ? "finished" : "success";
    },
  },
};
</script>

<style lang="less">
html,
body {
  margin: 0;
  padding: 0;
}

.list {
  height: calc(100vh - var(--vh-offset, 0px));

  &__container {
    padding: 12px;
  }
}
.item {
  height: 60px;
  line-height: 60px;
  text-align: center;
  background-color: #f7f7f7;
  margin-bottom: 12px;
  border-radius: 6px;
}
</style>

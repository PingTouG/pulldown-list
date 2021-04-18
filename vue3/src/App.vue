<template>
    <pulldown-list
      class="list"
      :is-empty="state.list === 0"
      is-first-load
      :load-status="state.loadStatus"
      :refresh-status="state.refreshStatus"
      @refresh="onRefresh"
      @load="onLoad"
    >
      <div class="list__container">
        <div class="item" v-for="item in state.list" :key="item">{{ item }}</div>
      </div>
    </pulldown-list>
</template>

<script lang="ts" setup>
import { defineComponent, reactive } from 'vue'
import PulldownList from "./components/PulldownList.vue";

const state = reactive({
  refreshStatus: "none",
  loadStatus: "none",
  list: 0,
  page: 1,
})

const getList = async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  // this.list = 0;
  state.list = state.page === 1 ? 20 : state.list + 20;
}

const onRefresh = async ()=>{
  state.page = 1;
  state.refreshStatus = "refreshing";
  await getList();
  state.refreshStatus = "success";
}

const onLoad = async () => {
  state.page++;
  state.loadStatus = "loading";
  await getList();
  state.loadStatus = state.list === 60 ? "finished" : "success";
}

defineComponent({
  components: {
    PulldownList
  }
})
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

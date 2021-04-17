<template>
  <div class="pulldown-list" ref="pulldown">
    <div class="pulldown-list__content">
      <div class="refresh" v-if="isRefresh">
        <div class="refresh__tips" :style="tipsColor">
          <load-icon
            class="refresh__icon"
            :color="color"
            v-show="pulldownStatus === 'refreshing'"
          />
          <div class="refresh__text" v-show="pulldownTip">
            {{ pulldownTip }}
          </div>
        </div>
      </div>
      <div class="pulldonw-list__container">
        <slot />
      </div>
      <div class="load" v-if="isLoad">
        <div class="load__tips" :style="tipsColor">
          <load-icon
            class="load__icon"
            :color="color"
            v-show="pullupStatus === 'loading'"
          />
          <div class="load__text" v-show="pullupTip">
            {{ pullupTip }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BScroll from "@better-scroll/core";
import Pulldown from "@better-scroll/pull-down";
import Pullup from "@better-scroll/pull-up";
import LoadIcon from "./LoadIcon";

export default {
  name: "PulldownList",
  components: { LoadIcon },
  props: {
    isRefresh: {
      type: Boolean,
      default: true,
    },
    refreshOffset: {
      typ: Number,
      default: 60,
    },
    refreshStatus: {
      type: String,
      default: "none",
      validator: (val) =>
        ["none", "refreshing", "success", "error"].includes(val),
    },
    refreshText: {
      type: String,
      default: "下拉刷新",
    },
    refreshWaitText: {
      type: String,
      default: "释放刷新",
    },
    refreshingText: {
      type: String,
      default: "",
    },
    refreshSuccessText: {
      type: String,
      default: "刷新成功",
    },
    refreshErrorText: {
      type: String,
      default: "刷新失败,请稍后重试",
    },
    isLoad: {
      type: Boolean,
      default: true,
    },
    loadOffset: {
      typ: Number,
      default: 60,
    },
    loadStatus: {
      type: String,
      default: "none",
      validator: (val) =>
        ["none", "loading", "success", "error", "finished"].includes(val),
    },
    loadText: {
      type: String,
      default: "上拉加载更多",
    },
    loadingText: {
      type: String,
      default: "",
    },
    loadSuccessText: {
      type: String,
      default: "加载成功",
    },
    loadErrorText: {
      type: String,
      default: "加载失败,请稍后重试",
    },
    loadFinishedText: {
      type: String,
      default: "已经到底了",
    },
    color: {
      type: String,
      default: "#2f54eb",
    },
  },
  data() {
    return {
      pulldownStatus: "none",
      pullupStatus: "none",
      bs: null,
    };
  },
  computed: {
    pulldownTip() {
      const tips = {
        none: this.refreshText,
        wait: this.refreshWaitText,
        refreshing: this.refreshingText,
        success: this.refreshSuccessText,
        error: this.refreshErrorText,
      };

      return tips[this.pulldownStatus];
    },
    pullupTip() {
      const tips = {
        none: this.loadText,
        loading: this.loadingText,
        success: this.loadSuccessText,
        error: this.loadErrorText,
        finished: this.loadFinishedText,
      };

      return tips[this.pullupStatus];
    },
    tipsColor() {
      return { color: this.color };
    },
  },
  watch: {
    refreshStatus(val) {
      this.pulldownStatus = val;
      val === "success" && this.bs.refresh();
      this.loadStatus === "finished" && this.bs.finishPullUp();

      if (["success", "error"].includes(val)) {
        setTimeout(() => this.bs.finishPullDown(), 800);
        setTimeout(() => (this.pulldownStatus = "none"), 1000);
      }
    },
    loadStatus(val) {
      this.pullupStatus = val;
      ["success", "finished"].includes(val) && this.bs.refresh();

      if (["success", "error"].includes(val)) {
        this.bs.finishPullUp();
        setTimeout(() => (this.pullupStatus = "none"), 100);
      }
    },
  },
  created() {
    this.pulldownStatus = this.refreshStatus;
    this.pullupStatus = this.loadStatus;
  },
  mounted() {
    let pullDownRefresh = false;
    if (this.isRefresh) {
      BScroll.use(Pulldown);
      pullDownRefresh = {
        threshold: this.refreshOffset,
        stop: 40,
      };
    }

    let pullUpLoad = false;
    if (this.isLoad) {
      BScroll.use(Pullup);
      pullUpLoad = {
        threshold: this.loadOffset,
      };
    }

    this.bs = new BScroll(this.$refs.pulldown, {
      scrollY: true,
      useTransition: false,
      pullDownRefresh,
      pullUpLoad,
    });

    this.bs.on("scroll", this.onScroll);
    this.isRefresh && this.bs.on("pullingDown", this.onRefreshing);
    this.isLoad && this.bs.on("pullingUp", this.onLoading);
    this.$emit("ready", this.bs);
  },
  methods: {
    onRefreshing() {
      this.pulldownStatus = "refreshing";
      this.$emit("refresh");
    },
    onLoading() {
      this.pullupStatus = "loading";
      this.$emit("load");
    },
    onScroll({ y }) {
      y > this.refreshOffset
        ? this.pulldownStatus === "none" && (this.pulldownStatus = "wait")
        : this.pulldownStatus === "wait" && (this.pulldownStatus = "none");
    },
  },
};
</script>

<style lang="less">
.pulldown-list {
  overflow: hidden;
}

.refresh,
.load {
  &__tips {
    width: 100%;
    box-sizing: border-box;
    font-size: 12px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__text {
    margin-left: 12px;
  }
}
.refresh__tips {
  position: absolute;
  transform: translateY(-100%) translateZ(0);
}
</style>

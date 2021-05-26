<template>
  <div class="pulldown-list" ref="pulldown">
    <div class="pulldown-list__container">
      <div class="refresh" v-if="!pulldownDisabled">
        <div class="refresh__tips" :style="tipsColor">
          <load-icon
            class="refresh__icon"
            :color="iconColor"
            v-show="pulldownStatus === 'refreshing'"
          />
          <div class="refresh__text" v-show="pulldownTip">
            {{ pulldownTip }}
          </div>
        </div>
      </div>
      <div class="pulldonw-list__content">
        <div class="empty" v-if="emptyVisible">
          <template v-if="$slots.empty">
            <slot name="empty" />
          </template>
          <empty-icon v-else />
        </div>
        <slot v-else />
      </div>
      <div class="load" v-if="!pullupDisabled">
        <div class="load__tips" :style="tipsColor">
          <load-icon
            class="load__icon"
            :color="iconColor"
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
import EmptyIcon from "./EmptyIcon";

export default {
  name: "PulldownList",
  components: { LoadIcon, EmptyIcon },
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
    textColor: {
      type: String,
      default: "#2f54eb",
    },
    iconColor: {
      type: String,
      default: "#2f54eb",
    },
    isEmpty: {
      type: Boolean,
      default: false,
    },
    isFirstLoad: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      pulldownStatus: "none",
      pullupStatus: "none",
      firstLoaded: false,
      bs: null,
    };
  },
  computed: {
    pulldownDisabled() {
      return this.pullupStatus === "loading" || !this.isRefresh;
    },
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
    pullupDisabled() {
      return (
        this.pulldownStatus === "refreshing" || !this.isLoad || this.isEmpty
      );
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
      return { color: this.textColor };
    },
    emptyVisible() {
      return (
        (!this.isFirstLoad || (this.isFirstLoad && this.firstLoaded)) &&
        this.isEmpty
      );
    },
  },
  watch: {
    refreshStatus(val) {
      this.pulldownStatus = val;
      // 成功加载数据之后需要重新计算BetterScroll以确保滚动效果正常
      val === "success" && this.bs.refresh();
      // 刷新状态触发刷新事件
      val === "refreshing" && this.bs.value.autoPullDownRefresh();
      // 如果刷新时已经加载全部的数据，则需要在触发刷新时将加载状态重置
      if (this.loadStatus === "finished") {
        this.pullupStatus = "none";
        this.bs.finishPullUp();
      }
      // 若设置首次加载数据，则需要在成功之后将firstLoaded设置为true
      ["success", "error", "finished"].includes(val) &&
        this.isFirstLoad &&
        !this.firstLoaded &&
        (this.firstLoaded = true);

      if (["success", "error"].includes(val)) {
        // 每次触发刷新事件后需要手动调用finishPullDown来告诉BetterScroll准备下次刷新事件
        setTimeout(() => this.bs.finishPullDown(), 800);
        setTimeout(() => (this.pulldownStatus = "none"), 1000);
      }
    },
    loadStatus(val) {
      this.pullupStatus = val;
      // 成功加载数据之后需要重新计算BetterScroll以确保滚动效果正常
      ["success", "finished"].includes(val) && this.bs.refresh();

      if (["success", "error"].includes(val)) {
        // 每次触发加载事件后需要手动调用finishPullUp来告诉BetterScroll准备下次加载事件
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
    // 下拉刷新设置
    let pullDownRefresh = false;
    if (this.isRefresh) {
      BScroll.use(Pulldown);
      pullDownRefresh = {
        threshold: this.refreshOffset,
        stop: 40,
      };
    }

    // 上拉加载更多设置
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

    // 进行首次加载数据，自动触发刷新
    this.isFirstLoad && this.bs.autoPullDownRefresh();
  },
  methods: {
    onRefreshing() {
      if (this.pulldownDisabled) {
        this.bs.finishPullUp();
      } else {
        this.pulldownStatus = "refreshing";
        this.$emit("refresh");
      }
    },
    onLoading() {
      if (this.pullupDisabled) {
        this.bs.finishPullDown();
      } else {
        this.pullupStatus = "loading";
        this.$emit("load");
      }
    },
    onScroll(pos) {
      const { y } = pos;
      y > this.refreshOffset
        ? this.pulldownStatus === "none" && (this.pulldownStatus = "wait")
        : this.pulldownStatus === "wait" && (this.pulldownStatus = "none");

      this.$emit("scroll", pos);
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

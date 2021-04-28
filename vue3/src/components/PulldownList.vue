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

<script lang="ts" setup>
import { computed, defineComponent, ref,defineProps, onMounted,defineEmit, watch  } from 'vue'
import type { Ref } from 'vue'
import BScroll from "@better-scroll/core";
import Pulldown from "@better-scroll/pull-down";
import Pullup from "@better-scroll/pull-up";
import LoadIcon from "./LoadIcon.vue";
import EmptyIcon from "./EmptyIcon.vue";

const props = defineProps({
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
      validator: (val:string) =>
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
      validator: (val:string) =>
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
  })

// 下拉刷新设置
let pullDownRefresh:any = false;
if (props.isRefresh) {
  BScroll.use(Pulldown);
  pullDownRefresh = {
    threshold: props.refreshOffset,
    stop: 40,
  };
}
const pulldownStatus:Ref<string> = ref(props.refreshStatus)
const pulldownDisabled = computed(() => pullupStatus.value === "loading" || !props.isRefresh)
const pulldownTip = computed(() => {
  const tips: { [prop:string]:string } = {
        none: props.refreshText,
        wait: props.refreshWaitText,
        refreshing: props.refreshingText,
        success: props.refreshSuccessText,
        error: props.refreshErrorText,
      };

      return tips[pulldownStatus.value];
})
watch(
  () => props.refreshStatus,
  (val)=>{
    pulldownStatus.value = val;
    // 成功加载数据之后需要重新计算BetterScroll以确保滚动效果正常
    val === "success" && bs.value.refresh();
    // 如果刷新时已经加载全部的数据，则需要在触发刷新时将加载状态重置
    if (props.loadStatus === "finished") {
      pullupStatus.value = "none";
      bs.value.finishPullUp();
    }
    // 若设置首次加载数据，则需要在成功之后将firstLoaded设置为true
    ["success", "error", "finished"].includes(val) &&
    props.isFirstLoad &&
    !firstLoaded.value &&
    (firstLoaded.value = true);

    if (["success", "error"].includes(val)) {
      // 每次触发刷新事件后需要手动调用finishPullDown来告诉BetterScroll准备下次刷新事件
      setTimeout(() => bs.value.finishPullDown(), 800);
      setTimeout(() => (pulldownStatus.value = "none"), 1000);
    }
})
const onRefreshing = () => {
  if (pulldownDisabled.value) {
    bs.value.finishPullUp();
  } else {
    pulldownStatus.value = "refreshing";
    emit("refresh");
  }
}

// 上拉加载更多设置
let pullUpLoad:any = false;
if (props.isLoad) {
  BScroll.use(Pullup);
  pullUpLoad = {
    threshold: props.loadOffset,
  };
}
const pullupStatus = ref(props.loadStatus)
const pullupDisabled = computed(() => pulldownStatus.value === "refreshing" || !props.isLoad || props.isEmpty)
const pullupTip = computed(() => {
  const tips: { [prop:string]:string } = {
    none: props.loadText,
    loading: props.loadingText,
    success: props.loadSuccessText,
    error: props.loadErrorText,
    finished: props.loadFinishedText,
  }
  return tips[pullupStatus.value];
})
watch(
  () => props.loadStatus,
  (val) => {
    pullupStatus.value = val;
    // 成功加载数据之后需要重新计算BetterScroll以确保滚动效果正常
    ["success", "finished"].includes(val) && bs.value.refresh();

    if (["success", "error"].includes(val)) {
      // 每次触发加载事件后需要手动调用finishPullUp来告诉BetterScroll准备下次加载事件
      bs.value.finishPullUp();
      setTimeout(() => (pullupStatus.value = "none"), 100);
    }
  }
)
const onLoading = () =>{
  if (pullupDisabled.value) {
    bs.value.finishPullDown();
  } else {
    pullupStatus.value = "loading";
    emit("load");
  }
}

const tipsColor = computed(() => ({ color: props.textColor }))
const firstLoaded = ref(false)
const emptyVisible = computed(() => (!props.isFirstLoad || (props.isFirstLoad && firstLoaded.value)) && props.isEmpty)

const bs:any = ref(null)
const pulldown:any = ref(null)
const emit = defineEmit()
const onScroll = (pos:any) => {
  const { y } = pos;
  y > props.refreshOffset
        ? pulldownStatus.value === "none" && (pulldownStatus.value = "wait")
        : pulldownStatus.value === "wait" && (pulldownStatus.value = "none");

  emit("scroll", pos);
}

onMounted(()=>{
    bs.value = new BScroll(pulldown.value, {
      scrollY: true,
      useTransition: false,
      pullDownRefresh,
      pullUpLoad,
    });


    bs.value.on("scroll", onScroll);
    props.isRefresh && bs.value.on("pullingDown", onRefreshing);
    props.isLoad && bs.value.on("pullingUp", onLoading);
    emit("ready", bs.value);

    // 进行首次加载数据，自动触发刷新
    props.isFirstLoad && bs.value.autoPullDownRefresh();
})


defineComponent({
  name: "PulldownList",
  components: { LoadIcon, EmptyIcon },
})
</script>

<style lang="less" scoped>
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

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import BScroll from '@better-scroll/core'
  import Pulldown from '@better-scroll/pull-down'
  import Pullup from '@better-scroll/pull-up'
  import LoadIcon from './LoadIcon.svelte'
  import EmptyIcon from './EmptyIcon.svelte'

  let className: string
  export { className as class }
  export let isRefresh: boolean = true
  export let refreshOffset: number = 60
  export let refreshStatus: string = 'none'
  export let refreshText: string = '下拉刷新'
  export let refreshWaitText: string = '释放刷新'
  export let refreshingText: string = ''
  export let refreshSuccessText: string = '刷新成功'
  export let refreshErrorText: string = '刷新失败,请稍后重试'

  export let isLoad: boolean = true
  export let loadOffset: number = 60
  export let loadStatus: string = 'none'
  export let loadText: string = '上拉加载更多'
  export let loadingText: string = ''
  export let loadSuccessText: string = '加载成功'
  export let loadErrorText: string = '加载失败,请稍后重试'
  export let loadFinishedText: string = '已经到底了'

  export let textColor: string = '#2f54eb'
  export let iconColor: string = '#2f54eb'
  export let isEmpty: boolean = false
  export let isFirstLoad: boolean = false

  // 下拉刷新设置
  let pullDownRefresh: any = false
  if (isRefresh) {
    BScroll.use(Pulldown)
    pullDownRefresh = {
      threshold: refreshOffset,
      stop: 40,
    }
  }

  let pulldownStatus: string = refreshStatus
  $: pulldownDisabled = pullupStatus === 'loading' || !isRefresh
  let pulldownTip
  $: {
    const tips: { [prop: string]: string } = {
      none: refreshText,
      wait: refreshWaitText,
      refreshing: refreshingText,
      success: refreshSuccessText,
      error: refreshErrorText,
    }

    pulldownTip = tips[pulldownStatus]
  }

  $: {
    pulldownStatus = refreshStatus
    // 成功加载数据之后需要重新计算BetterScroll以确保滚动效果正常
    refreshStatus === 'success' && bs.refresh()
    // 刷新状态触发刷新事件
    refreshStatus === 'refreshing' && bs.autoPullDownRefresh()
    // 如果刷新时已经加载全部的数据，则需要在触发刷新时将加载状态重置
    if (loadStatus === 'finished') {
      pullupStatus = 'none'
      bs.finishPullUp()
    }
    // 若设置首次加载数据，则需要在成功之后将firstLoaded设置为true
    ;['success', 'error', 'finished'].includes(refreshStatus) &&
      isFirstLoad &&
      !firstLoaded &&
      (firstLoaded = true)

    if (['success', 'error'].includes(refreshStatus)) {
      // 每次触发刷新事件后需要手动调用finishPullDown来告诉BetterScroll准备下次刷新事件
      setTimeout(() => bs.finishPullDown(), 800)
      setTimeout(() => (pulldownStatus = 'none'), 1000)
    }
  }
  const onRefreshing = () => {
    if (pulldownDisabled) {
      bs.finishPullUp()
    } else if (pulldownStatus !== 'refreshing') {
      pulldownStatus = 'refreshing'
      dispatch('refresh')
    }
  }

  // 上拉加载更多设置
  let pullUpLoad: any = false
  if (isLoad) {
    BScroll.use(Pullup)
    pullUpLoad = {
      threshold: loadOffset,
    }
  }
  let pullupStatus = loadStatus
  $: pullupDisabled = pulldownStatus === 'refreshing' || !isLoad || isEmpty
  let pullupTip
  $: {
    const tips: { [prop: string]: string } = {
      none: loadText,
      loading: loadingText,
      success: loadSuccessText,
      error: loadErrorText,
      finished: loadFinishedText,
    }

    pullupTip = tips[pullupStatus]
  }
  $: {
    pullupStatus = loadStatus
    // 成功加载数据之后需要重新计算BetterScroll以确保滚动效果正常
    ;['success', 'finished'].includes(loadStatus) && bs.refresh()

    if (['success', 'error'].includes(loadStatus)) {
      // 每次触发加载事件后需要手动调用finishPullUp来告诉BetterScroll准备下次加载事件
      bs.finishPullUp()
      setTimeout(() => (pullupStatus = 'none'), 100)
    }
  }
  const onLoading = () => {
    if (pullupDisabled || pullupStatus === 'finished') {
      bs.finishPullDown()
    } else {
      pullupStatus = 'loading'
      dispatch('load')
    }
  }

  let bs: any
  let pulldown: any
  const dispatch = createEventDispatcher()
  let firstLoaded = false
  $: tipsColor = `color: ${textColor}`
  $: emptyVisible = !isFirstLoad || (isFirstLoad && firstLoaded && isEmpty)
  const onScroll = (pos: any) => {
    const { y } = pos
    y > refreshOffset
      ? pulldownStatus === 'none' && (pulldownStatus = 'wait')
      : pulldownStatus === 'wait' && (pulldownStatus = 'none')

    dispatch('scroll', pos)
  }

  onMount(() => {
    bs = new BScroll(pulldown, {
      scrollY: true,
      useTransition: false,
      pullDownRefresh,
      pullUpLoad,
    })

    bs.on('scroll', onScroll)
    isRefresh && bs.on('pullingDown', onRefreshing)
    isLoad && bs.on('pullingUp', onLoading)
    dispatch('ready', bs)

    // 进行首次加载数据，自动触发刷新
    isFirstLoad && bs.autoPullDownRefresh()
  })
</script>

<div class={`pulldown-list ${className}`} bind:this={pulldown}>
  <div class="pulldown-list__container">
    {#if !pulldownDisabled}
      <div class="refresh">
        <div class="refresh__tips" style={tipsColor}>
          {#if pulldownStatus === 'refreshing'}
            <LoadIcon class="refresh__icon" color={iconColor} />
          {/if}
          {#if pulldownTip}
            <div class="refresh__text">{pulldownTip}</div>
          {/if}
        </div>
      </div>
    {/if}
    <div class="pulldonw-list__content">
      {#if emptyVisible}
        <div class="empty">
          {#if $$slots.empty}
            <slot name="empty" />
          {:else}
            <EmptyIcon />
          {/if}
        </div>
      {:else}
        <slot />
      {/if}
    </div>
    {#if !pullupDisabled}
      <div class="load">
        <div class="load__tips" style={tipsColor}>
          {#if pullupStatus === 'loading'}
            <LoadIcon class="load__icon" color={iconColor} />
          {/if}
          {#if pullupTip}
            <div class="load__text">{pullupTip}</div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
  <slot />
</div>

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

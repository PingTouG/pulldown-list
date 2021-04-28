<script context="module">
</script>

<script lang="ts">
  import PulldownList from './lib/PulldownList.svelte'

  let refreshStatus: string = 'none'
  let loadStatus: string = 'none'
  let list: Array<number> = []
  let page: number = 1

  const getList = async () => {
    const data: any = await new Promise(resolve =>
      setTimeout(() => {
        const data = Array.from({ length: 20 }, () => Math.random())
        resolve(data)
      }, 6000)
    )
    list = page === 1 ? data : [...list, ...data]
  }

  const onRefresh = async () => {
    page = 1
    refreshStatus = 'refreshing'
    await getList()
    refreshStatus = 'success'
  }

  const onLoad = async () => {
    page++
    loadStatus = 'loading'
    await getList()
    loadStatus = list.length === 60 ? 'finished' : 'success'
  }
</script>

<PulldownList
  class="list"
  isEmpty={list.length === 0}
  isFirstLoad
  {loadStatus}
  {refreshStatus}
  on:refresh={onRefresh}
  on:load={onLoad}
>
  <div class="list__container">
    {#each list as item (item)}
      <div class="item">{item}</div>
    {/each}
  </div>
</PulldownList>

<style lang="less" global>
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

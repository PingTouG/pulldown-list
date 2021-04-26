import React, { useMemo, useState } from 'react'
import PulldownList from './components/PulldownList'
import './App.css'

function App() {
  const [list,setList] = useState([])
  let page = 1
  const [loadStatus,setLoadStatus] = useState('none')
  const [refreshStatus,setRefreshStatus] = useState('none')
  useMemo(()=> setLoadStatus(val => val === 'none' ? val : list.length === 60 ? "finished" : "success"),[list])

  const getList = async () => {
    const data: any = await new Promise((resolve) => setTimeout(() => {
      const data = Array.from({length:20},() => Math.random())
      resolve(data)
    }, 2000));
    setList(val => page === 1 ? data : [...val,...data])
  }
  const onRefresh = async () => {
    page = 1
    setRefreshStatus('refreshing')
    await getList()
    setRefreshStatus('success')
  }

  const onLoad = () => {
    page++
    setLoadStatus('loading')
    getList()
  }

  return (
    <PulldownList
      className="list"
      isEmpty={list.length === 0}
      loadStatus={loadStatus}
      refreshStatus={refreshStatus}
      isFirstLoad
      refresh={onRefresh}
      load={onLoad}
    >
      <div className="list__container">
        {list.map(item => <div className="item" key={item}>{ item }</div>)}
      </div>
    </PulldownList>
  )
}

export default App

import React, { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import './index.css';
import BScroll from "@better-scroll/core";
import Pulldown from "@better-scroll/pull-down";
import type { PullDownRefreshOptions } from "@better-scroll/pull-down";
import Pullup from "@better-scroll/pull-up";
import type { PullUpLoadOptions } from "@better-scroll/pull-up";

import LoadIcon from '../LoadIcon'
import empty from '../empty.png'

const EmptyIcon = <img className="empty__icon" src={empty} />
let bs:any = null


const PulldownList = (props:PulldownListProps) => {
    const pulldown:any = useRef(null)

    // 下拉刷新设置
    let pullDownRefresh: PullDownRefreshOptions
    if(props.isRefresh){
        BScroll.use(Pulldown)
        pullDownRefresh = {
            threshold:props.refreshOffset,
            stop: 40
        }
    }
    const [pulldownStatus,setPulldownStatus] = useState(props.refreshStatus)
    const [pulldownDisabled,setPulldownDisabled] = useState(false)
    const [pulldownTip,setPulldownTip] = useState('')
    const [firstLoaded,setFirstLoaded] = useState(false)
    
    useMemo(()=>{
        setPulldownDisabled(pulldownStatus === 'loading' || !props.isRefresh)
        const tips: { [prop:string]:string } = {
            none: props.refreshText,
            wait: props.refreshWaitText,
            refreshing: props.refreshingText,
            success: props.refreshSuccessText,
            error: props.refreshErrorText,
        };
        setPulldownTip(tips[pulldownStatus])
    },[pulldownStatus,props.isRefresh])
    // 刷新事件
    const onRefreshing = () => {
        if (pulldownDisabled) {
          bs.finishPullUp()
        } else {
            setPulldownStatus("refreshing")
            props.refresh && props.refresh("refresh")
        }
    }

    // 上拉加载更多
    let pullUpLoad:PullUpLoadOptions
    if (props.isLoad) {
        BScroll.use(Pullup)
        pullUpLoad = {
            threshold: props.loadOffset,
        }
    }
    const [pullupStatus, setPullupStatus] = useState(props.loadStatus)
    const [pullupDisabled,setPullupDisabled] = useState(false)
    const [pullupTip,setPullupTip] = useState('')

    useEffect(() => {
        const tips: { [prop:string]:string } = {
            none: props.loadText,
            loading: props.loadingText,
            success: props.loadSuccessText,
            error: props.loadErrorText,
            finished: props.loadFinishedText,
        };
        setPullupTip(tips[pullupStatus])
        setPullupDisabled(props.refreshStatus === "refreshing" || pullupStatus === "refreshing" || !props.isLoad || props.isEmpty)
    },[props.refreshStatus,pullupStatus,props.isLoad,props.isEmpty])
    // 首次加载
    useEffect(()=>{
        bs = new BScroll(pulldown.current, {
            scrollY: true,
            useTransition: false,
            pullDownRefresh,
            pullUpLoad
        })

        bs.on("scroll", onScroll)
        props.isRefresh && bs.on("pullingDown", onRefreshing)
        props.isLoad && bs.on("pullingUp", onLoading)
        props.ready && props.ready(bs)

        // 进行首次加载数据，自动触发刷新
        props.isFirstLoad && bs.autoPullDownRefresh()
    },[])
    // 监听刷新状态变化
    useEffect(()=> {
        setPulldownStatus(props.refreshStatus)
        // 成功加载数据之后需要重新计算BetterScroll以确保滚动效果正常
        props.refreshStatus === 'success' && bs.refresh()
        // 如果刷新时已经加载全部的数据，则需要在触发刷新时将加载状态重置
        if(props.loadStatus === 'finished'){
            setPullupStatus('none')
            bs.finishPullUp()
        }
        // 若设置首次加载数据，则需要在成功之后将firstLoaded设置为true
        ["success", "error", "finished"].includes(props.refreshStatus) &&
        props.isFirstLoad &&
        !firstLoaded &&
        setFirstLoaded(true)

        if (["success", "error"].includes(props.refreshStatus)) {
            // 每次触发刷新事件后需要手动调用finishPullDown来告诉BetterScroll准备下次刷新事件
            setTimeout(() => bs.finishPullDown(), 800)
            setTimeout(() => setPulldownStatus('none'), 1000)
        }
    },[props.refreshStatus])
    // 监听加载状态变化
    useEffect(()=> {
        setPullupStatus(props.loadStatus)
        // 成功加载数据之后需要重新计算BetterScroll以确保滚动效果正常
        if(["success", "finished"].includes(props.loadStatus)){
            bs.refresh()
        }
        if (["success", "error"].includes(props.loadStatus)) {
          // 每次触发加载事件后需要手动调用finishPullUp来告诉BetterScroll准备下次加载事件
          bs.finishPullUp();
          setTimeout(() => setPullupStatus("none"), 100);
        }
    },[props.loadStatus])
    // 加载事件
    const onLoading = () =>{
        if (pullupDisabled) {
            bs.finishPullDown()
        } else {
          setPullupStatus('loading')
          props.load && props.load()
        }
    }
    // 滚动事件
    const onScroll = (pos:any) => {
        const { y } = pos;
        setPulldownStatus(val => 
            y > props.refreshOffset ? 
            val === 'none' ? 'wait' : 
            val :val === 'wait' ? 'none' : val)
        props.scroll && props.scroll(pos)
    }

    const [emptyVisible,setEmptyVisible] = useState(false)
    useMemo(()=> setEmptyVisible((!props.isFirstLoad || (props.isFirstLoad && firstLoaded)) && props.isEmpty) ,[props.isFirstLoad,firstLoaded,props.isEmpty])
    const [tipsColor,setTipsColor] = useState({ color: props.textColor })
    useMemo(()=> setTipsColor({ color: props.textColor }),[props.textColor])

    // 刷新元素
    const PulldownRefresh = () => {
        const RefreshIcon = pulldownStatus === 'refreshing' ? <LoadIcon className="refresh__icon" color={props.iconColor} /> : null
        const RefreshText = pulldownTip ? <div className="refresh__text">{ pulldownTip }</div> : null

        if(pulldownDisabled){
            return null
        } else{
            return (
                <div className="refresh">
                    <div className="refresh__tips" style={tipsColor}>
                        {RefreshIcon}
                        {RefreshText}
                    </div>
                </div>
            )
        }
        
    }
    // 主体元素
    const PulldownContent = () => (
        <div className="pulldown-list__content">
            {emptyVisible ? <div className="empty">{EmptyIcon}</div> : props.children}
        </div>
    )
    // 加载元素
    const PulldownLoad = () => {
        const LoadingIcon = pullupStatus === 'loading' ? <LoadIcon className="load__icon" color={props.iconColor}  /> : null
        const LoadText = pullupTip ? <div className="load__text" >{pullupTip}</div> : null

        if(pullupDisabled){
            return null
        } else{
            return (
                <div className="load">
                    <div className="load__tips" style={tipsColor}>
                        {LoadingIcon}
                        {LoadText}
                    </div>
                </div>
            )
        }
    }

    return (
        <div className={`pulldown-list ${props.className}`} ref={pulldown}>
            <div className="pulldonw-list__container">
                <PulldownRefresh />
                <PulldownContent />
                <PulldownLoad />
            </div>
        </div>
    )
}

export interface PulldownListProps {
    className:string,
    isRefresh:boolean,
    refreshOffset:number,
    refreshStatus:string,
    refreshText:string,
    refreshWaitText:string,
    refreshingText:string,
    refreshSuccessText:string,
    refreshErrorText:string,

    isLoad:boolean,
    loadOffset:number,
    loadStatus:string,
    loadText:string,
    loadingText:string,
    loadSuccessText:string,
    loadErrorText:string,
    loadFinishedText:string,

    textColor:string,
    iconColor:string,
    isEmpty:boolean,
    empty:any,
    isFirstLoad:boolean
    children: any,
    ready?:Function,
    refresh?:Function
    load?:Function,
    scroll?:Function
}
PulldownList.propTypes = {
    isRefresh:PropTypes.bool,
    refreshOffset:PropTypes.number,
    refreshStatus:PropTypes.oneOf(["none", "refreshing", "success", "error"]),
    refreshText:PropTypes.string,
    refreshWaitText:PropTypes.string,
    refreshingText:PropTypes.string,
    refreshSuccessText:PropTypes.string,
    refreshErrorText:PropTypes.string,

    isLoad:PropTypes.bool,
    loadOffset:PropTypes.number,
    loadStatus:PropTypes.oneOf(["none", "loading", "success", "error", "finished"]),
    loadText:PropTypes.string,
    loadingText:PropTypes.string,
    loadSuccessText:PropTypes.string,
    loadErrorText:PropTypes.string,
    loadFinishedText:PropTypes.string,

    textColor:PropTypes.string,
    iconColor:PropTypes.string,
    isEmpty:PropTypes.bool,
    isFirstLoad:PropTypes.bool
}
PulldownList.defaultProps = {
    isRefresh:true,
    refreshOffset:60,
    refreshStatus:'none',
    refreshText:'下拉刷新',
    refreshWaitText:'释放刷新',
    refreshingText:'',
    refreshSuccessText:'刷新成功',
    refreshErrorText:'刷新失败,请稍后重试',

    isLoad:true,
    loadOffset:60,
    loadStatus:'none',
    loadText:'上拉加载更多',
    loadingText:'',
    loadSuccessText:'加载成功',
    loadErrorText:'加载失败,请稍后重试',
    loadFinishedText:'已经到底了',

    textColor:'#2f54eb',
    iconColor:'#2f54eb',
    isEmpty:false,
    empty:EmptyIcon,
    isFirstLoad:false
}

export default PulldownList
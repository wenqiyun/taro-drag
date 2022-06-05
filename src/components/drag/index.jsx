import { Image, View } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { vibrateShort, pageScrollTo, getSystemInfoSync, useReady } from '@tarojs/taro'

import { compareVersion } from './utils'

import './index.scss'

function Drag ({
  list = [], // 数据
  columns = 1, // 列数
  scrollTop = 0, // 滚动距离
  onScroll, // onScroll 事件
  onSortEnd, // drag 结束事件
  onChange, // 改变事件
  onItemClick, // 点击单个事件
  itemWidth // 单个 宽度
}) {

  const [pageMetaSupport, setPageMetaSupport] = useState(false) // 当前版本是否支持 page-meta 标签
  const [windowHeight, setWindowHeight] = useState(0) // 视窗高度
  const [platform, setPlatform] = useState('') // 平台信息
  const [realTopSize, setRealTopSize] = useState(0) // 计算后 顶部固定高度实际值
  const [realBottomSize, setRealBottomSize] = useState(0) // 计算后 底部固定高度实际值
  const [rows, setRows] = useState(0) // 行数
  const [itemDom, setItemDom] = useState({ width: 0, height: 0, left: 0, top: 0 }) // 每一项 item 的 dom 信息，由于大小一样，所以只存储一个
  const [itemWrapDom, setItemWrapDom] = useState({ width: 0, height: 0, left: 0, top: 0 }) // 整个拖拽区域的 dom 信息
  const [startId, setStartId] = useState(0) // 初始触摸点 identifier
  const [preStartKey, setPreStartKey] = useState(-1) // 前一次排序时候的起始 sortKey 值

  const [listData, setListData] = useState([]) // 渲染数据
  const [cur, setCur] = useState(-1) // 当前激活元素
  const [curZ, setCurZ] = useState(-1) // 当前激活的元素， 用于控制 元素 Z 轴显示
  const [tranX, setTranX] = useState(0) // 当前激活的 元素， X轴 偏移量
  const [tranY, setTranY] = useState(0) // 当前激活的 元素， Y轴 偏移量
  const [itemWrapHeight, setItemWrapHeight] = useState(0) // 动态计算 父级元素的高度
  const [draging, setDraging] = useState(false) // drag 标识，防止一次多次触发
  const [itemTransiton, setTransition] = useState(false) // item 变化是否需要过度动画，首页渲染不需要
  const [isReady, setIsReady] = useState(false)
  useReady(() => {
    setIsReady(true)
  })

  useEffect(() => {
    if (isReady) {
      init()
    }
  }, [isReady, list])

  const clearData = () => {
    setPreStartKey(-1)
    setDraging(false)
    setCur(-1)
    setTranX(0)
    setTranY(0)
    setStartId(0)
    // 延时清空
    setTimeout(() => {
      setCurZ(-1)
    }, 300)
  }

  /** 判断是否是固定的 item */
  const isFixed = (index) => {
    if (list[index]?.fixed) return true
    return false
  }
  /** 判断是否超出范围 */
  const IsOutRange = (x1, y1, x2, y2, x3, y3) => {
    return x1 < 0 || x1 >= y1 || x2 < 0 || x2 >= y2 || x3 < 0 || x3 >= y3
  }

  /** 长按触发移动排序 */
  const longPress = (e) => {
    console.log('长按', e)
    // 获取触摸点信息
    const startTouch = e.changedTouches[0]
    if (!startTouch) return

    // 固定项 则返回
    const index = e.currentTarget.dataset.index
    if (isFixed(index)) return

    // 防止多指触发 drag 动作， 如果已存在 drag 中 则返回， touchstart 事件中有效果
    if (draging) return
    setDraging(true)

    const { pageX: startPageX, pageY: startPageY, identifier } = startTouch
    // 计算 X Y 轴初始位移，使 item 中心移动到 点击处
    const [newTranX,  newTranY]  = [
      startPageX - itemDom.width / 2 - itemWrapDom.left,
      startPageY - itemDom.height / 2 - itemWrapDom.top
    ]
    setCur(index)
    setCurZ(100)
    // 单列 的时候 X 轴不做位移
    setTranX(columns === 1 ? 0 : newTranX)
    setTranY(newTranY)
    setStartId(identifier)
    // 振动
    if (platform !== 'devtools') vibrateShort()
  }

  const touchMove = (e) => {
    // console.log('移动', e)
    // 获取触摸点信息
    const currentTouch = e.changedTouches[0]
    if (!currentTouch) return
    if (!draging) return

    const { pageX: currentPageX, pageY: currentPageY, identifier: currentId, clientY: currentClientY } = currentTouch
    // 只能在容器内部 拖拽
    if ((currentPageX - itemDom.width / 2) < itemWrapDom.left ||
        (currentPageX + itemDom.width / 2)  > (itemWrapDom.left + itemWrapDom.width) ||
        (currentPageY - itemDom.height / 2) < itemWrapDom.top ||
        (currentPageY + itemDom.height / 2) > (itemWrapDom.top + itemWrapHeight)
      ) return
    // 如果不是同一个触发点 则返回
    if (startId !== currentId) return

    // 通过 当前坐标点，初始坐标点，初始偏移量，来计算当前偏移量
    const [newTranX, newTranY] = [
      currentPageX - itemDom.width / 2 - itemWrapDom.left,
      columns === 1 ? 0 : currentPageY - itemDom.height / 2 - itemWrapDom.top
    ]

    // 到顶, 到底  自动滑动
    let newScrollTop = 0
    if (currentClientY > windowHeight - itemDom.height - realBottomSize) {
      // 当前 触摸点 pageY + item 高度 - (屏幕高度 - 底部固定区域高度)
      newScrollTop = currentPageY + itemDom.height - (windowHeight - realBottomSize)
      if (pageMetaSupport) {
        onScroll && onScroll({ scrollTop: newScrollTop })
      }

    } else if (currentPageY < itemDom.height + realBottomSize) {
      // 当前 触摸点 pageY - item 高度 - 顶部固定区域高度
      newScrollTop = currentPageY - itemDom.height - realTopSize
    }
    if (pageMetaSupport) {
      onScroll && onScroll({ scrollTop: newScrollTop })
    }
    pageScrollTo({ scrollTop: newScrollTop, duration: 300 })

    // 设置当前激活元素 偏移量
    setTranX(newTranX)
    setTranY(newTranY)

    // 获取 startkey 和 endKey
    const startKey = parseInt(e.currentTarget.dataset.key)
    const [curX, curY] = [
      Math.round(newTranX / itemDom.width),
      Math.round(newTranY / itemDom.height)
    ]
    const endKey = curX + columns * curY
    // 遇到固定项 或 超出范围 则 返回
    if (isFixed(endKey) || IsOutRange(curX, columns, curY, rows, endKey, listData.length)) return
    // 防止拖拽过程中发生乱序问题
    if (startKey === endKey || startKey === preStartKey) return
    setPreStartKey(startKey)

    // 触发排序
    sort(startKey, endKey)
  }

  const touchEnd = () => {
    console.log('touchend')
    if (!draging) return
    // 自定义事件
    const _listData = [...listData]
    _listData.sort((a, b) => a.sortKey - b.sortKey)
    onSortEnd && onSortEnd(_listData.map(v => v.data))
    clearData()
  }

  /** 排除固定项，得到最终 sortKey */
  const excludeFix = (sortKey, startKey, type) => {
    if (sortKey === startKey) return startKey
    if (listData[sortKey].fixed) {
      const _sortKey = type === 'redure' ? sortKey - 1 : sortKey + 1
      return excludeFix(_sortKey, startKey, type)
    } else {
      return sortKey
    }
  }

  /** 根据排序后的 list 数据进行位移计算 */
  const updateList =  (data, vibrate = true) => {
    const newListData = data.map((item) => {
      item.tranX = `${item.sortKey % columns * 100}%`
      item.tranY = `${Math.floor(item.sortKey / columns) * 100}%`
      return item
    })
    setListData(newListData)
    if (!vibrate) return

    if (platform !== 'devtools') vibrateShort()
    // onChange && onChange(newListData.map(v => v.data))
  }

  /** 根据 startKey endKey 重新计算每一项 sortKey */
  const sort = (startKey, endKey) => {
    setTransition(true)
    const newListData = listData.map(item => {
      if (item.fixed) return item
      if (startKey < endKey) { // 正向移动
        if (item.sortKey > startKey && item.sortKey <= endKey) {
          item.sortKey = excludeFix(item.sortKey - 1, startKey, 'reduce')
        } else if (item.sortKey === startKey) {
          item.sortKey = endKey
        }
      } else if (startKey > endKey) { // 倒序移动
        if (item.sortKey >= endKey && item.sortKey < startKey) {
          item.sortKey = excludeFix(item.sortKey + 1, startKey, 'add')
        } else if (item.sortKey === startKey) {
          item.sortKey = endKey
        }
      }
      return item
    })
    updateList(newListData)
  }

  /** 点击每一项后 触发事件 */
  const itemClick = (item, index) => {
    console.log('点击事件', item)
    if (!item.extraNode) {
      const _list = []
      listData.forEach(v => {
        _list[v.sortKey] = v
      })

      let currentKey = -1
      for (let i = 0, len = _list.length; i < len; i++) {
        const v = _list[i]
        if (!v.extraNode) currentKey++
        if (v.sortKey === item.sortKey) break
      }
      onItemClick && onItemClick({ key: currentKey, data: item.data })
    }
  }

  /** 初始化 获取 dom 信息 */
  const initDom = (_listData) => {
    const { windowWidth: sysWindowWidth, windowHeight: sysWindowHeight, platform: sysPlatform, SDKVersion } = getSystemInfoSync()

    setPageMetaSupport(compareVersion(SDKVersion, '2.9.0') >= 0)
    const remScale = (sysWindowWidth || 376) / 375
    const [newRealTopSize, newRealBottomSize] = [
      realTopSize * remScale / 2,
      realBottomSize * remScale / 2
    ]
    setWindowHeight(sysWindowHeight)
    setPlatform(sysPlatform)
    setRealTopSize(newRealTopSize)
    setRealBottomSize(newRealBottomSize)
    // eslint-disable-next-line no-undef
    wx.createSelectorQuery().select('.drag-item').boundingClientRect((res) => {
      const newRows = Math.ceil(_listData.length / columns)
      setRows(newRows)
      setItemDom(res)
      setItemWrapHeight(newRows * res.height)
      // eslint-disable-next-line no-undef
      wx.createSelectorQuery().select('.drag-wrapper').boundingClientRect(rese => {
        const domObj = rese
        domObj.top += scrollTop
        setItemWrapDom(domObj)
      }).exec()
    }).exec()
  }

  const init = () => {
    clearData()
    setTransition(false)
    // 避免取不到节点报错
    if (list.length === 0 || draging) {
      return
    }
    //
    const setItem = (item, i) => ({
      id: item.dragId,
      slot: item.slot,
      fixed: item.fixed,
      extraNode: item.extraNode,
      tranX: '0%',
      tranY: '0%',
      sortKey: i,
      data: item
    })

    const _listData = []
    list.forEach((v, i) => {
      _listData.push(setItem(v, i))
    })
    // setListData(_listData)

    updateList(_listData, false)
    setTimeout(() => initDom(_listData), 500)
  }


  const delEvent = (index) => {
    if (draging) return
    const _listData = [...listData]
    _listData.splice(index, 1)
    setListData(_listData)
    onChange && onChange(_listData.map(v => v.data))
  }

  return (
    <View
      className='drag-wrapper'
      style={`height: ${itemWrapHeight}px`}
    >
      {
        listData.map((v, index) => (
          <View
            className={`drag-item ${itemTransiton && cur !== index ? 'itemTransition' : ''}`}
            key={v.dragId}
            data-key={v.sortKey}
            data-index={index}
            style={`transform: translate3d(${index === cur ? (tranX + 'px') : v.tranX }, ${index === cur ? (tranY + 'px') : v.tranY}, 0);width: ${itemWidth || 'calc((100% - ' + 8 * columns + 'px) / ' + columns + ')'}; z-index: ${index === cur ? curZ : ''}`}
            onClick={() => itemClick(v, index)}
            onLongPress={longPress}
            catchMove
            onTouchMove={draging && touchMove}
            onTouchEnd={draging && touchEnd}
          >

            <View className={`drag-item__info ${cur === index ? 'drag-active' : ''}`}>
              <View className='drag-item__info-item'>
                {
                  !v.extraNode ? <>
					{/* 这里逻辑可以自己写 */}
                    <Image src={v.data.url}></Image>
                    {
                      !draging && <View className='drag-item__info-close' onClick={() => delEvent(index)}>X</View>
                    }
                  </> : v.slot
                }
              </View>
            </View>
          </View>
        ))
      }
    </View>
  )
}

export default Drag

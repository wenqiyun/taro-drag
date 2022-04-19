使用 taro 编写的 仿朋友圈9宫格拖拽排序， 只在微信小程序内生效

#### 如何使用

```
git clone https://github.com/wenqiyun/taro-drag.git
```

将 ```src/components``` 下的 drag 文件拷贝至自己的项目中，即可在页面中引入

###### Drag Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| list | 数据源 | Array | -- | [] |
| columns | 列数 | Number | -- | 1 |
| itemWidth | 每个 item 宽度(用于计算 item 宽度) | Number | -- | 0(rpx) |
| scrollTop | 页面滚动高度(用于页面滚动时候正确计算) | Number | -- | 0(rpx) |

###### Drag Events

| 事件名称 | 说明 | 回调参数 |
| --- | --- | --- |
| onChange | 数据改变事件| 改变后的数据  |
| onSortEnd | 排序结束事件 | 排序后数据 |
| onItemClick | 点击item监听 | item数据和排序key值 |

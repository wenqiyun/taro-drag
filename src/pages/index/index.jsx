import { View, Text } from '@tarojs/components'

import { useState } from 'react'
import Drag from '../../components/drag'

import './index.scss'

export default function Index () {
	const [pageMetaScrollTop, setPageMetaScrollTop] = useState(0)

	const [fileList, setFileList] = useState([
		{ dragId: 1, id: 1, url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F1113%2F052420110515%2F200524110515-2-1200.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652595426&t=7558cd6e0e46df1b4a25a8ac3bb23ee2' },
		{ dragId: 2, id: 2, url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.2008php.com%2F09_Website_appreciate%2F10-07-11%2F1278861720_g.jpg&refer=http%3A%2F%2Fwww.2008php.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652595426&t=8a143bb307d89fde4bec120fd2bbe3c2' },
		{ dragId: 3, id: 3, url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fi-1.lanrentuku.com%2F2020%2F7%2F10%2Fb87c8e05-344a-48d1-869f-ef6929fc8b17.jpg&refer=http%3A%2F%2Fi-1.lanrentuku.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652595426&t=a9d2ad78377ace857056b406eec1444f' },
		{ dragId: 4, id: 4, url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F1113%2F021620115230%2F200216115230-9-1200.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652595426&t=826f4b01a1a1a2b6eb44e2225e6e8924' },
		{ dragId: 5, id: 5, url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fdingyue.ws.126.net%2F2020%2F0515%2F465567a6j00qadpfz001cc000hs00b4c.jpg&refer=http%3A%2F%2Fdingyue.ws.126.net&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652595426&t=391e28a0c87cb1b524f79bd572efdcf8' },
		{ dragId: 6, id: 6, url: 'https://img0.baidu.com/it/u=925998594,1358415170&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281' },
		{ dragId: 7, id: 7, url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimage.jiedianqian.com%2Fadmin%2F1547027280436.jpg&refer=http%3A%2F%2Fimage.jiedianqian.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652595426&t=a7d2acf314f72fc12eb13e13b7333c6a' },
		{ dragId: 8, id: 8, url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.redocn.com%2Fphoto%2F20131204%2FRedocn_2013112809170845.jpg&refer=http%3A%2F%2Fimg.redocn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652595426&t=36ed401679716f566c0e05964f08df97' },
		{ dragId: 9, id: 9, url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Ffile02.16sucai.com%2Fd%2Ffile%2F2014%2F0814%2F17c8e8c3c106b879aa9f4e9189601c3b.jpg&refer=http%3A%2F%2Ffile02.16sucai.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652595426&t=86cbb2e6a3a89ff94f763ea01bc71749' },
		{ dragId: 10, id: 10, url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2Ftp01%2F1ZZQ214233446-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652595426&t=ca5c5f7defff5871410a767a46e81fe7' },
		{ dragId: 11, id: 11, url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2Ftp05%2F19100120461512E-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652595426&t=6bb227b716e2087cde4ab4a15eefeb99' },
		{ dragId: 12, id: 12, url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2Ftp05%2F1Z9291TIBZ6-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652595426&t=18f2a9a38867e7d63d1316848dbc58f3' },
		{ dragId: 13, id: 13, url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.daimg.com%2Fuploads%2Fallimg%2F180314%2F1-1P314150U4.jpg&refer=http%3A%2F%2Fimg.daimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652595426&t=f4fbe845bd22a2e0adf6d2151ce6c1ff' },
		{ dragId: 14, id: 14, url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Ffile03.16sucai.com%2F2016%2F10%2F1100%2F16sucai_p20161021027_08b.JPG&refer=http%3A%2F%2Ffile03.16sucai.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652595426&t=f27f3ade425ef26658618ba35555a161' },
	])
	
	return (
	  <View className='index'>
		<Drag
          list={fileList}
          columns={3}
          scrollTop={pageMetaScrollTop}
          onChange={(list) => setFileList([...list])}
          onSortEnd={(list) => setFileList([...list])}
          onScroll={({ scrollTop }) => {setPageMetaScrollTop(scrollTop)}}
          itemWidth='109px'
        ></Drag>
	  </View>
	)
}

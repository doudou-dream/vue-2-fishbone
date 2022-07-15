# 鱼骨图

> 本项目源于jq版本鱼骨图：https://github.com/limiaogithub/yt_fish_bone
> 1. 移除对jq的依赖
> 2. jtopo替换为npm版本
> 3. 加入通过鼠标滚轮放大缩小鱼骨图
> 4. 支持重新渲染
> 依赖 yarn add jtopo-in-node-yz -D

## 实例

```vue
<template>
  <div id="fishBone"/>
</template>
<script setup>
import {FishBones} from 'xxx/fishbone1.0/FishBone'
import {onMounted} from 'vue'

onMounted(() => {
  new FishBones({
    //模板id
    id: 'fishBone',
    /*json数据！重要，必填*/
    jsonData: testFishData,
    canvasSize: [document.body.scrollWidth, document.body.scrollHeight],
    //右键事件
    rClickNodeFunction: (node, event) => {
    },
    // 点击事件
    clickNodeFunction: (node, event) => {
    },
    // 当鼠标在元素上移动时事件
    mouseOverFunction: (node, event) => {
    }
  }).init()
})
</script>
```
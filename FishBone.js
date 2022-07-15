import JTopo from 'jtopo-in-node-yz'
import {FinModel} from '@/admin_view/page/problem/components/fishbone1.0/FinModel'
import {Map_} from '@/admin_view/page/problem/components/fishbone1.0/Map'
import {showJTopoToobar} from './toolbar'
import head from '@/admin_view/page/problem/components/fishbone1.0/theme/default/image/head.svg'
import body from '@/admin_view/page/problem/components/fishbone1.0/theme/default/image/body.svg'
import tail from '@/admin_view/page/problem/components/fishbone1.0/theme/default/image/tail.svg'

function extend(target, source) {
    for (let p in source) {
        if (source.hasOwnProperty(p)) {
            target[p] = source[p]
        }
    }
    return target
}

export class FishBones {
    constructor(options) {
        let defaults = {
            id: options.id,
            /*json数据！重要，必填*/
            jsonData: null,
            /*鱼骨主题，用来修改样式，默认是1,目前不支持 */
            theme: "default",
            /*是否可以拖动，默认是true */
            dragable: true,
            /*是否显示工具条 */
            showToolbar: true,
            /* 画布的大小 */
            canvasSize: [document.body.scrollWidth - 10 - 222, document.body.scrollHeight - 55 - 56],
            /*  鱼头左侧中心坐标  */
            //mainFishTopPosition: null,
            /* debug模式 */
            debug: false,
            sceneBackgroundImage: null,
            /**
             * 下面3个事件分别是点击、右键点击、鼠标悬浮，可回调如下函数
             * function (node) {
             * alert(node.text);
             * }
             */
            clickNodeFunction: null,
            rClickNodeFunction: null,
            mouseOverFunction: null
        }

        /* 基础点的集合,最后进行渲染　*/
        this.baseNodeArray = []
        /* 鱼翅集合,最后进行渲染 */
        this.FishBoneMap = new Map_()
        /* 骨干鱼翅上两个子鱼翅为一组，算最大值，需要了解一共有多少段，每段的最大长度 */
        this.FinTeamMap = new Map_()

        this.FinDeepTempMap = new Map_()
        /* 画布 */
        this.stage = ""
        this.scene = ""
        /*默认支持鱼骨数量*/
        this.defaultBonesDeep = 3
        /*主要鱼骨长度*/
        this.mainBoneLength = 0
        /*  鱼头上侧坐标    */
        this.mainFishTopPosition = []
        /*  鱼头中心中心坐标    */
        this.mainFishPosition = []
        /*  鱼尾巴中心中心坐标    */
        this.mainFishTailPosition = []
        /*  鱼尾巴图片坐标    */
        this.mainFishTailImagePosition = []
        /*  鱼头id */
        this.mainFishId = 1
        /*  鱼头长度    */
        this.mainHeadLength = 0
        /*  鱼头文字    */
        this.mainHeadText = ""

        /*根号3*/
        this.sign3 = Math.sqrt(3)
        /*默认主要鱼骨的步长*/
        this.defaultBoneStepLength = 150
        /*默认鱼头高度 a4*/
        this.defaultFishHeadHeight = 64
        /*图像百分比系数 100%*/
        this.basePercent = 1
        /*从鱼头X轴到第一个点的默认距离 a1*/
        this.defaultHeadToFirstNodeLength = 50
        /*鱼尾 a16*/
        this.defaultFishTail = 50
        /*默认一级鱼骨交叉距离 a2*/
        this.defaultCrossStep = 30
        /*默认二级鱼骨一个汉字的长度 h1*/
        this.defaultCharLengthForLevel1 = 16
        /*默认二级鱼骨一个汉字的长度 h1*/
        this.defaultCharLengthForLevel2 = 13
        /*默认二级鱼骨以下一个汉字的长度 */
        this.defaultCharLengthForLevel3AndLow = 12
        /*默认二级鱼骨以下一个汉字的长度 */
        this.defaultUpEnglishLength = 8
        /*默认一级字符长度*/
        this.defaultSignLengthForLevel1 = 10
        /*默认二级鱼骨一个字符的长度 h1*/
        this.defaultSignLength = 5
        /*4级骨头每个鱼翅的距离 a13*/
        this.defaultLevel4Step = 15

        /*合并  将defaults 与 options合并 */
        this.options = extend(defaults, options)


        /* 默认树的深度是-1 */
        this.fishBoneDeep_ = -1

        this.iCount = 1
        this.deep   = 1

        /* 鱼翅在上或在下,true是上，false是下  */
        this.upOrDown = false
        /* 用于计算２级鱼骨的第几个节点，当是奇数的时候增加小组*/
        this.nodeIndex = 0
        /* 鱼翅小组，每两个二级鱼翅为一个小组　*/
        this.teamIndex = 1
        this.datIndex  = 1
        defaults.id    = this.newDom()
        this.$this     = document.getElementById(defaults.id)
    }

    /**
     * 重新渲染数据
     */
    newDom(newDomId = 'subFishBone') {
        if (document.getElementById(newDomId)) {
            document.getElementById(newDomId).remove()
        }
        const currentDiv = document.querySelector('#fishBone')
        const newDiv     = document.createElement("div")
        newDiv.setAttribute('id', newDomId)
        currentDiv.appendChild(newDiv)
        return newDomId
    }

    /*获取字符串中文数量*/
    getChineseCount(str) {
        let count = 0
        for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 255) {
                count++
            }
        }
        return count
    }

    /*获取字符串中文数量*/
    getUpEnglishCount(str) {
        let count = 0
        for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) >= 65 && str.charCodeAt(i) <= 90) {
                count++
            }
        }
        return count
    }

    /* 比较每个节点的深度，重复覆盖默认值，取最大 */
    compare_(deep) {
        if (deep != null) {
            this.fishBoneDeep_ = deep > this.fishBoneDeep_ ? deep : this.fishBoneDeep_
        }
    }

    /* 获取鱼头的长度   */
    getHeadLength(name) {
        let chineseCount   = this.getChineseCount(name)
        let upEnglishCount = this.getUpEnglishCount(name)
        return chineseCount * this.defaultCharLengthForLevel1 + upEnglishCount * this.defaultUpEnglishLength +
            (name.length - chineseCount - upEnglishCount) * this.defaultSignLengthForLevel1 + 40
    }

    /* 递归整棵树,同时计算树的最大深度，计算鱼头的长度 */
    deepLoop_(dat) {
        if (this.iCount === 1) {
            this.mainFishId = dat.id
            this.FinDeepTempMap.put(dat.id, 1)
            this.mainHeadText   = dat.name
            this.mainHeadLength = this.getHeadLength(this.mainHeadText)
        } else {
            if (this.FinDeepTempMap.containsKey(dat.fid)) {
                this.deep = this.FinDeepTempMap.get(dat.fid) + 1
                this.FinDeepTempMap.put(dat.id, this.deep)
            }
        }
        this.iCount++
        this.compare_(this.deep)
        if (dat.children) {
            for (let i = 0; i < dat.children.length; i++) {
                this.deepLoop_(dat.children[i])
            }
        }
    }

    /* 递归整棵树 */
    getBoneDeep() {
        for (let i = 0; i < this.options.jsonData.length; i++) {
            this.deepLoop_(this.options.jsonData[i])
        }
        return this.fishBoneDeep_
    }

    /* 验证树的深度 */
    validateBoneDeep() {
        let flag = this.getBoneDeep() > this.defaultBonesDeep
        if (flag) {
            alert("对不起，目前仅支持" + this.defaultBonesDeep + "级鱼骨!")
        }
        return !flag
    }

    /* validate */
    validate() {
        if (!this.options.jsonData) {
            alert("json数据不能为空！")
            return false
        }
        return this.validateBoneDeep()

    }

    getFishBoneNode(position) {
        let jNode          = new JTopo.Node("")
        jNode.shadow       = false
        jNode.showSelected = false
        jNode.dragable     = false
        if (position && position.length > 1) {
            jNode.setLocation(position[0], position[1])
        }
        jNode.setSize(0, 0)
        if (this.options.debug) {
            jNode.setSize(5, 5)
        }
        return jNode
    }

    getFishBoneLinkByNode(node_, jNodeFrom, jNodeTo, text, color) {
        let link         = new JTopo.Link(jNodeFrom, jNodeTo, text)
        link.lineWidth   = 2
        link.zIndex      = 10
        link.dragable    = false
        link.shadow      = false
        node_.lineColor_ = node_.lineColor_ || '112,112,112'// 颜色线
        if (node_.lineColor_) {
            link.fillColor   = node_.lineColor_
            link.strokeColor = node_.lineColor_
        }
        return link
    }

    getFishTextNode(node) {
        let textNode
        /*链接节点或文字节点*/
        if (node.link_) {
            // textNode        = new JTopo.LinkNode(node.name_);
            textNode        = new JTopo.TextNode(node.name_)
            textNode.href   = node.link_
            textNode.target = '_blank'
        } else {
            textNode = new JTopo.TextNode(node.name_)
        }
        textNode.fontColor = '16,180,180'//'40,40,40'//
        /*2级节点文字特殊*/
        if (node.level_ === 2) {
            textNode.font       = 'bold 12px 微软雅黑'
            textNode.shadow     = false// 阴影
            textNode.shadowBlur = 9
            //textNode.selected=true;
        } else {
            textNode.font   = '12px 微软雅黑'
            textNode.shadow = false
        }
        if (node.nameColor_) {
            textNode.fontColor = node.nameColor_
        }
        /*文字点击事件*/
        if (this.options.clickNodeFunction) {
            textNode.click((event) => {
                this.options.clickNodeFunction(node, event)
            })
        }
        /*右键点击事件*/
        if (this.options.rClickNodeFunction) {
            textNode.addEventListener('mouseup', (event) => {
                if (event.button == 2) {
                    this.options.rClickNodeFunction(node, event)
                }
            })
        }
        /*鼠标划上事件*/
        if (this.options.mouseOverFunction) {
            textNode.addEventListener('mouseover', (event) => {
                this.options.mouseOverFunction(node, event)
            })
        }
        textNode.dragable = false
        textNode.rotate   = node.rotate_
        return textNode
    }

    /*初始化画布容器*/
    initHtmlCanvas() {
        this.mainFishTopPosition = [this.options.canvasSize[0] * 0.98 - this.mainHeadLength, this.options.canvasSize[1] * 0.5 - this.defaultFishHeadHeight / 2]
        this.mainFishPosition    = [this.mainFishTopPosition[0], this.mainFishTopPosition[1] + this.defaultFishHeadHeight / 2]
        this.$this.insertAdjacentHTML('afterbegin', "<canvas width='" + this.options.canvasSize[0] + "' height='" + this.options.canvasSize[1] + "' id='canvas__'></canvas>")
    }

    /*初始化JTopo画布*/
    initJtoPoScene() {
        this.stage = new JTopo.Stage(document.getElementById('canvas__'))
        this.scene = new JTopo.Scene(this.stage)
        if (this.options.sceneBackgroundImage) {
            this.scene.background = this.options.sceneBackgroundImage
        }
        if (this.options.showToolbar) {
            showJTopoToobar(this.stage, this.$this)
        }
        if (!this.options.dragable) {
            this.scene.mode       = 'select'
            this.scene.areaSelect = false
        }
    }

    initFinModels(dat) {
        let fin = new FinModel(dat.id, dat.fid, dat.name, this.upOrDown, dat.fontColor, dat.lineColor, dat.link)
        if (this.datIndex === 1) {
            fin.setLevel_(1)
        } else {
            if (this.FishBoneMap.containsKey(fin.getFid_())) {
                fin.setLevel_(this.FishBoneMap.get(fin.getFid_()).getLevel_() + 1)
            }
        }
        this.FishBoneMap.put(fin.getId_(), fin)
        this.datIndex++
        //修改算法
        //fin.setLevel_(getDeepByFinModel(fin));

        //2级叶子节点需要考虑分组切换
        if (fin.getLevel_() == 2) {
            this.nodeIndex++
            if (this.nodeIndex % 2 == 1) {
                if (this.nodeIndex != 1) {
                    this.teamIndex++
                }
                this.FinTeamMap.put(this.teamIndex, 0)
            }
        }
        fin.setFinTeam_(this.teamIndex)
        if (fin.getLevel_() == 2) {
            this.upOrDown = !this.upOrDown
            fin.setUpOrDown_(this.upOrDown)
        }
        if (this.upOrDown) {
            if (fin.level_ % 2 == 0) {
                fin.setRotate_(Math.PI / 3)
            }
        } else {
            if (fin.level_ % 2 == 0) {
                fin.setRotate_(Math.PI / 1.5)
            }
        }
        if (dat.children) {
            fin.setLeaf_(false)
            for (let i = 0; i < dat.children.length; i++) {
                this.initFinModels(dat.children[i])
            }
        } else {
            fin.setLeaf_(true)
        }
    }

    /* 将所有json对象转化成map,key是id,value是fin对象 */
    initFinModelMap() {
        for (let i = 0; i < this.options.jsonData.length; i++) {
            this.initFinModels(this.options.jsonData[i])
        }
    }

    /* 3级鱼翅长度算法 */
    level3LengthArithmetic(c) {
        let chineseCount   = this.getChineseCount(c)
        let upEnglishCount = this.getUpEnglishCount(c)
        return (chineseCount * this.defaultCharLengthForLevel3AndLow + upEnglishCount * this.defaultUpEnglishLength + (c.length - chineseCount - upEnglishCount) * this.defaultSignLength + 30)
    }

    /* 2级鱼翅长度算法 */
    level2LengthArithmetic(c) {
        let chineseCount   = this.getChineseCount(c)
        let upEnglishCount = this.getUpEnglishCount(c)
        return (chineseCount * this.defaultCharLengthForLevel2 + upEnglishCount * this.defaultUpEnglishLength + (c.length - chineseCount - upEnglishCount) * this.defaultSignLength) + 50
    }

    /* 线上文字坐标算法！重要  */
    levelPositionArithmetic(node) {
        let position = []
        let x        = 0
        let y        = 0
        let offset   = 0
        if (node.level_ === 2) {
            if (node.upOrDown_) {
                let cc = this.getChineseCount(node.name_)
                offset = 0 - (cc * 12 + (node.name_.length - cc) * 6) / 2 + 15
                x      = node.toNodePosition_[0] + (node.fromNodePosition_[0] - node.toNodePosition_[0]) / 2 + offset
                y      = node.fromNodePosition_[1] - (node.fromNodePosition_[1] - node.toNodePosition_[1]) / 2
            } else {
                let cc = this.getChineseCount(node.name_)
                offset = 0 - (cc * 12 + (node.name_.length - cc) * 6) / 2 + 10
                x      = node.toNodePosition_[0] + (node.fromNodePosition_[0] - node.toNodePosition_[0]) / 2 + offset
                y      = node.fromNodePosition_[1] + (node.toNodePosition_[1] - node.fromNodePosition_[1]) / 2
            }
        } else if (node.level_ === 3) {
            x = node.toNodePosition_[0] + 13
            //x = node.toNodePosition_[0] + (node.fromNodePosition_[0] - node.toNodePosition_[0]) / 2 - 22;
            y = node.fromNodePosition_[1] - (node.fromNodePosition_[1] - node.toNodePosition_[1]) / 2 - 16
        }
        position = [x, y]
        return position
    }

    /* 骨干鱼骨每个team的最大长度算法 */
    setTeamMaxLengthFinLength(fin, finLength) {
        let oldLength = this.FinTeamMap.get(fin.getFinTeam_())
        if (finLength > oldLength) {
            this.FinTeamMap.put(fin.getFinTeam_(), finLength + 25)
        }
    }

    /* 重点方法，初始化下一级、下下级的最大长度，用于计算鱼翅坐标 */
    initNextLevelCount() {
        let arr = this.FishBoneMap.values()
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i].fid_ != 0) {
                let f       = this.FishBoneMap.get(arr[i].id_)
                let fParent = this.FishBoneMap.get(arr[i].fid_)
                fParent.setNextLevelCount_(fParent.getNextLevelCount_() + 1)
                switch (f.getLevel_()) {
                    case 2:
                        var length = this.level2LengthArithmetic(arr[i].name_)
                        if (f.getNextLevelCount_() != 0) {
                            length = length + (f.getNextLevelCount_() - 1) * this.defaultCrossStep
                        }
                        f.setFinLength_(length)
                        break
                    case 3:
                        /*父父节点*/
                        let ffParent = this.FishBoneMap.get(fParent.getFid_())
                        /*3级文字长度*/
                        var length = this.level3LengthArithmetic(arr[i].name_)
                        /*如果有4级，那么长度是3级文字长度+4级算法*/
                        if (f.getNextLevelCount_() != 0) {
                            length = length + f.getNextLevelCount_() * this.defaultLevel4Step
                        }
                        /*设置3级文字长度*/
                        f.setFinLength_(length)
                        /*骨干鱼骨根据组判断最长鱼翅*/
                        this.setTeamMaxLengthFinLength(f, length)
                        /*父级节点设置下级最长鱼翅*/
                        fParent.setNextLevelMaxLength_(fParent.getNextLevelMaxLength_() > f.getFinLength_() ? fParent.getNextLevelMaxLength_() : f.getFinLength_())
                        fParent.getChildrenNode_().push(f)
                        break
//                        case 4:
//                            /*父父节点*/
//                            let ffParent = FishBoneMap.get(fParent.getFid_());
//                            /*本节点的长度*/
//                            f.setFinLength_(level3LengthArithmetic(arr[i].name_));
//                            /*父节点下级最长鱼翅*/
//                            fParent.setNextLevelMaxLength_(fParent.getNextLevelMaxLength_() > f.getFinLength_() ? fParent.getNextLevelMaxLength_() : f.getFinLength_());
//                            /*父父节点下两级最长鱼翅*/
//                            ffParent.setNextLevel2MaxLength_(fParent.getNextLevelMaxLength_());
//                            fParent.getChildrenNode_().push(f);
//                            break;
                }
            }
        }
    }

    /*初始化整个鱼身的长度*/
    initMainBoneLength() {
        let length = 0
        let arr    = this.FinTeamMap.values()
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == 0) {
                arr[i] = this.defaultBoneStepLength
            }
            length = length + arr[i]
        }
        this.mainBoneLength = length + this.defaultHeadToFirstNodeLength + this.defaultFishTail + 130
    }

    /*鱼头坐标*/
    initMainBonePositions() {
        let jNode = this.getFishBoneNode(this.mainFishTopPosition)
        jNode.setImage(head, false)
        jNode.setSize(this.mainHeadLength, this.defaultFishHeadHeight)
        //jNode.scalaX=Math.random();
        this.baseNodeArray.push(jNode)
    }

    /*初始化骨干鱼骨*/
    initMainBone() {
        this.initMainBoneLength()
        this.initMainBonePositions()
        /*鱼头左侧中心*/
        let jNodeFrom = this.getFishBoneNode(this.mainFishPosition)
        this.baseNodeArray.push(jNodeFrom)
        /*鱼头文字*/
        let textNode       = new JTopo.TextNode(this.FishBoneMap.get(this.mainFishId).name_)
        textNode.level     = 1
        textNode.fontColor = '255,255,255'
        textNode.font      = 'bold 14px 微软雅黑'
        textNode.shadow    = false
        textNode.dragable  = false
        textNode.setLocation(this.mainFishPosition[0] + 5, this.mainFishPosition[1] - 12)
        // 鱼头右击事件
        textNode.addEventListener('mouseup', (event) => {
            if (event.button === 2) {
                this.options.rClickNodeFunction(this.FishBoneMap.get(this.mainFishId), event)
            }
        })
        /*文字点击事件*/
        textNode.click((event) => {
            this.options.clickNodeFunction(this.FishBoneMap.get(this.mainFishId), event)
        })
        this.baseNodeArray.push(textNode)
        /*鱼尾*/
        this.mainFishTailPosition = [this.mainFishPosition[0] - this.mainBoneLength, this.mainFishPosition[1]]
        let jNodeTo               = this.getFishBoneNode(this.mainFishTailPosition)
        this.baseNodeArray.push(jNodeTo)
        // 连线
        //  let link = this.getFishBoneLinkByNode(jNodeFrom, jNodeTo);
        //  link.lineWidth = 1;
        // this.baseNodeArray.push(link);
        /*鱼身*/
        let bodyPosition = [this.mainFishPosition[0] - this.mainBoneLength - 10, this.mainFishPosition[1] - 6]
        let jNode        = this.getFishBoneNode(bodyPosition)
        jNode.setImage(body, false)
        jNode.zIndex = 9
        jNode.setSize(this.mainBoneLength + 10, 9)
        this.baseNodeArray.push(jNode)
        /*鱼尾图片*/
        this.mainFishTailImagePosition = [this.mainFishTailPosition[0] - 24, this.mainFishTailPosition[1] - 42]
        let jNodeTail                  = this.getFishBoneNode(this.mainFishTailImagePosition)
        jNodeTail.setImage(tail, true)
        jNodeTail.zIndex = 10
        this.baseNodeArray.push(jNodeTail)
    }

    /*初始化2级鱼骨坐标*/
    initLevel2Position() {
        let arr   = this.FishBoneMap.values()
        let k     = 0
        let lastX = 0
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].level_ == 2) {
                k++
                if (k == 1) {
                    //X坐标
                    lastX                    = this.mainFishPosition[0] - this.defaultHeadToFirstNodeLength
                    arr[i].fromNodePosition_ = [lastX, this.mainFishPosition[1]]
                    //Ｙ坐标
                    arr[i].toNodePosition_   = [lastX - arr[i].finLength_ / 2, this.mainFishPosition[1] - arr[i].finLength_ * this.sign3 / 2]
                    continue
                }
                if (k % 2 == 1) {
                    //X坐标
                    let l                    = this.FinTeamMap.get(arr[i].getFinTeam_() - 1)
                    lastX                    = lastX - (l == 0 ? this.defaultBoneStepLength : l)
                    arr[i].fromNodePosition_ = [lastX, this.mainFishPosition[1]]
                    //Ｙ坐标
                    arr[i].toNodePosition_   = [lastX - arr[i].finLength_ / 2, this.mainFishPosition[1] - arr[i].finLength_ * this.sign3 / 2]
                } else {
                    //X坐标
                    lastX                    = lastX - this.defaultCrossStep
                    arr[i].fromNodePosition_ = [lastX, this.mainFishPosition[1]]
                    //Ｙ坐标
                    arr[i].toNodePosition_   = [lastX - arr[i].finLength_ / 2, this.mainFishPosition[1] + arr[i].finLength_ * this.sign3 / 2]
                }
            }
        }
    }

    /*初始化3级鱼骨坐标*/
    initLevel3Position() {
        let arr = this.FishBoneMap.values()
        for (let k = 0; k < arr.length; k++) {
            if (arr[k].level_ == 2) {
                /*例如1001*/
                let node = arr[k].childrenNode_
                let s    = 0
                if (node.length > 0) {
                    for (let i = node.length - 1; i >= 0; i--) {
                        if (node[i].upOrDown_) {
                            node[i].fromNodePosition_ = [arr[k].toNodePosition_[0] + s * this.defaultCrossStep / 2 + 15 / 2, arr[k].toNodePosition_[1] + s * this.defaultCrossStep * this.sign3 / 2 + 15 * this.sign3 / 2]
                        } else {
                            node[i].fromNodePosition_ = [arr[k].toNodePosition_[0] + s * this.defaultCrossStep / 2, arr[k].toNodePosition_[1] - s * this.defaultCrossStep * this.sign3 / 2]
                        }
                        node[i].toNodePosition_ = [node[i].fromNodePosition_[0] - node[i].finLength_, node[i].fromNodePosition_[1]]
                        s++
                    }
                }
            }
        }
    }

    init() {
        if (!this.validate()) {
            return false
        }

        this.initHtmlCanvas()
        this.initJtoPoScene()
        this.initFinModelMap()
        this.initNextLevelCount()
        this.initMainBone()
        this.initLevel2Position()
        this.initLevel3Position()
        this.render()

        this.stage.centerAndZoom()
        this.stage.zoomIn(1.2)
    }

    render() {
        for (let i = 0; i < this.baseNodeArray.length; i++) {
            if (this.baseNodeArray[i] != null) {
                this.scene.add(this.baseNodeArray[i])
            }
        }
        let arr = this.FishBoneMap.values()
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].fromNodePosition_ && arr[i].toNodePosition_) {
                let jNodeFrom = this.getFishBoneNode(arr[i].fromNodePosition_)
                this.scene.add(jNodeFrom)
                let jNodeTo = this.getFishBoneNode(arr[i].toNodePosition_)
                this.scene.add(jNodeTo)
                let link = this.getFishBoneLinkByNode(arr[i], jNodeFrom, jNodeTo)
                this.scene.add(link)
                let textNode = this.getFishTextNode(arr[i])
                let position = this.levelPositionArithmetic(arr[i])
                textNode.setLocation(position[0], position[1])
                this.scene.add(textNode)
            }
        }
    }
}

/**
 * 根据级别出现菜单
 */
export function levelShowMenu(level = 0) {
    // 下级'subCreate', 同级'equalCreate', 编辑'edit', 删除'delete'
    switch (level) {
        case 1:
            return ['subCreate', 'edit']
        case 2:
            return ['subCreate', 'equalCreate', 'edit', 'delete']
        case 3:
            return ['equalCreate', 'edit', 'delete']
        default:
            return []
    }
}
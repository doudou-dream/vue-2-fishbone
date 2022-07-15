export function showJTopoToobar(stage, t) {
    // console.log("-> t", t)
    // let toobarDiv = `
    // <input style="margin:0" type="button" id="zoomOutButton" value=" 放 大 " />
    // <input type="button" id="zoomInButton" value=" 缩 小 " style="margin:0;"/>
    // `

    // t.insertAdjacentHTML('afterbegin', toobarDiv)

    // document.getElementById('zoomOutButton').addEventListener('click', function () {
    //     stage.zoomOut()
    // })
    // document.getElementById('zoomInButton').addEventListener('click', function () {
    //     stage.zoomIn()
    // })
    t.addEventListener('mousewheel', function (event) {
        if (event.deltaY > 0) {
            stage.zoomIn()
        } else {
            stage.zoomOut()
        }
        event.preventDefault()
    })
}


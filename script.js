/**/
let animGlobalColors = {
    ctre: {
        off: "000000",
        red: "FF0000",
        orange: "FF6F00",
        green: "0A9600",
        dimred: "700A0A",
        dimorange: "70370A",
        dimgreen: "0B4207",
    },
    rev: {
        off: "000000",
        red: "FF0000",
        orange: "FF6F00",
        yellow: "FFFF00",
        green: "00FF00",
        cyan: "00FFFF",
        blue: "0000FF",
        magenta: "FF00FF",
        white: "FFFFFF",
    },
    other: {
        off: "000000",
        red: "FF0000",
        orange: "FF6F00",
        green: "0A9600",
        blue: "0000FF",
    },
}
/**/


onload = function () {
    loadEls()
    lastFrameTime = performance.now()
    animEls()
}
let animElsList = null
let animElsDataList = null
function loadEls () {
    let time = performance.now()
    let els = document.querySelectorAll(".lightanim")

    for (let el of els) {
        el.innerHTML = ""

        let anims = [...el.classList].slice(1)
        for (let i = 0; i < anims.length; i++) {
            let animEl = document.createElement("span")
            animEl.className = "lightanim-part"
            animEl.classList.add(anims[i])
            if (i < anims.length - 1) animEl.style.marginRight = "var(--margin-right)"

            if (anims[i].split("-").length > 2) {
                let bgCol = anims[i].split("-")[2].split("_")[0]
                if (bgCol.startsWith(".")) bgCol = eval(`animGlobalColors${bgCol} ?? "FFFFFF"`)

                animEl.style.backgroundColor = `#${bgCol}`
            } else animEl.style.backgroundColor = "#000000"
            el.append(animEl)
        }
    }
    
    animElsList = []; for (let el of els) animElsList.push(...el.children)
    animElsDataList = new Array(animElsList.length).fill(null).map(() => [0, time])
}
let lastFrameTime = null
let debugFps = null
let shouldResetTime = false
let targetFps = 60
function animEls () {
    let frameTime = performance.now()
    if (document.visibilityState == "hidden") {
        requestAnimationFrame(() => animEls())
        return
    } else if (shouldResetTime) {
        setTimeout(function () {
            shouldResetTime = false
            lastFrameTime = frameTime
        }, 20)
    }
    if (frameTime - lastFrameTime < (1000 / targetFps) - 10) {
        requestAnimationFrame(() => animEls())
        return
    }
    while (frameTime - lastFrameTime < 1000 / targetFps) frameTime = performance.now()
    let deltaTime = frameTime - lastFrameTime
    lastFrameTime = frameTime
    debugFps = 1000 / deltaTime

    if (animElsList == null) return
    for (let i = 0; i < animElsList.length; i++) {
        let animData = animElsDataList[i]
        let animState = animData[0]
        let animLastFrameTime = animData[1]
        let animDeltaTime = frameTime - animLastFrameTime
        
        let animEl = animElsList[i]
        let animList = animEl.classList[1].split("-").slice(2)
        if (animList[animState] == undefined && !shouldResetTime) continue
        let animPart = animList[animState].split("_")
        let animColor = animPart[0]
        let animLength = animPart[1]

        if (shouldResetTime) {
            animState = 0
            animLastFrameTime = frameTime
            animDeltaTime = frameTime - lastFrameTime

            animPart = animList[animState].split("_")
            animColor = animPart[0]
            animLength = animPart[1]
            
            animData[0] = animState
            animData[1] = animLastFrameTime
            animData = animElsDataList[i]
            
            animEl.style.backgroundColor = "#000000"
            if (animList[animState] == undefined) continue
        } else if (animDeltaTime >= animLength) {
            animState = (animState + 1) % animList.length
            animLastFrameTime = frameTime - ((animDeltaTime - animLength) % (animLength * animList.length))

            animElsDataList[i][0] = animState
            animElsDataList[i][1] = animLastFrameTime

            animPart = animList[animState].split("_")
            animColor = animPart[0]
            animLastFrameTime = animPart[1]
            
            if (animColor.startsWith(".")) animColor = eval(`animGlobalColors${animColor} ?? "FFFFFF"`)
            animElsList[i].style.backgroundColor = `#${animColor}`
        }
    }

    requestAnimationFrame(() => animEls())
}
document.onvisibilitychange = function () {
    if (document.visibilityState == "hidden") shouldResetTime = true
}

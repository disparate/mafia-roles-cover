if (window.mafiaCoverScriptInjected !== true) {
    window.mafiaCoverScriptInjected = true
    
    var VIDEO_RATIO = 1.7793
    
    var imafiaCover
    var video = document.getElementsByTagName('video')[0]
    youtubeContainer = document.querySelector('.html5-video-player')
    var isTwitch = false
    
    if(youtubeContainer != null) {
        var coverZIndex = "58"
        var container = youtubeContainer
    } else {
        var coverZIndex = ""
        isTwitch = true
        var container = video.parentElement
    }
    var enableVideoBlur = true
    var isVideoPlaying = video => video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2;
    initVideoAnalyser()
    
    window.layoutOrder = 0
    initCoverVars()
}

if(window.mafiaCoverScriptEnabled !== true) {
    window.mafiaCoverScriptEnabled = true
    var settingsDiv
    
    buildSettingsDiv()
    buildCoverDiv()
    updateCoverSize()
    
    var videoAnalyser = window.videoSilenceAnalyser;
    checkIfSilent()
} else {
    window.mafiaCoverScriptEnabled = false
    
    var prevCover = document.getElementById('imafia-cover')
    if(prevCover != null) {
        container.removeChild(prevCover)
    }
    
    prevSettings = document.getElementById('mafia-settings')
    if(prevSettings != null) {
        container.removeChild(prevSettings)
    }
}

function buildCoverDiv() {
    coverBgColor = "black"
    
    imafiaCover = document.createElement('div')
    imafiaCover.id = "imafia-cover"
    imafiaCover.setAttribute("style", `background: ${coverBgColor}; border-radius: 6px; position: absolute; z-index: ${coverZIndex}`)
    
    var prevCover = document.getElementById('imafia-cover')
    if(prevCover != null) {
        container.removeChild(prevCover)
    }
    container.insertBefore(imafiaCover, container.children[1])
    
    const resizeObserver = new ResizeObserver(updateCoverSize)
    resizeObserver.observe(container)
    
    let settingsImg = document.createElement('img')
    settingsImg.id = "imafia-cover-settings-btn"
    settingsImg.className = "mafia_cover_settings_icon"
    settingsImg.src = chrome.runtime.getURL("images/settings.png");
    imafiaCover.appendChild(settingsImg)

    settingsImg.addEventListener('click', function() {
        if(settingsDiv.style.visibility == "visible") {
            settingsDiv.style.visibility = "hidden";
        } else {
            settingsDiv.style.visibility = "visible";
        }
    });
}

function updateCoverSize() {
    var containerRatio = container.clientWidth / container.clientHeight
    if(containerRatio < VIDEO_RATIO) {
        var videoWidth = container.clientWidth
        var videoHeight = videoWidth / VIDEO_RATIO
    } else {
        var videoHeight = container.clientHeight
        var videoWidth = videoHeight * VIDEO_RATIO
    }
    
    var coverHeight = videoHeight * coverHeightPart
    var coverBottom = (container.clientHeight - videoHeight) / 2 + videoHeight * coverBottomSpacePart
    var coverWidth = videoWidth*coverWidthPart
    var coverLeft = (container.clientWidth - videoWidth) / 2 + videoWidth * ((1 - coverWidthPart) / 2)
    imafiaCover.style.bottom = `${Math.round(coverBottom)}px`
    imafiaCover.style.height = `${Math.round(coverHeight)}px`
    imafiaCover.style.width = `${Math.round(coverWidth)}px`
    imafiaCover.style.left = `${Math.round(coverLeft)}px`
    
    document.querySelectorAll(".style-imafia-num").forEach(el => el.remove());
    initialSpace = (100.0 - playerWidth*10 - playersSpace*9) / 2
    
    for (let i = 1; i <= 10; i++) {
        playerNumDiv = document.createElement('div')
        playerNumDiv.innerHTML = i
        playerNumDiv.className = "style-imafia-num"
        playerNumDiv.style.width = `${playerWidth}%`
        playerNumDiv.style.left = `${initialSpace + (playerWidth + playersSpace) * (i - 1)}%`
        playerNumDiv.style.pointerEvents = "none";
        if(numberOnBottom) {
            playerNumDiv.style.bottom = "0px"
            playerNumDiv.style.top = ""
        } else {
            playerNumDiv.style.bottom = ""
            playerNumDiv.style.top = "0px"
        }
        
        imafiaCover.appendChild(playerNumDiv)
    }
}

function initCoverVars() {
    playerWidth = 0.0
    playersSpace = 0.0
    coverHeightPart = 0.0
    coverWidthPart = 0.0
    coverBottomSpacePart = 0.0
    numberOnBottom = false
    
    chrome.storage.local.get(["playerWidth", "playersSpace", "coverHeightPart", "coverWidthPart", "coverBottomSpacePart", "numberOnBottom"], function(items){
        
        playerWidth = items["playerWidth"] ?? 9.1
        playersSpace = items["playersSpace"] ?? 0.95
        coverHeightPart = items["coverHeightPart"] ?? 0.15
        coverWidthPart = items["coverWidthPart"] ?? 0.8
        coverBottomSpacePart = items["coverBottomSpacePart"] ?? 0.005
        numberOnBottom = items["numberOnBottom"] ?? false
        enableVideoBlur = items["enableVideoBlur"] ?? true
        
        updateCoverSize()
        buildSettingsDiv()
    });
}

function buildSettingsDiv() {
    prevSettings = document.getElementById('mafia-settings')
    if(prevSettings != null) {
        container.removeChild(prevSettings)
    }
    
    settingsDiv = document.createElement('div')
    settingsDiv.id = "mafia-settings";
    settingsDiv.className = "mafia_settings_container";
    container.appendChild(settingsDiv)
    
    let closeBtn = document.createElement('img')
    closeBtn.src = chrome.runtime.getURL("images/close.png");
    closeBtn.className = "mafia_settings_close";
    closeBtn.addEventListener('click', function() {
        settingsDiv.style.visibility = "hidden";
    });
    settingsDiv.appendChild(closeBtn)
    
    buildSettingDiv(settingsDiv, "width", "mafia_setting_width", 1.0, coverWidthPart * 100.0, v => coverWidthPart = v / 100.0)
    buildSettingDiv(settingsDiv, "height", "mafia_setting_height", 1.0, coverHeightPart * 100.0, v => coverHeightPart = v / 100.0)
    buildSettingDiv(settingsDiv, "bottom margin", "mafia_setting_bot", 0.5, coverBottomSpacePart * 100.0, v => coverBottomSpacePart = v / 100.0)
    buildSettingDiv(settingsDiv, "number width", "mafia_setting_pl_width", 0.1, playerWidth, v => playerWidth = v)
    buildSettingDiv(settingsDiv, "number margin", "mafia_setting_pl_space", 0.01, playersSpace, v => playersSpace = v)
    buildSettingBotAndTopDiv(settingsDiv)
    buildSettingEnableVideoBlur(settingsDiv)
}

function buildSettingDiv(parent, settingName, settingId, step, initValue, update) {
    setDiv = document.createElement('div')
    setDiv.id = settingId
    setDiv.style.margin = "2px"
    parent.appendChild(setDiv)
    
    let nameSpan = document.createElement("span")
    nameSpan.className = "mafia_settings_title"
    nameSpan.innerHTML = settingName
    
    let minusSpan = document.createElement("span")
    minusSpan.className = "mafia_settings_sign"
    minusSpan.innerHTML = "-"
    minusSpan.id = settingName + "-minus"
    
    let input = document.createElement("input")
    input.className = "mafia_settings_input"
    input.value = initValue
    
    let plusSpan = document.createElement("span")
    plusSpan.className = "mafia_settings_sign"
    plusSpan.innerHTML = "+"
    plusSpan.id = settingName + "-plus"
    
    setDiv.appendChild(nameSpan)
    setDiv.appendChild(minusSpan)
    setDiv.appendChild(input)
    setDiv.appendChild(plusSpan)
    
    let updateOnUiAndSave = value => {
        update(value)
        input.value = value.toFixed(2)
        updateCoverSize()
        saveCoverSizeVars()
    }
    
    minusSpan.addEventListener('click', function() {
        let value = parseFloat(input.value) - step
        updateOnUiAndSave(value)
    });
    
    plusSpan.addEventListener('click', function() {
        let value = parseFloat(input.value) + step
        updateOnUiAndSave(value)
    });
}

function buildSettingBotAndTopDiv(parent) {
    setDiv = document.createElement('div')
    setDiv.id = "mafia_settings_num_pos"
    setDiv.style.margin = "2px"
    parent.appendChild(setDiv)
    
    let nameSpan = document.createElement("span")
    nameSpan.className = "mafia_settings_title"
    nameSpan.innerHTML = "numbers pos"
    
    let topSpan = document.createElement("span")
    topSpan.className = "mafia_settings_small_btn"
    topSpan.innerHTML = "Top"
    topSpan.id = "mafia_settings_top_bot-top"
    
    let botSpan = document.createElement("span")
    botSpan.className = "mafia_settings_small_btn"
    botSpan.innerHTML = "Bot"
    botSpan.id = "mafia_settings_top_bot-bot"
    
    setDiv.appendChild(nameSpan)
    setDiv.appendChild(topSpan)
    setDiv.appendChild(botSpan)
    
    let updateOnUiAndSave = value => {
        numberOnBottom = value
        updateCoverSize()
        saveCoverSizeVars()
    }
    
    topSpan.addEventListener('click', function() {
        updateOnUiAndSave(false)
    });
    
    botSpan.addEventListener('click', function() {
        updateOnUiAndSave(true)
    });
}


function buildSettingEnableVideoBlur(parent) {
    setDiv = document.createElement('div')
    setDiv.id = "mafia_settings_video_blur"
    setDiv.style.margin = "2px"
    parent.appendChild(setDiv)
    
    let nameSpan = document.createElement("span")
    nameSpan.className = "mafia_settings_title"
    nameSpan.innerHTML = "Blur video"
    
    var input = document.createElement("INPUT");
    input.setAttribute("type", "checkbox");
    input.id = "mafia_settings_video_blur_checkbox"
    input.className = "mafia_settings_checkbox"
    input.checked = enableVideoBlur
    
    setDiv.appendChild(nameSpan)
    setDiv.appendChild(input)
    
    let updateOnUiAndSave = value => {
        enableVideoBlur = value
        saveCoverSizeVars()
    }
    
    input.addEventListener('click', function() {
        updateOnUiAndSave(input.checked)
    });
}

function saveCoverSizeVars() {
    chrome.storage.local.set({
        "playerWidth": playerWidth,
        "playersSpace": playersSpace,
        "coverHeightPart": coverHeightPart,
        "coverWidthPart": coverWidthPart,
        "coverBottomSpacePart": coverBottomSpacePart,
        "numberOnBottom": numberOnBottom,
        "enableVideoBlur": enableVideoBlur
    }, function(){
        //  Data saved
    });
}


function initVideoAnalyser() {
    window.context = new AudioContext();
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.9;
    analyser.fftSize = 512;
    var source = context.createMediaElementSource(video);
    source.connect(analyser);
    analyser.connect(context.destination);
    window.videoSilenceAnalyser = analyser
}

var SILENCE_CHECK_PERIOD = 200
var SILENCE_TILL_BLUR = 3000
var silenceCountTillHide = 1
var silenceCounter = 0
var prevVideoTime = 0

function checkIfSilent() {
    if(enableVideoBlur == false) {
        silenceCounter = 0
        setTimeout(checkIfSilent, 1000)
        video.style.webkitFilter = ""
        return
    }
    
    if(window.mafiaCoverScriptEnabled !== true) {
        silenceCounter = 0
        video.style.webkitFilter = ""
        return
    }
    
    if(!isVideoPlaying(video)) {
        silenceCounter = 0
        setTimeout(checkIfSilent, SILENCE_CHECK_PERIOD)
        video.style.webkitFilter = "blur(30px)"
        return
    }
    
    var array = new Uint8Array(videoAnalyser.fftSize);
    videoAnalyser.getByteTimeDomainData(array);
    
    var average = 0.0;
    for (i = 0; i < array.length; i++) {
        a = Math.abs(array[i] - 128);
        average += a;
    }
    average /= array.length;
    
    if(Math.abs(video.currentTime - prevVideoTime) > SILENCE_CHECK_PERIOD * 2) {
        silenceCountTillHide = 1
    }
    prevVideoTime = video.currentTime
    
    if(average < 0.1) {
        silenceCounter++
    } else {
        silenceCountTillHide = SILENCE_TILL_BLUR / SILENCE_CHECK_PERIOD
        video.style.webkitFilter = ""
        silenceCounter = 0
    }
    
    console.log("Silence check", `average: ${average}, counter ${silenceCounter}, date ${Date.now()}`)
    
    if(silenceCounter > silenceCountTillHide) {
        video.style.webkitFilter = "blur(50px)"
    }
    
    setTimeout(checkIfSilent, SILENCE_CHECK_PERIOD)
}

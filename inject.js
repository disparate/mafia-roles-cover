if (window.mafiaCoverScriptInjected !== true) {
    window.mafiaCoverScriptInjected = true
    
    var VIDEO_RATIO = 1.7793
    
    let addCSS = css => document.head.appendChild(document.createElement("style")).innerHTML=css
    addCSS('.style-imafia-num { color: white; position:absolute; text-align: center; font-size: 24px; font-weight: 500}')
    
    var imafiaCover
    var video = document.getElementsByClassName("html5-main-video")[0]
    var container = document.querySelector('.html5-video-player')
    var isVideoPlaying = video => video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2;
    initVideoAnalyser()
    
    window.layoutOrder = 0
}

if(window.mafiaCoverScriptEnabled !== true) {
    window.mafiaCoverScriptEnabled = true
    
    buildCoverDiv()
    setLayout()
    
    var videoAnalyser = window.videoSilenceAnalyser;
    checkIfSilent()
} else {
    window.mafiaCoverScriptEnabled = false
    var prevCover = document.getElementById('imafia-cover')
    if(prevCover != null) {
      container.removeChild(prevCover)
    }
}

function buildCoverDiv() {
    coverBgColor = "#520000"

    imafiaCover = document.createElement('div')
    imafiaCover.id = "imafia-cover"
    imafiaCover.setAttribute("style", `background: ${coverBgColor}; position: absolute; z-index: 58`)

    var prevCover = document.getElementById('imafia-cover')
    if(prevCover != null) {
      container.removeChild(prevCover)
    }
    container.appendChild(imafiaCover)
    
    const resizeObserver = new ResizeObserver(updateCoverSize)
    resizeObserver.observe(container)

    let nextLayoutButton = document.createElement('div')
    nextLayoutButton.id = "imafia-cover-next-layout"
    nextLayoutButton.innerHTML = ">>"
    nextLayoutButton.style.right = 0
    nextLayoutButton.style.top = 0
    nextLayoutButton.style.position = "absolute";
    nextLayoutButton.style.cursor = "pointer";
    nextLayoutButton.style.fontSize = "20px";
    imafiaCover.appendChild(nextLayoutButton)

    nextLayoutButton.addEventListener('click', function() {
        window.layoutOrder = (window.layoutOrder + 1) % 3
        setLayout()
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
  initialSpace = (100.0 - playerWidth*10 - playersSpace*9)/2
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
var SILENCE_TILL_BLUR = 5000
var silenceCountTillHide = 1
var silenceCounter = 0
var prevVideoTime = 0

function checkIfSilent() {
  if(window.mafiaCoverScriptEnabled !== true) {
    video.style.webkitFilter = ""
    return
  }
    
  if(!isVideoPlaying(video)) {
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

  if(silenceCounter == silenceCountTillHide) {
    video.style.webkitFilter = "blur(50px)"
  } 
  
  setTimeout(checkIfSilent, SILENCE_CHECK_PERIOD)
}

function setLayout() {
    if(window.layoutOrder == 0) {
        //Imafia #1 example: https://www.youtube.com/watch?v=ZUbJmJhLQI4
        playerWidth = 8.4
        playersSpace = 1.5
        coverHeightPart = 0.1192
        coverWidthPart = 0.630
        coverBottomSpacePart = 0.080
        numberOnBottom = true
    } else if(window.layoutOrder == 1) {
        //Imafia #2  example: https://www.youtube.com/watch?v=faZl-AorxZo
        playerWidth = 8.3
        playersSpace = 1.7
        coverHeightPart = 0.08
        coverWidthPart = 0.940
        coverBottomSpacePart = 0.170
        numberOnBottom = true
    } else if(window.layoutOrder == 2) {
        //Imafia #3 example: https://www.youtube.com/watch?v=LwZGiLQ3q4Y
        playerWidth = 9.1
        playersSpace = 0.95
        coverHeightPart = 0.134
        coverWidthPart = 0.620
        coverBottomSpacePart = 0.014
        numberOnBottom = false
    }
    updateCoverSize()
}

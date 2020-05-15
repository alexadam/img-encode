var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext
var audioContext = audioContext || new AudioContext()
var audio = new Audio()

var width = 800
var height = 600
var canvas = document.getElementById("spectrum-canvas")
var ctx = canvas.getContext('2d')
var animationFunc
var speed = 2
var fftsize = 2048 //4096 //1024 //2048
var tempCanvas = document.createElement('canvas')


var input = input || audioContext.createMediaElementSource(audio)
var analyser = audioContext.createAnalyser()

input.connect(analyser)
input.connect(audioContext.destination)



function showLoading() {
    $('#waitScreen').removeClass('invisible')
}
function hideLoading() {
    $('#waitScreen').addClass('invisible')
}



function loadCanvas(imagePath) {
    let reader = new FileReader()
    let c = document.getElementById('canvas')
    let ctx = c.getContext("2d")
    let img = new Image()

    reader.readAsDataURL(imagePath)
    reader.onload = function (_file) {
        img.src = _file.target.result
        img.onload = function () {
            c.width = img.width
            c.height = img.height
            ctx.drawImage(img, 0, 0, img.width, img.height)
        }
        img.onerror = function () {
            alert('Invalid file: ' + file.type)
        }
    }

}

function loadCanvasFromExampleFiles(imagePath) {
    let c = document.getElementById('canvas')
    let ctx = c.getContext("2d")
    let img = new Image()

    img.src = imagePath
    img.onload = function () {
        c.width = img.width
        c.height = img.height
        ctx.drawImage(img, 0, 0, img.width, img.height)
    }
    img.onerror = function () {
        alert('Invalid file: ' + imagePath)
    }

}

function getImageData() {
    let srcCanvas1 = document.getElementById("canvas")
    let srcCtx1 = srcCanvas1.getContext("2d")
    let srcImgData1 = srcCtx1.getImageData(0, 0, srcCanvas1.width, srcCanvas1.height)
    let height = srcImgData1.height
    let width = srcImgData1.width

    let durationSeconds = parseFloat($('#lengthInSeconds').val())
    let tmpData = []
    let maxFreq = 0
    let data = []
    let sampleRate = 44100
    let channels = 1
    let numSamples = Math.round(sampleRate * durationSeconds)
    let samplesPerPixel = Math.floor(numSamples / width)
    let maxSpecFreq = 20000 // Hz
    let C = maxSpecFreq / height
    let yFactor = 2 // y-axis resolution

    for (let x = 0; x < numSamples; x++) {
        let rez = 0
        let pixel_x = Math.floor(x / samplesPerPixel)

        for (let y = 0; y < height; y += yFactor) {
            let pixel_index = (y * width + pixel_x) * 4
            let r = srcImgData1.data[pixel_index]
            let g = srcImgData1.data[pixel_index + 1]
            let b = srcImgData1.data[pixel_index + 2]

            let s = r + b + g
            let volume = Math.pow(s * 100 / 765, 2)

            let freq = Math.round(C * (height - y + 1))
            rez += Math.floor(volume * Math.cos(freq * 6.28 * x / sampleRate))
        }

        tmpData.push(rez)

        if (Math.abs(rez) > maxFreq) {
            maxFreq = Math.abs(rez)
        }
    }

    for (let i = 0; i < tmpData.length; i++) {
        data.push(32767 * tmpData[i] / maxFreq); //32767
    }

    let wave = new RIFFWAVE()
    wave.header.sampleRate = sampleRate
    wave.header.numChannels = channels
    wave.header.bitsPerSample = 16
    wave.Make(data)
    let tBlob = dataURItoBlob(wave.dataURI)
    // saveAs(tBlob, 'result.wav')

    // when done - hide the loading screen
    hideLoading()

    let fileURL = window.URL.createObjectURL(tBlob)

    $('#previewPage').removeClass('invisible')
    $('#download-link-container').on('click', () => saveAs(tBlob, 'result.wav'))

    // scroll down
    let previewPage = document.getElementById('previewPage')
    let bbox = previewPage.getBoundingClientRect()
    window.scrollTo(0, bbox.y + window.scrollY)

    audio.src = wave.dataURI
    audio.controls = true
    audio.onpause = () => {
        window.cancelAnimationFrame(animationFunc)
    }
    audio.addEventListener('ended', () => {
        window.cancelAnimationFrame(animationFunc)
    }
    )

    audio.id = "audioPlayer"
    document.getElementById('audioControls').appendChild(audio)
    audio.onplay = () => {
        render()
    }

    analyser = audioContext.createAnalyser()
    analyser.smoothingTimeConstant = 0.3
    analyser.fftSize = 1024 //fftsize

    input.connect(analyser)
    input.connect(audioContext.destination)

    // reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function dataURItoBlob(dataURI) {
    let byteString
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1])
    else
        byteString = unescape(dataURI.split(',')[1])

    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    let ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ia], { type: mimeString })
}



function render() {
    let freq = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(freq)

    tempCanvas.width = width
    tempCanvas.height = height
    let tempCtx = tempCanvas.getContext('2d')
    tempCtx.drawImage(canvas, 0, 0, width, height)

    for (let i = 0; i < freq.length; i++) {
        let value = freq[i]

        ctx.fillStyle = `rgb(${value}, ${value}, ${value})`

        let percent = i / freq.length
        let y = Math.round(percent * height)

        ctx.fillRect(width - speed, height - y, speed, speed)
    }

    ctx.translate(-speed, 0)
    ctx.drawImage(tempCanvas, 0, 0, width, height,
        0, 0, width, height)

    ctx.setTransform(1, 0, 0, 1, 0, 0)

    /////
    animationFunc = requestAnimationFrame(render.bind(this))
}
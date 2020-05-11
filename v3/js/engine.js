var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
    var audioContext = new AudioContext();
    var audio = new Audio();


var width = 800
var height = 600
var canvas = document.getElementById("spectrum-canvas")
var ctx = canvas.getContext('2d')
var animationID;
var speed = 2
var fftsize = 2048 //4096 //1024 //2048
var tempCanvas = document.createElement('canvas')


    var input = audioContext.createMediaElementSource(audio);
    var analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.1;
    analyser.fftSize = fftsize;

    // Connect graph.
    input.connect(analyser);
    input.connect(audioContext.destination);







function loadCanvas(imagePath) {
    var reader = new FileReader();
    var c = document.getElementById('canvas');
    var ctx = c.getContext("2d");
    var img = new Image();

    reader.readAsDataURL(imagePath);
    reader.onload = function(_file) {
        img.src    = _file.target.result;
        img.onload = function() {
            c.width = img.width;
            c.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
        };
        img.onerror= function() {
            alert('Invalid file: '+ file.type);
        };
    };

}

function getImageData() {
    var srcCanvas1 = document.getElementById("canvas");
    var srcCtx1 = srcCanvas1.getContext("2d");
    var srcImgData1 = srcCtx1.getImageData(0, 0, srcCanvas1.width, srcCanvas1.height);
    var height = srcImgData1.height;
    var width = srcImgData1.width;

    var durationSeconds = 3; parseFloat($('#length').val());
    var tmpData = [];
    var maxFreq = 0;
    var data = [];
    var sampleRate = 44100;
    var channels = 1;
    var numSamples = Math.round(sampleRate * durationSeconds);
    var samplesPerPixel = Math.floor(numSamples / width);
    var maxSpecFreq = parseInt($('#maxFreq').val());
    var C = maxSpecFreq / height;
    var yFactor = 2 // parseFloat($('#yFactor').val());

    for (var x = 0; x < numSamples; x++) {
        var rez = 0;
        var pixel_x = Math.floor(x / samplesPerPixel);

        for (var y = 0; y < height; y += yFactor) {
            var pixel_index = (y * width + pixel_x) * 4;
            var r = srcImgData1.data[pixel_index];
            var g = srcImgData1.data[pixel_index + 1];
            var b = srcImgData1.data[pixel_index + 2];

            var s = r + b + g;
            var volume = Math.pow(s * 100 / 765, 2);

            var freq = Math.round(C * (height - y + 1));
            rez += Math.floor(volume * Math.cos(freq * 6.28 * x / sampleRate));
        }

        tmpData.push(rez);

        if (Math.abs(rez) > maxFreq) {
            maxFreq = Math.abs(rez);
        }
    }

    for (var i = 0; i < tmpData.length; i++) {
        data.push(32767 * tmpData[i] / maxFreq); //32767
    }

    var wave = new RIFFWAVE();
    wave.header.sampleRate = sampleRate;
    wave.header.numChannels = channels;
    wave.header.bitsPerSample = 16;
    wave.Make(data);
    var tBlob = dataURItoBlob(wave.dataURI);
    saveAs(tBlob, 'result.wav');

    
    audio.src = wave.dataURI
    audio.controls = true;
    audio.onpause = function(){
        window.cancelAnimationFrame(animationID);
    }
    audio.addEventListener('ended', () =>  
       {           
           window.cancelAnimationFrame(animationID)
       }
    )
    document.getElementById('audioControls').appendChild(audio);
    audio.onplay = function(){
        render();
    }


    input = audioContext.createMediaElementSource(audio);
    analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0;
    analyser.fftSize = fftsize;

    // Connect graph.
    input.connect(analyser);
    input.connect(audioContext.destination);


    // TODO reset canvas

}

function dataURItoBlob(dataURI) {
// convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);
// separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
// write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type: mimeString});
}







   

function render() {
    //console.log('Render');
    // this.width = window.innerWidth;
    // width = 800;
    // // this.height = window.innerHeight;
    // height = Math.round(width*0.67);

    // canvas.width = width
    // canvas.height = height

    //this.renderTimeDomain();
    renderFreqDomain();

    animationID = requestAnimationFrame(render.bind(this));

    // var now = new Date();
    // if (this.lastRenderTime_) {
    //   this.instantaneousFPS = now - this.lastRenderTime_;
    // }
    // this.lastRenderTime_ = now;
  }


  
function renderFreqDomain() {
    let freq = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freq);

    // Copy the current canvas onto the temp canvas.
    tempCanvas.width = width;
    tempCanvas.height = height;
    //console.log(this.canvas.height, this.tempCanvas.height);
    let tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0, width, height);

    // Iterate over the frequencies.
    console.log(freq.length);
    
    for (let i = 0; i < freq.length; i++) {
      let value;
      // Draw each pixel with the specific color.
    //   if (this.log) {
    //     logIndex = this.logScale(i, freq.length);
    //     value = freq[logIndex];
    //   } else {
        value = freq[i];
    //   }

    //   ctx.fillStyle = (this.color ? this.getFullColor(value) : this.getGrayColor(value));
      ctx.fillStyle = getGrayColor(value)
    //   ctx.fillStyle = getFullColor(value)

      let percent = i / freq.length;
      let y = Math.round(percent * height);

      let hhh = height / freq.length

      // draw the line at the right side of the canvas
    //   ctx.fillRect(width - speed, height - y,
    //                speed, speed);
      ctx.fillRect(width - speed, height - y,
                   speed, speed);
    }

    // Translate the canvas.
    ctx.translate(-speed, 0);
    // Draw the copied image.
    // console.log(this.width, this.height);
    ctx.drawImage(tempCanvas, 0, 0, width, height,
                  0, 0, width, height);

    // Reset the transformation matrix.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

function getGrayColor(value) {
    // if (value>160) {
    //     console.log(value);
        
    // }
    return 'rgb(V, V, V)'.replace(/V/g,  value * 1.1);
}


function getFullColor(value) {

    var colorPalette = {
      0: [0,0,0],
      10: [75, 0, 159],
      20: [104,0,251],
      30: [131,0,255],
      40: [155,18,157],
      50: [175, 37, 0],
      60: [191, 59, 0],
      70: [206, 88, 0],
      80: [223, 132, 0],
      90: [240, 188, 0],
      100: [255, 252, 0]
      
    }

    //floor to nearest 10:
    var decimalised = 100 * value / 255
    var percent = decimalised / 100;
    var floored = 10* Math.floor(decimalised / 10);
    var distFromFloor = decimalised - floored;
    var distFromFloorPercentage = distFromFloor/10;
    if (decimalised < 100){
      var rangeToNextColor = [
        colorPalette[floored + 10][0] - colorPalette[floored + 10][0],
        colorPalette[floored + 10][1] - colorPalette[floored + 10][1],
        colorPalette[floored + 10][2] - colorPalette[floored + 10][2]
      ]
    } else {
      var rangeToNextColor = [0,0,0];
    }

    var color = [
      colorPalette[floored][0] + distFromFloorPercentage * rangeToNextColor[0],
      colorPalette[floored][1] + distFromFloorPercentage * rangeToNextColor[1],
      colorPalette[floored][2] + distFromFloorPercentage * rangeToNextColor[2]
    ]


    return "rgb(" + color[0] +", "+color[1] +"," + color[2]+")";
  }
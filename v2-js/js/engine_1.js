function loadCanvas(imagePath) {
    var c = document.getElementById('canvas');
    var ctx = c.getContext("2d");
    var img = new Image();
    img.onload = function () {
        c.width = img.width;
        c.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
    };
    img.src = imagePath;
}

function getImageData() {
    var srcCanvas1 = document.getElementById("canvas");
    var srcCtx1 = srcCanvas1.getContext("2d");
    var srcImgData1 = srcCtx1.getImageData(0, 0, srcCanvas1.width, srcCanvas1.height);
    var srcPixels1 = srcImgData1.data;

    var height = srcImgData1.height;
    var width = srcImgData1.width;

    var durationSeconds = 1;
    var tmpData = [];
    var maxFreq = 0;
    var data = [];
    var sampleRate = 44100;
    var channels = 1;
    var dataSize = 2;
    var numSamples = Math.round(sampleRate * durationSeconds);
    var samplesPerPixel = Math.floor(numSamples / width);
    var C = 20000 / height;

    for (var x = 0; x < numSamples; x++) {
        var rez = 0;

        var pixel_x = Math.floor(x / samplesPerPixel);
//        if (pixel_x >= width) {
//            pixel_x = width - 1;
//        }

        for (var y = 0; y < height; y++) {
            var pixel_index = (y * width + pixel_x) * 4;
//255 * Math.random();//
            var r = srcImgData1.data[pixel_index];
            var g = srcImgData1.data[pixel_index + 1];
            var b = srcImgData1.data[pixel_index + 2];

            var s = r + b + g;
            var volume = s * 100 / 765;

            if (volume === 0) {
                continue;
            }

            var freq = Math.round(C * (height - y + 1));
            rez += Math.floor(volume * Math.sin(freq * 6.28 * x / sampleRate));
        }

        tmpData.push(rez);
        
        if (Math.abs(rez) > maxFreq) {
            maxFreq = Math.abs(rez);
        }
    }
    
    for (var i = 0; i < tmpData.length; i++) {
        data.push(65534 * tmpData[i] / maxFreq);
    }

    var wave = new RIFFWAVE(); // create an empty wave file
    wave.header.sampleRate = sampleRate;
    wave.header.numChannels = channels;
    wave.header.bitsPerSample = 16;
    wave.Make(data); // make the wave file
    var tBlob = dataURItoBlob(wave.dataURI);
    saveAs(tBlob, 'result.wav');
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
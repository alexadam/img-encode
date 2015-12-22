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

    var durationSeconds = parseFloat($('#length').val());
    var tmpData = [];
    var maxFreq = 0;
    var data = [];
    var sampleRate = 44100;
    var channels = 1;
    var numSamples = Math.round(sampleRate * durationSeconds);
    var samplesPerPixel = Math.floor(numSamples / width);
    var maxSpecFreq = parseInt($('#maxFreq').val());
    var C = maxSpecFreq / height;
    var yFactor = parseFloat($('#yFactor').val());

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

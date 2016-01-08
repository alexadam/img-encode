img-encode
==========

Encode an image to audio spectrum

Open an image file

![alt s1.png](https://github.com/alexadam/img-encode/blob/master/s1.png?raw=true "s1.png")

Click on "Encode"

![alt s2.png](https://github.com/alexadam/img-encode/blob/master/s2.png?raw=true "s2.png")

![alt s3.png](https://github.com/alexadam/img-encode/blob/master/s3.png?raw=true "s3.png")

 Open the generated 'result.wav' file with 'Sonic Visualizer', click on 'Layer -> add Spectrogram'. The result:

![alt result](https://github.com/alexadam/img-encode/blob/master/spec6.png?raw=true "spec6.png")

## Demo

https://alexadam.github.io/demos/img-encode/index.html

## Other examples

![alt result](https://github.com/alexadam/img-encode/blob/master/spec1.png?raw=true "spec1.png")

![alt result](https://github.com/alexadam/img-encode/blob/master/spec2.png?raw=true "spec2.png")

![alt result](https://github.com/alexadam/img-encode/blob/master/spec3.png?raw=true "spec3.png")

![alt result](https://github.com/alexadam/img-encode/blob/master/spec4.png?raw=true "spec4.png")

![alt result](https://github.com/alexadam/img-encode/blob/master/spec5.png?raw=true "spec5.png")

## How to use it

There are 2 versions: python ('v1-python' - no longer maintained) and javascript ('v2-js')
This is an usage example for the javascript version, tested on Firefox 41, Ubuntu 15.10, Sonic Visualizer 2.4

1. Download as .zip or clone the repository

2. go to the '/img-encode' folder

3. open '/v2-js/index.html' in Firefox

4. click on 'Open Image...' then on 'Encode'

5. After a few seconds you will be prompted to save the generated 'result.wav' (audio) file

6. Open 'result.wav' with Sonic Visualizer then click on 'Layer -> add Spectrogram'

## Credits

http://www.ohmpie.com/imageencode/

http://www.codebase.es/riffwave/

https://github.com/eligrey/FileSaver.js

var arDrone = require('ar-drone');
var PaVEParser = require('../node_modules/ar-drone/lib/video/PaVEParser');
var http = require('http');

var client = arDrone.createClient();
var video = client.getVideoStream();
var parser = new PaVEParser();

client.config('video:video_channel', 0);

var server = http.createServer(function(req, res){
    res.writeHead(200, {'Content-Type': 'video/H264'});
    video.pipe(parser).pipe(res.write());
});

server.listen(8080, function() {
    console.log('Serving video stream on port 8080 ...');
});

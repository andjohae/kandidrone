var kandiDrone = exports;

exports.tagSearch = require('./lib/tagSearch')
exports.flightRoute = require('./lib/flightRoute')

var arDrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');

exports.createTagSearch = function (client, options) {
    var client = client || arDrone.createClient(options);
    var camera = new autonomy.Camera(options);
    return new kandiDrone.tagSearch(client, camera, options);
}

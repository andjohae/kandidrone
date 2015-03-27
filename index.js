var kandiDrone = exports;

exports.tagSearch = require('./lib/tagSearch')
exports.flightRoute = require('./lib/flightRoute')

var arDrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');

exports.createTagSearch = function (client, controller options) {
    var client = client || arDrone.createClient(options);
    var controller = controller || new autonomy.Controller(client, options);
    var camera = new autonomy.Camera(options);
    return new kandiDrone.tagSearch(client, camera, controller, options);
}

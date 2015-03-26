var kandiDrone = exports;

exports.tagSearch = require('./lib/tagSearch')
exports.flightRoute = require('./lib/flightRoute')

var arDrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');

exports.createTagSearch = function (client, controller, options) {
    var client = client || arDrone.createClient();
    var controller = controller || autonomy.control(client, options);
    return new kandiDrone.tagSearch(client, controller, options);
}

var kandiDrone = exports;

exports.tagSearch = require('./lib/tagSearch')

var arDrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');

exports.createTagSearch = function (client, controller, camera, options) {
    var client = client || arDrone.createClient(options);
    var controller = controller || new autonomy.Controller(client, options);
    var camera = new autonomy.Camera(options);
    return new kandiDrone.tagSearch(client, camera, controller, options);
}

exports.createKandiBrain = function(client, controller, tagSearch, options) {
	var client = client || arDrone.createClient(options);
    var controller = controller || new autonomy.Controller(client, options);
    var tagSearch = tagSearch || kandiDrone.createTagSearch(client, controller);
    return new kandiDrone.createKandiBrain(client, controller, tagSearch, options);
}

var kandiDrone = exports;

exports.tagSearch = require('./lib/tagSearch')

var arDrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');

exports.createTagSearch = function (client, controller, mission, options) {
    var client = client || arDrone.createClient();
    var controller = controller || autonomy.control(client, options);
    var mission = mission || autnonomy.createMission(client, controller, options);
    return new kandiDrone.tagSearch(client, controller, mission, options);
}

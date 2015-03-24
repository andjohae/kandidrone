//var kandiDrone = exports;
var arDrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');

var client = new arDrone.createClient();
var ctrl = new autonomy.control(client);
var mission = new autonomy.createMission(client);

client.resume();
client.on('batteryChange', function (battery) {
    console.log(battery)
});

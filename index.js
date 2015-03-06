//var kandiDrone = exports;
var arDrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');

var client = new arDrone.createClient();
var control = new autonomy.control(client);
var mission = new autonomy.createMission(client);

console.log('Hello world');

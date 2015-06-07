// Required modules:
var df = require('dateformat')
var arDrone = require('ar-drone'),
    autonomy = require('ardrone-autonomy'),
    kandiDrone = require('..')
;
// Initiate and bind the different objects.
var client = arDrone.createClient(),
    controller = autonomy.control(client),
    tagSearch = kandiDrone.createTagSearch(client, controller);
    kandiBrain = kandiDrone.createKandiBrain(client, controller, tagSearch)
;
// Get constants from the arDrone module.
var arDroneConstants = require('ar-drone/lib/constants');
// Get the custom prompt for kandiDrone.
var kandiPrompt = require('../lib/kandiPrompt');

// Enable the mask and navdata options in the arDrone module
// This part is partly copied from Eschnous ardrone-autonomy module
function navdata_option_mask(c) {
  return 1 << c;
}
// Enable navdata options
var navdata_options = (
    navdata_option_mask(arDroneConstants.options.DEMO)
  | navdata_option_mask(arDroneConstants.options.VISION_DETECT)
  | navdata_option_mask(arDroneConstants.options.MAGNETO)
  | navdata_option_mask(arDroneConstants.options.WIFI)
);
// Connect and configure the drone
client.config('general:navdata_demo', true);
client.config('general:navdata_visionDetect',true);
client.config('general:navdata_options', navdata_options);
client.config('video:video_channel', 3); // 0=front, 3=bottom
client.config('detect:detect_type', 12);

// Enable log files for flight data and confirmed tag positions.
//kandiBrain.logData("../dataAnalysis/Logfiler/all/mission-" + df(new Date(), "yyyy-mm-dd_hh-MM-ss") + ".txt");
kandiBrain.logData("../logs/flights/flight_" + df(new Date(), "yyyy-mm-dd_hh-MM-ss") + ".txt");
kandiBrain.logTags('../logs/tags/tags_' + df(new Date(), "yyyy-mm-dd_hh-MM-ss") + ".txt")

// Manual emergency landing command
/*
    ***Note***: Please use objects from the getters in the kandiBrain object
    rather than the pre-defined objects already available in this file.
    Otherwise the process may exit without the drone landing and you will then
    lose control of the drone. In that case, restart the process and the drone
    will land.
*/
var exiting = false;
process.on('SIGINT', function() {
    if (exiting) {
        process.exit(0);
    } else {
        console.log('Got SIGINT. Landing, press Control-C again to force exit.');
        exiting = true;
        kandiBrain.getController().disable();
        kandiBrain.getClient().land(function() {
            process.exit(0);
        });
    }
});

// Prompt user for mission data. The prompt is defined in 'kandiPromt.js'.
function getUI (callback) {
    new kandiPrompt().getUI( function (userData) {
        var dx = userData.dx,
            dy = userData.dy,
            n = userData.n,
            startPos = {x: userData.startX, y: userData.startY},
            height = userData.height
        ;
        callback(dx, dy, n, startPos, height);
    });
}

// Set the neccessary callback functions in order to use kandiBrain correctly.
function fly (dx, dy, n, startPos, height) {
    kandiBrain.verifyArguments(dx, dy, n, startPos, height, kandiBrain.executeRoute, kandiBrain)
}

// Start flight
getUI(fly);

// Required modules:
var df = require('dateformat')
var arDrone = require('ar-drone'),
    autonomy = require('ardrone-autonomy'),
    kandiDrone = require('..')
;
// Initiate and connect the different objects.
var client = arDrone.createClient(),
    controller = autonomy.control(client),
    tagSearch = kandiDrone.createTagSearch(client, controller);
    kandiBrain = kandiDrone.createKandiBrain(client, controller, tagSearch)
;
// Get constants from the arDrone module.
var arDroneConstants = require('ar-drone/lib/constants');
// Get user input to define the search area and optionally the number of tags
// to detect.
var kandiPrompt = require('../lib/kandiPrompt');

// Enable the mask and navdata options in the arDrone module
// This part is partly copied from Eschnous ardrone-autonomy module
function navdata_option_mask(c) {
  return 1 << c;
}
// From the SDK.
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

kandiBrain.logData("../dataAnalysis/Logfiler/all/mission-" + df(new Date(), "yyyy-mm-dd_hh-MM-ss") + ".txt");
kandiBrain.setTagLogPath('../log/tags_' + df(new Date(), "yyyy-mm-dd_hh-MM-ss") + ".txt")

// Add manual emergency landing command
var exiting = false;
process.on('SIGINT', function() {
    if (exiting) {
        process.exit(0);
    } else {
        console.log('Got SIGINT. Landing, press Control-C again to force exit.');
        exiting = true;
        //controller.disable(); //kandiBrain.controller
        client.land(function() {
            process.exit(0);
        });
    }
});

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

function fly (dx, dy, n, startPos, height) {
    kandiBrain.verifyArguments(dx, dy, n, startPos, height, kandiBrain.executeRoute, kandiBrain)
    //setTimeout(kandiBrain.executeRoute, 1000)
}

getUI(fly);

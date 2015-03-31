// Required modules:
var arDrone = require('ar-drone'),
    autonomy = require('ardrone-autonomy'),
    kandiDrone = require('..')
;
// Initiate and connect the different objects.
var client = arDrone.createClient(),
    controller = autonomy.control(client),
    tagSearch = kandiDrone.createTagSearch(client, controller);
    //kandiBrain = kandiDrone.createKandiBrain(client, controller, tagSearch);
// Get constants from the arDrone module.
var constants = require('ar-drone/lib/constants');
// Get user input to define the search area and optionally the number of tags
// to detect.
var kandiPrompt = require('../lib/kandiPrompt');
var userInput = new kandiPrompt().getUI();

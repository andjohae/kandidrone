var arDrone = require('ar-drone'),
    autonomy = require('ardrone-autonomy'),
    kandiDrone = require('..')
;

var client = arDrone.createClient(),
    controller = autonomy.control(client),
    tagSearch = kandiDrone.createTagSearch(client, controller),
    kandiBrain = kandiDrone.createKandiBrain(client, controller, tagSearch)
;

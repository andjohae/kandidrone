var EventEmitter = require('events').EventEmitter;
var util         = require('util');

EPS_dist = 0.1; // in meters

module.exports = tagSearch;
util.inherits(tagSearch, EventEmitter);
function tagSearch(client, camera, controller, options) {
    EventEmitter.call(this);

    options = options || {};
    this._client = client;
    this._camera = camera;
    this._controller = controller;

    this._busy = false;
    this._tagArray = []; // [x, y, n, confirmed]
    this._maxNumDetect = options.maxNum || 15;
}

tagSearch.prototype.resume = function () {
    client.on('navdata', function (data) {
        if (!this._busy && d.demo) {
            this._busy = true;
            this._processNavdata(data);
            this._busy = false;
        }
    });
}

tagSearch.prototype._processNavdata = function (d) {
    if (d.visionDetect && d.visionDetect.nbDetected > 0) {
        var xc = d.visionDetect.xc[0]
        , yc = d.visionDetect.yc[0]
        , wc = d.visionDetect.width[0]
        , hc = d.visionDetect.height[0]
        , yaw = d.visionDetect.orientationAngle[0]
        , dist = d.visionDetect.dist[0] / 100 // Need meters
        , pitch = d.demo.frontBackDegrees.toRad()
        , roll = d.demo.leftRightDegrees.toRad();

        // Get state
        var state = this._controller.state();

        var cam = this._camera.p2m(xc + wc/2, yc + hc/2, dist);

        // We convert this to the controller coordinate system
        var measured = {x: -1 * cam.y, y: cam.x};

        // Rotation is provided by the drone, we convert to radians
        measured.yaw = yaw.toRad();

        var tagPos = {x: state.x + measured.x  - (state.z * Math.tan(pitch)),
                      y: state.y + measured.y - (state.z * Math.tan(roll))};

        this._updateTagArray(tagPos)
    }
}

// For evaluation of updateTagArray method
tagSearch.prototype.evalUpdArray = function (tag) {
    this._updateTagArray(tag);
}

tagSearch.prototype.getTagArray = function () {
    return this._tagArray;
}

tagSearch.prototype._updateTagArray = function (tag) {

    var tagArray = this._tagArray;
    var x = tag.x;
    var y = tag.y;
    var self = this;
    var arrLength = tagArray.length;

    for (var i = 0; i < arrLength; i++) {
        var xi = tagArray[i].x;
        var yi = tagArray[i].y;
        var ni = tagArray[i].numDetect;
        if (Math.sqrt((x-xi)^2+(y-yi)^2) < EPS_dist) {
            if (!tagArray[i].confirmed) {
                tagArray[i].x = (xi+x)/2;
                tagArray[i].y = (yi+y)/2;
                tagArray[i].numDetect = ni+1;

                if (ni >= self._maxNumDetect) {
                    tagArray[i].confirmed = true;
                    self.emit('tagConfirmed', tagArray[i]);
                }
            }

            this._tagArray = tagArray;
            return;
        }
    }

    tagArray.push({x: tag.x, y: tag.y, numDetect: 1, confirmed: false});
    this._tagArray = tagArray;
    return;
}

var EventEmitter = require('events').EventEmitter;
var util         = require('util');
// Declare constants. Distances in meters
EPS_dist = 1.00; // Minimun distance between tags
NUM_upd = 5 // Interval for sending event with updated tag position
MAX_num =  19 // Number of tag detections before a tag is confirmed

module.exports = tagSearch;
util.inherits(tagSearch, EventEmitter);
function tagSearch(client, camera, controller, options) {
    // Call the EventEmitter constructor
    EventEmitter.call(this);
    // Initiate object properties and bind object dependencies
    options = options || {};
    this._client = client;
    this._camera = camera;
    this._controller = controller;
    this._busy = false;
    this._tagArray = []; // [x, y, yaw, number of detections, confirmed]
}

tagSearch.prototype.reset = function (cb, cbObj) {
    callback = cb || function () {};
    this._tagArray = [];
    callback.apply(cbObj);
}

tagSearch.prototype.resume = function () {
    var self = this;
    // Process incoming navdata
    this._client.on('navdata', function (d) {
        if (!self._busy && d.demo) {
            // Make sure we don't call 'procesNavdata()' multiple times
            self._busy = true;
            self._processNavdata(d);
            self._busy = false;
        }
    });
}

tagSearch.prototype._processNavdata = function (d) {
    // NOTE: Handling of vision detect event moved here from ardrone-autonomy's
    // 'Controller' object. Have been modified since we don't use it's 'EKF'.
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
        // Convert pixel position to position relative to the drone
        var cam = this._camera.p2m(xc + wc/2, yc + hc/2, dist);
        // We convert this to the controller coordinate system
        var measured = {x: -1 * cam.y, y: cam.x};
        // Rotation is provided by the drone. Convert to radians
        measured.yaw = yaw.toRad();
        // Convert to world coordinate system & take regard of non horizontal camera
        // because of pitch and roll
        var tagPos = {x: state.x + measured.x  + (state.z * Math.tan(pitch)),
                      y: state.y + measured.y + (state.z * Math.tan(roll)),
                      yaw: measured.yaw};

        this._updateTagArray(tagPos)
    } else {
        // If not found a tag, send event
        this.emit('noTag', Date.now());
    }
}

// For evaluation of updateTagArray method
tagSearch.prototype.evalUpdArray = function (tag) {
    this._updateTagArray(tag);
}

tagSearch.prototype.getTagArray = function () {
    // Return the current tagArray object
    return this._tagArray;
}

tagSearch.prototype._updateTagArray = function (tag) {

    var tagArray = this._tagArray;
    var x = tag.x;
    var y = tag.y;
    var yaw = tag.yaw;
    var self = this;
    var arrLength = tagArray.length;

    for (var i = 0; i < arrLength; i++) {
        // Save array values to variables to avoid calling for the array many times
        var xi = tagArray[i].x;
        var yi = tagArray[i].y;
        var yawi = tagArray[i].yaw;
        var ni = tagArray[i].numDetect;

        // Check if the tag in already found
        if (Math.sqrt(Math.pow((x-xi), 2)+Math.pow((y-yi), 2)) < EPS_dist) {
            // If the tag position is not confirmed, calculate the average position
            if (!tagArray[i].confirmed) {
                tagArray[i].x = (xi+x)/2;
                tagArray[i].y = (yi+y)/2;
                tagArray[i].yaw = (yawi+yaw)/2;
                tagArray[i].numDetect = ni+1;
                self.emit('tag', Date.now());
                // If tag position is updated NUM_udp times, send event
                if (ni % NUM_upd === 0) {
                    self.emit('tagUpdated', tagArray[i]);
                }
                // If tag pos is updated MAX_num times, confirm position and send event
                if (tagArray[i].numDetect >= MAX_num) {
                    tagArray[i].confirmed = true;
                    self.emit('tagConfirmed', tagArray);
                }
            }
            self._tagArray = tagArray;
            return;
        }
    }

    // If tag was not already found, create a new array entry and send event for new tag
    tagArray.push({x: x, y: y, yaw: yaw, numDetect: 1, confirmed: false});
    self.emit('newTag', tagArray[tagArray.length-1]);
    this._tagArray = tagArray;
}

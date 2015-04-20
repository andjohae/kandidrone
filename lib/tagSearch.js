var EventEmitter = require('events').EventEmitter;
var util         = require('util');

EPS_dist = 0.50; // in meters
EPS_base = 0.50; // in meters
NUM_upd = 5 // Intervall for update tagPos
MAX_num =  19 // Number of times to set tag confirmed = true

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
    this._baseTag = false;
}

tagSearch.prototype.reset = function (cb, cbObj) {
    callback = cb || function () {};
    this._tagArray = [];
    callback.apply(cbObj);
}

tagSearch.prototype.resume = function () {
    var self = this;
    console.log(this._tagArray)
    this._client.on('navdata', function (d) {
        if (!self._busy && d.demo) {
            self._busy = true;
            self._processNavdata(d);
            self._busy = false;
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
                      y: state.y + measured.y - (state.z * Math.tan(roll)),
                      yaw: measured.yaw};

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
    var yaw = tag.yaw;
    var self = this;
    var arrLength = tagArray.length;

    for (var i = 0; i < arrLength; i++) {
        var xi = tagArray[i].x;
        var yi = tagArray[i].y;
        var yawi = tagArray[i].yaw;
        var ni = tagArray[i].numDetect;
        if (Math.sqrt(Math.pow((x-xi), 2)+Math.pow((y-yi), 2)) < EPS_dist) {
            if (!tagArray[i].confirmed) {
                tagArray[i].x = (xi+x)/2;
                tagArray[i].y = (yi+y)/2;
                tagArray[i].yaw = (yawi+yaw)/2;
                tagArray[i].numDetect = ni+1;
                if (ni % NUM_upd === 0) {
                    self.emit('tagUpdated', tagArray[i]);
                }

                if (tagArray[i].numDetect >= MAX_num) {
                    tagArray[i].confirmed = true;
                    self.emit('tagConfirmed', tagArray);
                }
            }

            self._tagArray = tagArray;
            return;
        }
    }

    tagArray.push({x: x, y: y, yaw: yaw, numDetect: 1, confirmed: false});
    self.emit('newTag', tagArray[0]);
    if (Math.sqrt(Math.pow(x, 2)+Math.pow(y, 2)) < EPS_base) {
        self._baseTag = true; 
        self.emit('baseTag', self._baseTag);
    }
    console.log(tagArray)
    this._tagArray = tagArray;
}

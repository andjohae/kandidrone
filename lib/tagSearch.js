var EventEmitter = require('events').EventEmitter;
var util         = require('util');

EPS_dist = 0.1; // in meters

module.exports = tagSearch;
util.inherits(tagSearch, EventEmitter);
function tagSearch(client, camera, options) {
    EventEmitter.call(this);

    options = options || {};
    this._client = client;
    this._camera = camera;

    this._busy = false;
    this._tagArray = []; // [x, y, n, confirmed]
    this._maxNumDetect = options.maxNum || 15;
}

tagSearch.prototype.resume = function () {
    client.on('navadata', function (data) {
        if (!this._busy && d.demo) {
            this._busy = true;
            this._processNavdata(data);
            this._busy = false;
        }
    });
}

tagSearch.prototype._BYTNAMN = function (tag) {
    this._tagArray = this._updateTagArray(tag, this._tagArray)
}

//tagSearch.prototype._processNavdata = function (data) {

//}

tagSearch.prototype.evalUpdArray = function (tag) {
    this._updateTagArray(tag, this._tagArray);
}

tagSearch.prototype.getTagArray = function () {
    return this._tagArray;
}

tagSearch.prototype._updateTagArray = function (tag, tagArray) {
    if (!tagArray) {
        var tagArray = [{x: tag.x, y: tag.y, numDetect: 1, confirmed: false}];
        return tagArray;
    }

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

            return tagArray;
        }
    }

    tagArray.push([tag.x, tag.y, 1]);
    return tagArray;
}

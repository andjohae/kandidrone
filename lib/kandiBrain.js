var fs = require('fs');
// Distances in meters
MAX_dx = 50;
MAX_dy = 50;
MAX_h = 5;
DEF_height = 1.5;
MIN_bat = 10;
ANG_cam = 63;
PCT_overlap = 0.9;

module.exports = kandiBrain;
function kandiBrain(client, controller, tagSearch, options) {

	this._options = options || {}
	this._client = client;
	this._controller = controller;
	this._tagSearch = tagSearch;
	this._followingTag = false;
	this._route = [];
	this._numTags = Infinity;
	this._routeNum = 0;
	this._height = this._options.height || DEF_height;
	this._baseTag = false;
	this._tagArray = [];
}

kandiBrain.prototype.getClient = function () {
	return this._client;
}

kandiBrain.prototype.getController = function () {
	return this._controller;
}

kandiBrain.prototype.getTagSearch = function () {
	return this._tagSearch;
}

kandiBrain.prototype._planRoute = function (dx, dy, startPos, height, cb, cbObj) {
	// @TODO: Lägg till yaw.

	console.log('planning route...')
	if (typeof cb !== 'function') {
		console.log('Callback to _planRoute is not a function')
	}

	callback = cb || function () { console.log('vi hade fel') };
	var startX = startPos.x;
	var startY = startPos.y;
	var h = height;
	var camAngle = ANG_cam*Math.PI/360;	// camera angle in radians
	var a = 1; //Indexering av positioner
	var k = 0;
	var Y = 0;
	var width = PCT_overlap*2*h*Math.tan(camAngle);
	var n = 2*(dx/width+1)-1; //Totala antalet positioner
	var Positions = [];

	while(a<=n){
		Y = Math.max(0, Math.pow(-1, k)*dy);
		Positions.push({x: k * width + startX, y: Y + startY});
		a = a+1;
		if(a>=n){
			break;
		}
		k = k+1;
		Positions.push({x: k * width + startX, y: Y + startY});
		a = a+1;
	}

	this._route = Positions;
	this._height = h;
	/* for (var j=0; j<Positions.length; j++) {
		console.log(Positions[j].x + '   ' + Positions[j].y)
	} */
	console.log('route planned')

	callback.apply(cbObj);
}

kandiBrain.prototype.resetRoute = function () {
	this._route = [];
}

kandiBrain.prototype.getRoute = function () {
	return this._route;
}

kandiBrain.prototype.getTagArray = function() {
	return this._tagSearch.getTagArray();
}

kandiBrain.prototype.verifyArguments = function (dx, dy, n, startPos, height, cb, cbObj) {

	console.log('verifying arguments...');

	var startP = startPos || {x: 0, y:0};
	var h = height || DEF_height;

	if ((!dx) || (!dy)) {
		console.log('Please enter boundaries of search area')
		return
	}

	if ((dx < 0) && (MAX_dx <= dx)) {
		console.log('x-distance out of bounds, insert 0 < x < ' + MAX_dx)
		return
	}

	if ((dy < 0) && (MAX_dy <= dy)) {
		console.log('y-distance out of bounds, insert 0 < y < ' + MAX_dy)
		return
	}

	if (typeof n === 'number') {
		this._numTags = Math.floor(Math.abs(n)) || Infinity;
	}

	if ((h < 1) && (h > MAX_h)) {
		console.log('Height is out of bounds, insert 1 < height < ' + MAX_h)
		return
	}

	this._planRoute(dx, dy, startP, h, cb, cbObj);
}

kandiBrain.prototype._takeOff = function(h) {
	var height = h || this._height;
	var self = this;
	this._height = height;
	this._tagSearch.reset(self._tagSearch.resume, self._tagSearch);
	this._client.takeoff(function () {
			self._client.calibrate(0);
			setTimeout(function() {
					self._controller.zero();
					self._controller.go({x: 0, y: 0, z: height, yaw: 0})
			},4000);
	}); // byt till tagposition
}

kandiBrain.prototype.executeRoute = function() {
	var self = this;

	console.log('executing route...')

	this._controller.on('goalReached', function () {
		if (!self._followingTag) {
			self._go2Route(self._routeNum);
			if (self._routeNum < (self._route.length)) {
				self._routeNum++;
			} else if (self._routeNum === self._route.length){
				self._go2Home(self._land, self);
				self._routeNum++;
			}
		}
	})

	this._tagSearch.on('newTag', function (newTag) {
		self._followingTag = true;
		self._go2Tag(newTag);
	})

	this._tagSearch.on('tagUpdated', function (tag) {
		console.log('tagUpdated')
		self._go2Tag(tag);
	})

	this._tagSearch.on('tagConfirmed', function (tagArray) {
		self._followingTag = false;
		self._tagArray = tagArray;
		console.log('tagConfirmed')
		if (tagArray.length >= self._numTags) {
			self._go2Home(self._land, self);
		} else {
			self._go2Route(self._routeNum);
		}
	})

	this._tagSearch.on('baseTag', function (baseTag) {
		self._baseTag = baseTag;
	})

	this._client.on('batteryChange', function (battery) {
		if (battery <= MIN_bat) {
			self._go2Home(self._land, self);
		}
		console.log('Battery level: ' + battery)
	})

	self._takeOff();

}

kandiBrain.prototype._go2Route = function (i) {

	if (i >= this._route.length) {
		return
	}
	//var yaw = this._controller.state().yaw;		//@TODO: add yaw from route
	var nextRoutePos = this._route[i];
	var goal = {x: nextRoutePos.x, y: nextRoutePos.y, z: this._height, yaw: 0};
	//console.log(goal)
	this._controller.go(goal);
}

kandiBrain.prototype._go2Tag = function (tag, tagYaw) {
	//console.log('Go2Tag ' + tag.confirmed + '    ' + tag.numDetect)
	var yaw = tagYaw || 0; //this._controller.state().yaw;
	var goal = {x: tag.x, y: tag.y, z: this._height, yaw: yaw};
	this._controller.go(goal);
}


kandiBrain.prototype._go2Home = function (cb, cbObj) {
	//@TODO: gör så att den medelvärdesbildar när vi kommer tillbaka till
	// första tagen. Reset eller undantag ty första tagen har redan confirmed=true
	var self = this;
	callback = cb || function () {};
	if (this._baseTag) {
		goal = {x: self._tagArray[0].x, y: self._tagArray[0].y, z: self._height, yaw: self._tagArray[0].yaw};
	}
	else {
		goal = {x: 0, y: 0, z: this._height, yaw: 0};
	}
	this._controller.go(goal, function () {
		callback.apply(cbObj);
	})
}

kandiBrain.prototype._land = function () {
	this._client.land() //@TODO: hitta tag

}

kandiBrain.prototype._calcYaw = function (x, y) {
	// Beräkna yaw till goalPos
}

//@TODO: return home at low battery

kandiBrain.prototype.log = function(path) {
    var dataStream = fs.createWriteStream(path);

    this._controller.on('controlData', function(d) {
        var log = (d.state.x + "," +
                   d.state.y + "," +
                   d.state.z + "," +
                   d.state.yaw + "," +
                   d.state.vx + "," +
                   d.state.vy + "," +
                   d.goal.x + "," +
                   d.goal.y + "," +
                   d.goal.z + "," +
                   d.goal.yaw + "," +
                   d.error.ex + "," +
                   d.error.ey + "," +
                   d.error.ez + "," +
                   d.error.eyaw + "," +
                   d.control.ux + "," +
                   d.control.uy + "," +
                   d.control.uz + "," +
                   d.control.uyaw + "," +
                   d.last_ok + "," +
                   d.tag + "\n");

        dataStream.write(log);
    });
}

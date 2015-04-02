// Distances in meters
MAX_dx = 50;
MAX_dy = 50;
DEF_height = 1.5;
MIN_bat = 10;

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

kandiBrain.prototype._planRoute = function (dx, dy, cb, cbObj) {
	// @TODO: Lägg till yaw.

	console.log('planning route...')
	if (typeof cb !== 'function') {
		console.log('Callback to _planRoute is not a function')
	}

	callback = cb || function () { console.log('vi hade fel') };

	var a = 1; //Indexering av positioner
	var k = 0;
	var Y = 0;
	var width = 1;
	var n = 2*(dx/width+1)-1; //Totala antalet positioner
	var Positions = [];

	while(a<=n){
		Y = Math.max(0, Math.pow(-1, k)*dy);
		Positions.push({x: k*width, y: Y});
		a = a+1;
		if(a>=n){
			break;
		}
		k = k+1;
		Positions.push({x: k*width, y: Y});
		a = a+1;
	}

	this._route = Positions;
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

kandiBrain.prototype.verifyArguments = function (dx, dy, n, cb, cbObj) {

	console.log('verifying arguments...');

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

	this._planRoute(dx, dy, cb, cbObj);
}

kandiBrain.prototype._takeOff = function(h) {
	var height = h || this._height;
	var self = this;
	this._height = height;
	this._tagSearch.reset(self._tagSearch.resume, self._tagSearch);
	this._client.takeoff(function () {
		self._controller.zero();
		self._controller.go({x: 0, y: 0, z: height, yaw: 0})
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
		console.log('tagConfirmed')
		if (tagArray.length >= self._numTags) {
			self._go2Home(self._land, self);
		} else {
			self._go2Route(self._routeNum);
		}
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

	var self = this;
	callback = cb || function () {};
	this._controller.go({x: 0, y: 0, z: this._height, yaw: 0}, function () {
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

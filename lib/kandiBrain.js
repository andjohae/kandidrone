var fs = require('fs');
// Declare constants. Distances in meters
MAX_dx = 50; // Maximum length of the search area
MAX_dy = 50; // Maximum width of the searcg area
MAX_h = 5; // Maximum working height
MAX_x = 10; // Maximum positive x start position
MIN_x = -40 // Maximum negative x start position
MAX_y = 10; // Maximum positive y start position
MIN_y = -40; // Maximum negative y start position
DEF_height = 1.5; // Defauly working height
MIN_bat = 10; // Minimum battery level before returning home
ANG_cam = 50.3; // Camera angle of the bottom camera
PCT_overlap = 0.9; // Overlap of the corridor width
TIME_tag = 5000; // Time to decide if tag is lost
DELTA_x = 0.5; // Half the length of rectangle to fly when a tag is lost
DELTA_y = 0.5; // Half the width of rectangle to fly when a tag is lost

module.exports = kandiBrain;
function kandiBrain(client, controller, tagSearch, options) {
	// Initiate object properties and bind object dependencies
	this._options = options || {};
	this._client = client;
	this._controller = controller;
	this._tagSearch = tagSearch;
	this._followingTag = false;
	this._route = [];
	this._numTags = Infinity;
	this._routeNum = 0;
	this._height = this._options.height || DEF_height;
	this._tagArray = [];
	this._tagTimer = 0;
	this._lostTag = false;
	this._searchBox = [];
}

kandiBrain.prototype.getClient = function () {
	// Return current client object
	return this._client;
}

kandiBrain.prototype.getController = function () {
	// Return current controller object
	return this._controller;
}

kandiBrain.prototype.getTagSearch = function () {
	// Return current tagSearch object
	return this._tagSearch;
}

kandiBrain.prototype._planRoute = function (dx, dy, startPos, height, cb, cbObj) {
	console.log('Planning route...')

	callback = cb || function () {};
	var startX = startPos.x;
	var startY = startPos.y;
	var h = height;
	var camAngle = ANG_cam*Math.PI/360;	// camera angle in radians
	var a = 1; // Index for positions
	var k = 0;
	var X = 0;
	var width = PCT_overlap*2*h*Math.tan(camAngle);
	var n = Math.floor(2*(dy/width+1)-1); // Total amount of positions
	var p = Math.floor(dy/width);
	var restY = dy - p*width;
	var Positions = [{x: startX, y: startY}];

	while (a <= n) {
		X = Math.max(0, Math.pow(-1, k)*dx);
		Positions.push({x: X + startX, y: k * width + startY});
		a = a+1;
		if (a >= n ) {
			break;
		}
		k = k+1;
		Positions.push({x: X + startX, y: k * width + startY});
		a = a+1;
	}

	if (X === 0) {
		Positions.push({x: startX, y: k * width + startY + restY});
		Positions.push({x: dx + startX, y: k * width + startY + restY});
	} else {
		Positions.push({x: X + startX, y: k * width + startY + restY});
		Positions.push({x: startX, y: k * width + startY + restY});
	}

	this._route = Positions;
	this._height = h;
	for (var j=0; j<Positions.length; j++) {
		console.log(Positions[j].x + '   ' + Positions[j].y)
	}
	console.log('route planned')
	callback.apply(cbObj);
}

kandiBrain.prototype.resetRoute = function () {
	// Reset route array
	this._route = [];
}

kandiBrain.prototype.getRoute = function () {
	// Return route array
	return this._route;
}

kandiBrain.prototype.getTagArray = function() {
	// Return tag array From tagSearch object
	return this._tagSearch.getTagArray();
}

kandiBrain.prototype.verifyArguments = function (dx, dy, n, startPos, height, cb, cbObj) {
	// Verify input arguments to be sent to the route planner '_planRoute()'
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

	if ((startPos.x < MIN_x) || (startPos.x > MAX_x)) {
		console.log('X-starting position is out of bounds, insert ' + MIN_x + ' < x < ' + MAX_x);
		return
	}

	if ((startPos.y < MIN_y) || (startPos.y > MAX_y)) {
		console.log('Y-starting position is out of bounds, insert ' + MIN_y + ' < x < ' + MAX_y);
		return
	}

	if ((h < 1) && (h > MAX_h)) {
		console.log('Height is out of bounds, insert 1 < height < ' + MAX_h)
		return
	}

	this._planRoute(dx, dy, startP, h, cb, cbObj);
}

kandiBrain.prototype._takeOff = function(h) {
	/* Take off sequence:
		-Reset tagSearch object.
		-Take off.
		-Calibrate magnetometer (device number 0).
		-Go to working height.
		NOTE: If the calibration sequence doesn't finish before the AR Drone
		starts the search mission, please increase the timeout.
	*/
	var height = h || this._height;
	var self = this;
	this._height = height;
	this._tagSearch.reset(self._tagSearch.resume, self._tagSearch);
	this._client.takeoff(function () {
			self._client.calibrate(0);
			setTimeout(function() {
					self._controller.zero();
					self._controller.go({x: 0, y: 0, z: height, yaw: 0})
			}, 4000); //@TODO: Use constant for default timeout?
	});
}

kandiBrain.prototype.executeRoute = function() {
	var self = this;

	console.log('executing route...')

	//--- Initiate listeners ---

	// Event for reached position
	this._controller.on('goalReached', function () {
		var state = self._controller.state();
		// Check if we are going to a tag
		if (!self._followingTag) {
			// Check if we have finished the route
			if (self._routeNum < (self._route.length)) {
				// Go to the next position in route
				self._go2Route(self._routeNum);
				self._routeNum++;
			} else if (self._routeNum === self._route.length){
			// If we have finnished the route, go to takeoff position and land
				console.log('Route executed, returning home')
				self._go2Home(self._land, self);
				self._routeNum++;
			}
		}
	})

	// Event for new tag found
	this._tagSearch.on('newTag', function (newTag) {
		console.log('New tag: x - ' + newTag.x + '   y - ' + newTag.y)
		// Set that we are going to tag
		self._followingTag = true;
		// Set that we have not lost tag
		self._lostTag = false;
		// Set timer to decide if we lose tag
		self._tagTimer = Date.now();
		// Go to tag
		self._go2Tag(newTag);
	})

	// Event for updated tag position
	this._tagSearch.on('tagUpdated', function (tag) {
		console.log('Tag position updated')
		// Go to the updated tag position
		self._go2Tag(tag);
	})

	// Event for confirmed tag
	this._tagSearch.on('tagConfirmed', function (tagArray) {
		// Set no longer going to tag
		self._followingTag = false;
		// Update tagArray
		self._tagArray = tagArray;
		console.log('tagConfirmed')
		// Check if we found all tags
		if (tagArray.length >= self._numTags) {
			// If all tags are found, go to takeoff position and land
			self._go2Home(self._land, self);
			console.log('Returning home after last tag confirmed');
		} else {
			// If not found all tags, go back to route
			self._go2Route(self._routeNum);
			console.log('Continuing route after tag confirmed');
		}
	})

	// Event for lost tag
	this._tagSearch.on('noTag', function (time) {
		// Check if tag is lost for longer time than TIME_tag
		if ((self._followingTag) && (!self._lostTag) && (time-self._tagTimer > TIME_tag)){
			// Set that we lost tag
			self._lostTag = true;
			// Try to find the tag again
			self._findLostTag();
		}
	})

	// Event for found tag
	this._tagSearch.on('tag', function (time) {
		self._lostTag = false;
		// Save the time for found tag
		self._tagTimer = time;
	})

	// Event for a change of the battery level
	this._client.on('batteryChange', function (battery) {
		// Check if battery level is lower than MIN_bat
		if (battery <= MIN_bat) {
			// If low battery go to takeoff position and land
			self._go2Home(self._land, self);
		}
		// Print the new battery level (optional, feel free to comment out)
		console.log('Battery level: ' + battery)
	})

	// --- Start the search sequence ---
	self._takeOff();

}

kandiBrain.prototype._go2Route = function (i) {
	// Check if route is finished
	if (i >= this._route.length) {
		return
	}
	// Save next route position to variable to avoid calling for the array
	var nextRoutePos = this._route[i];
	// Set next position
	var goal = {x: nextRoutePos.x, y: nextRoutePos.y, z: this._height, yaw: 0};
	// Go to next position
	this._controller.go(goal);
}

kandiBrain.prototype._go2Tag = function (tag, tagYaw) {
	var yaw = tagYaw || 0; // Could use default: this._controller.state().yaw;
	// Set tag position as goal
	var goal = {x: tag.x, y: tag.y, z: this._height, yaw: yaw};
	// Go to tag position
	this._controller.go(goal);
}

kandiBrain.prototype._findLostTag = function () {
	var self = this;
	var count = 0;
	var state = this._controller.state();
	var stateX = state.x;
	var stateY = state.y;
	// Calculate square with copter in center
	this._searchBox = [{x: stateX+DELTA_x, y: stateY+DELTA_y},
				{x: stateX+DELTA_x, y: stateY-DELTA_y},
				{x: stateX-DELTA_x, y: stateY-DELTA_y},
				{x: stateX-DELTA_x, y: stateY+DELTA_y}];

	// Check if square is finished
	if (count === 0) {
		// Go to next square position
		self._searchLostTag(count);
		count++;
	}

	// Event for reached position
	this._controller.on('goalReached', function () {
		// Check if tag is still lost
		if (self._lostTag) {
			// Check if square is finished
			if (count < (self._searchBox.length)) {
				// If square is not finishedm go to next square position
				self._searchLostTag(count);
				count++;
			} else if (count === self._searchBox.length){
				// If square is finished go to next position in route
				self._followingTag = false;
				self._lostTag = false;
			}
		}
	})
}

kandiBrain.prototype._searchLostTag = function (count) {
	// Check if square is finished
	if (count >= this._searchBox.length) {
		return
	}
	// Save next square position to variable to avoid calling for the array
	var nextSearchTagGoal = this._searchBox[count];
	// Set next square position
	var goal = {x: nextSearchTagGoal.x, y: nextSearchTagGoal.y, z: this._height, yaw: 0};
	this._controller.go(goal);
}


kandiBrain.prototype._go2Home = function (cb, cbObj) {
	var callback = cb || function () {};
	var goal = {x: 0, y: 0, z: this._height, yaw: 0};
	// Go to home position
	this._controller.go(goal, function () {
		callback.apply(cbObj);
	})
}

kandiBrain.prototype._land = function () {
	console.log('Landing')
	this._client.land()
}

kandiBrain.prototype.logTags = function(path) {
	// Log tag position in specified path
	fs.writeFile(path, 'The following tag positions were confirmed:\n',
		function (err) { if (err) {console.error(err)} }
	);
	this._tagSearch.on('tagConfirmed', function (tagArray) {
		var tag = tagArray[tagArray.length-1];
		fs.appendFile(path, '{x:' + tag.x + ', y:' + tag.y + '}\n',
			function (err) { if (err) {console.error(err)} }
		);
	});
}

kandiBrain.prototype.logData = function(path) {
    // Log controller data in specified path
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

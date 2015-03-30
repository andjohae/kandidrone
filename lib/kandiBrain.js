
MAX_dx = 50;
MAX_dy = 50;

module.exports = kandiBrain;
function kandiBrain(client, controller, tagSearch, options) {

	this._options = options || {}
	this._client = client;
	this._controller = controller;
	this._tagSearch = tagSearch;
	this._route = [];
	this._numTags = infinity;
	this._routeNum = 0;
}

kandiBrain.prototype._planRoute = function (dx,dy) {
	var a = 1; //Indexering av positioner
	var k = 0;
	var X = 0;
	var width = 1;
	var n = 2*(dy/width+1)-1; //Totala antalet positioner
	var Positions = [];

	while(a<=n){
		X = Math.max(0,(-1)^k*dx);
		Positions.push = [{x: X, y: k*width}];
		a = a+1;
		if(a>=n){
			break;
		}
		k = k+1;
		Positions.push = [{x: X, y: k*width}]
		a = a+1;
	}
	this._route = Positions;
	return
}

kandiBrain.prototype.resetRoute = function () {
	this._route = [];
}

kandiBrain.prototype.getRoute = function () {
	return this._route;
}

kandiBrain.prototype.verifyArguments = function (dx, dy, n) {

	if ((!dx) || (!dy)) {
		console.log('Please enter boundaries of search area')
		return
	}

	if ((dx < 0) && (MAX_dx <= dx) {
		console.log('x-distance out of bounds, insert 0 < x < ' MAX_dx)
		return
	}

	if ((dy < 0) && (MAX_dy <= dy) {
		console.log('y-distance out of bounds, insert 0 < y < ' MAX_dy)
		return
	}
	
	if (typeof n === 'number') {
		this._numTags = Math.floor(Math.abs(n)) || infinity;
	}

	this._planRoute(dx, dy);
}

kandiBrain.prototype._takeOff = function() {
	this._tagSearch.reset().resume();

}

kandiBrain.prototype.executeRoute = function() {




}








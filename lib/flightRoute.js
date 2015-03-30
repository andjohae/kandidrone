module.exports = flightRoute;
function flightRoute(options){

	options = options || {};

	this._Positions = []; //target positions
}

flightRoute.prototype.planRoute = function (dx,dy) {
	var a = 1; //Indexering av positioner
	var k = 0;
	var X = 0;
	var Svepbredd = 1;
	var n = 2*(dy/Svepbredd+1)-1; //Totala antalet positioner
	var Positions = [];

	while(a<=n){
		X = Math.max(0,(-1)^k*dx);
		Positions.push = [{x: X, y: k*L}];
		a = a+1;
		if(a>=n){
			break;
		}
		k = k+1;
		Positions.push = [{x: X, y: k*L}]
		a = a+1;
	}
	return this._Positions = Positions;
}

flightRoute.prototype.getRoute = function () {
	return this._Positions;
}
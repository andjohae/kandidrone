var EventEmitter = require('events').EventEmitter;
var util         = require('util');

EPS_dist = 0.1; // in meters

module.exports = Dronelander;
util.inherits(Dronelander, EventEmitter);
function Dronelander(client, camera, controller, options) {
    EventEmitter.call(this);

    options = options || {};
    this._client = client;
    this._camera = camera;
    this._controller = controller;

    this._busy = false;
}

Dronelander.prototype.resume = function () {
    client.on('navdata', function (data) {
        if (!this._busy && d.demo) {
            this._busy = true;
            this._processNavdata(data);
            this._busy = false;
        }
    });
}

Dronelander.prototype._processNavdata = function (d) {
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

        
    }
}

Dronelander.prototype.correctPosition = function () {
    ex = tagPos.x - this._state.x; // Use this._ or not?
    ey = tagPos.y - this._state.y;
    ez = state.z - 0.3;
    eyaw = measured.yaw - this._state.yaw;
    while (ex > EPS_dist && ey > EPS_dist){
    // Get Raw command from PID
    var ux = this._pid_x.getCommand(ex);
    var uy = this._pid_y.getCommand(ey);
    
    var uyaw = this._pid_yaw.getCommand(eyaw);

    // Ceil commands and map them to drone orientation
    var yaw  = this._state.yaw;
    var cx   = within(Math.cos(yaw) * ux + Math.sin(yaw) * uy, -1, 1);
    var cy   = within(-Math.sin(yaw) * ux + Math.cos(yaw) * uy, -1, 1);
    
    var cyaw = within(uyaw, -1, 1);

    // Emit the control data for auditing
    this.emit('controlData', {
        state:   this._state,
        goal:    this._goal,
        error:   {ex: ex, ey: ey, ez: ez, eyaw: eyaw},
        control: {ux: ux, uy: uy, uz: uz, uyaw: uyaw},
        last_ok: this._last_ok,
        tag:     (d.visionDetect && d.visionDetect.nbDetected > 0) ? 1 : 0
    });

    // Send commands to drone
    if (Math.abs(cx) > 0.01) this._client.front(cx);
    if (Math.abs(cy) > 0.01) this._client.right(cy);
    
    if (Math.abs(cyaw) > 0.01) this._client.clockwise(cyaw);
    }

    if (ex <= EPS_dist && ey <= EPS_dist){
        if (uz - state.z <= 0.3){
        client.land();
        }
        else{
            var uz = this._pid_z.getCommand(ez);
            var cz   = within(uz, -1, 1);
                if (Math.abs(cz) > 0.01) this._client.down(cz);
        }
    }
}





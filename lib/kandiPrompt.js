var prompt = require('prompt')

module.exports = kandiPrompt;
function kandiPrompt () {
    this._promptDef = {
        properties: {
            dx: {
                description: 'Enter dx',
                type: 'number',
                minimum: 0,
                maximum: 30,
                message: 'dx must be a number in the range 0 to 50 [m]',
                required: true
            },
            dy: {
                description: 'Enter dy',
                type: 'number',
                minimum: 0,
                maximum: 30,
                message: 'dy must be a number in the range 0 to 50 [m]',
                required: true
            },
            n: {
                description: 'Enter n',
                type: 'number',
                minimum: 0,
                maximum: 10,
                divisibleBy: 1,
                message: 'n must be an integer in the range 0 to 10',
                default: Infinity,
                required: false
            },
            height: {
                description: 'Enter flight height',
                type: 'number',
                minimum: 1,
                maximum: 5,
                default: 1.5,
                message: 'Flight height must be a number in the range 1 to 5 [m]',
                required: false
            },
            startX: {
                description: 'Enter x coordinate of start position'
                type: 'number',
                minimum: -40,
                maximum: 10,
                default: 0,
                message: 'Start position must be a number in the range -40 to 10 [m]',
                required: false
            },
            startY: {
                description: 'Enter y coordinate of start position'
                type: 'number',
                minimum: -40,
                maximum: 10,
                default: 0,
                message: 'Start position must be a number in the range -40 to 10 [m]',
                required: false
            }
        }
    };
}

kandiPrompt.prototype.getUI = function(callback) {
    prompt.start();
    prompt.get(this._promptDef, function (err, result) {
        if (err) {
            console.error(err)
            return 1;
        }
        callback(result);
    });
}

var prompt = require('prompt')

/*
    Using the 'prompt' module to create a custom prompt so that the user can
    define the search mission.
    
    NOTE: It seems an entry like '42m3an1ng0fL1f3' will be interpreted as
        number since it begins with numerals. Be careful with what you enter!
*/

module.exports = kandiPrompt;
function kandiPrompt () {
    this._promptDef = {
        properties: {
            dx: {
                description: 'Enter length of search area [m]',
                type: 'number',
                minimum: 0,
                maximum: 30,
                message: 'Length of search area must be a number in the range 0 to 50 [m]',
                required: true
            },
            dy: {
                description: 'Enter width of search area [m]',
                type: 'number',
                minimum: 0,
                maximum: 30,
                message: 'Width of search area must be a number in the range 0 to 50 [m]',
                required: true
            },
            n: {
                description: 'Enter number of tags to find',
                type: 'number',
                minimum: 1,
                maximum: 10,
                divisibleBy: 1,
                message: 'Number of tags must be an integer in the range 1 to 10',
                default: 1,
                required: false
            },
            height: {
                description: 'Enter flight height [m]',
                type: 'number',
                minimum: 1,
                maximum: 5,
                default: 1.5,
                message: 'Flight height must be a number in the range 1 to 5 [m]',
                required: false
            },
            startX: {
                description: 'Enter x coordinate of start position [m]',
                type: 'number',
                minimum: -40,
                maximum: 10,
                default: 0,
                message: 'Start position must be a number in the range -40 to 10 [m]',
                required: false
            },
            startY: {
                description: 'Enter y coordinate of start position [m]',
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

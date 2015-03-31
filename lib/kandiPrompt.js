var prompt = require('prompt')

module.exports = kandiPrompt;
function kandiPrompt () {
    this._promptDef = {
        properties: {
            dx: {
                description: 'Enter dx',
                type: 'number',
                minimum: 0,
                maximum: 50,
                message: 'dx must be a number in the range 0 to 50 [m]',
                required: true
            },
            dy: {
                description: 'Enter dy',
                type: 'number',
                minimum: 0,
                maximum: 50,
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
                required: false
            }
        }
    };
}

kandiPrompt.prototype.getUI = function() {
    prompt.start();
    prompt.get(this._promptDef, function (err, result) {
        if (err) {
            console.error(err)
            return 1;
        }
        return result;
    });
}

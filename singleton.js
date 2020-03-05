// Some code needs to added that are common for the module


//helper function to generate random number
var getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}

var timer = 0;

module.exports = {
    init: function () {
        // init function needs to be implemented here //

        timer = getRandomNumber(1, 999);

        setInterval(() => (timer >= 0xffffffff) ? timer = 0 : timer += 1, 10); //increment every 10 miliseconds, reset at 0xffffffff
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function () {
        return timer;
    }


};
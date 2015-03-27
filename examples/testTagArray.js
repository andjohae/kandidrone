var kandiDrone = require('..');
var tagSearch = kandiDrone.createTagSearch();

var tag = {x: 0.5, y:1.2};

tagSearch.on('tagConfirmed', function () {
    console.log('Success!');
    console.log(tagSearch.getTagArray());
})

for (var i = 0; i<20; i++) {
    tagSearch.evalUpdArray(tag);
}

//console.log(tagSearch.getTagArray());

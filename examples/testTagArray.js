var kandiDrone = require('..');
var tagSearch = kandiDrone.createTagSearch();

var tag = {x: 0.5, y:1.2};

tagSearch.evalUpdArray(tag);
console.log(tagSearch.getTagArray());

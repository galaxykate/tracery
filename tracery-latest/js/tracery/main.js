require.config({

});

require(["./traceryCore"], function(_tracery) {
    'use strict';
    // use app here
    tracery = _tracery;
    console.log(tracery);

    console.log("Tracery complete");
});

/**
 * @author Kate Compton
 */
require.config({
    baseUrl : 'js',
    paths : {

        'jQuery' : 'libs/jquery-1.6.2.min',
        'jQueryUI' : 'libs/jquery-ui-1.10.4.custom.min',
        'jsPlumb' : 'libs/jquery.jsPlumb-1.4.1-all',
        'noise' : 'libs/simplex_noise',

        'inheritance' : 'libs/inheritance',
        'common' : 'modules/shared/common/commonUtils',

    },
    shim : {
        'jsPlumb' : {
            exports : '$',
            deps : ['jQuery']
        },

        'jQueryUI' : {
            exports : '$',
            deps : ['jQuery']
        },

        'inheritance' : {
            exports : 'Inheritance'
        },

        'tracery' : {
            exports : 'tracery'
        },

    }
});
require(["./app"], function(App) {
    app.start();
});

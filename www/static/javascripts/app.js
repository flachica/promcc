var defaultLocation = {};
defaultLocation.lat = 40.43794472516468;
defaultLocation.lon = -3.6795366500000455;

var App = (function(lng, undefined) {
    map = {};
    currentPosition = {};
    
    geoposOptions = { timeout: 10000, enableHighAccuracy: true };
    
    //prod
    serverInfo = {urlList: 'http://app.hubservice.es/promoshop/promccweb/index.php/api/list'};    
    
    //debug
    //serverInfo = {urlList: 'http://localhost/promccweb/index.php/api/list'};    
    
    getCurrentPositionSuccess = function (position) {
        App.initializeMap(position.coords.latitude, position.coords.longitude);
        App.currentPosition.lat = position.coords.latitude;
        App.currentPosition.lon = position.coords.longitude;

        App.map.addMarker({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          title: 'Mi ubicación'
        });
        App.map.setCenter(position.coords.latitude, position.coords.longitude);
        App.getCentrosComerciales();
    };

    getCurrentPositionError = function (error) {
        App.geoposOptions.enableHighAccuracy = false;
        App.geoposOptions.timeout = 5000;
        navigator.geolocation.getCurrentPosition(App.getCurrentPositionSuccess, 
                                             function(error){alert('Geolocation failed: '+error.message)},
                                             App.geoposOptions
                                            );
    };

    initializeMap = function (pLat, pLon) {
        App.map = new GMaps({
            el: '#map',
            lat: pLat,
            lng: pLon,
            zoomControl : true,
            zoomControlOpt: {
                style : 'SMALL',
                position: 'TOP_LEFT'
            },
            panControl : false,
            streetViewControl : false,
            mapTypeControl: false,
            overviewMapControl: false
        });

        App.currentPosition = new Object();
    };

    pintaCentrosComerciales = function(result) {
        for (var i = 0; i < result.length; i++) {
            App.map.addMarker({
              lat: result[i].latitud,
              lng: result[i].longitud,
              title: result[i].nombre
            });
        }
    };

    getCentrosComerciales = function () {
        params = {model: 'Centrocomercial'};        
        Lungo.Service.get(App.serverInfo.urlList, params, pintaCentrosComerciales, "json");
    };

    sectionTrigger = function(event) {
        event.stopPropagation();
        setTimeout(function() {
            lng.Notification.success("Event: " + event.type, "Layout events manager", "info", 2);
        }, 500);
    };

    articleTrigger = function(event) {
        event.stopPropagation();
        console.error(event);
    };

    environment = function(event) {
        var environment = lng.Core.environment();
        var el = lng.dom("section > article#environment");

        if (environment.os) {
            el.find("#os > strong").html(environment.os.name);
            el.find("#os > small").html(environment.os.version);
        }
        el.find("#resolution > strong").html(environment.screen.height + "p x " + environment.screen.width + "p");
        el.find("#navigator > strong").html(environment.browser);
        el.find("#navigator > small").html("Mobile: " + environment.isMobile);
    };

    return {
        sectionTrigger: sectionTrigger,
        articleTrigger: articleTrigger,
        environment: environment,
        getCurrentPositionSuccess: getCurrentPositionSuccess,
        getCurrentPositionError: getCurrentPositionError,
        geoposOptions: geoposOptions,
        initializeMap: initializeMap,
        serverInfo: serverInfo,
        getCentrosComerciales: getCentrosComerciales
    };

})(Lungo);

App.carousel = {prev: null, next: null};

Lungo.Events.init({
    'load section#layoutevents'     : App.sectionTrigger,

    'unload section#layoutevents'   : App.sectionTrigger,

    'load article#environment'      : App.environment,

    'load article#touchevents'      : function(event) {

        ["singleTap", "doubleTap", "hold",
            "swipe", "-swiping", "swipeLeft", "swipeRight", "swipeUp", "swipeDown",
            "rotate", "rotateLeft", "rotateRight",
            "pinch", "pinchIn", "pinchOut",
            "drag", "dragLeft", "dragRight", "dragUp", "dragDown"].forEach(function(type) {
            $$("article#touchevents #gestures").on(type, function(event) {
                $$(this).siblings('.console.output').append(' | ' + type);
            });
        });

        $$("[data-action=clean_console]").tap(function(event) {
            $$('.console.output').html("");
        });

        $$("[data-action=twitter]").tap(function(event) {
            window.open("https://twitter.com/intent/tweet?original_referer=http%3A%2F%2Flungo.tapquo.com%2F&text=@lungojs a framework for developers who want to design, build and share cross device apps", "_blank");
        });

    },


    'load section#carousel': function(event) {
        App.carousel = Lungo.Element.Carousel($$('[data-control=carousel]')[0], function(index, element) {
            Lungo.dom("section#carousel .title span").html(index + 1);
        });
    },

    'tap section#carousel > header [data-direction=left]':  App.carousel.prev,

    'tap section#carousel > header [data-direction=right]': App.carousel.next,

    'load section#pull': function(event) {
        App.pull = new Lungo.Element.Pull('section#pull article', {
            onPull: "Pull down to refresh",
            onRelease: "Release to get new data",
            onRefresh: "Refreshing...",
            callback: function() {
                alert("Pull & Refresh completed!");
                App.pull.hide();
            }
        });
    },


    'touch article#notification a[data-action=normal]': function() {
        Lungo.Notification.show('user', 'Title', 2);
    },

    'touch article#notification a[data-action=loading]': function() {
        Lungo.Notification.show();
        setTimeout(Lungo.Notification.hide, 3000);
    },

    'touch article#notification a[data-action=success]': function() {
        Lungo.Notification.success('Title', 'Description', 'ok', 2);
    },

    'touch article#notification a[data-action=error]': function() {
        Lungo.Notification.error('Title', 'Description', 'remove', 2);
    },

    'touch article#notification a[data-action=confirm]': function() {
        Lungo.Notification.confirm({
            icon: 'user',
            title: 'Lorem ipsum dolor sit amet, consectetur adipisicing.',
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo amet nulla dolorum hic eum debitis dolorem expedita? Commodi molestiae tempora totam explicabo sed deserunt cum iusto eos perspiciatis ea in.',
            accept: {
                icon: 'checkmark',
                label: 'Accept',
                callback: function(){ alert("Yes!"); }
            },
            cancel: {
                icon: 'close',
                label: 'Cancel',
                callback: function(){ alert("No!"); }
            }
        });
    },

    'touch article#notification a[data-action=html]': function() {
        Lungo.Notification.html('<h1>Hello World</h1>', "Close");
    },

    'touch article#notification a[data-action=chaining]': function() {
        Lungo.Notification.show('user', 'user', 2, function() {
            Lungo.Notification.error('Title 2', 'Description 2', 'remove',  2, function() {
                Lungo.Notification.show('cog', 'cog', 2, function() {
                    Lungo.Notification.html('<h1>Hello World</h1>', "Close");
                });
            });
        });
    }

});

Lungo.ready(function() {
    Lungo.Element.loading("#map", 1);

    Lungo.Service.Settings.async = true;
    Lungo.Service.Settings.error = function(type, xhr){
        console.log("Hubo un error al acceder al servidor, type: " + type + " xhr: " + xhr);
        Lungo.Notification.hide();
    };
    
    Lungo.Service.Settings.crossDomain = true;
    Lungo.Service.Settings.timeout = 10000;

    navigator.geolocation.getCurrentPosition(App.getCurrentPositionSuccess, 
                                             App.getCurrentPositionError,
                                             App.geoposOptions
                                            );
});

var DEVEL = true;
var defaultLocation = {};
defaultLocation.lat = 40.43794472516468;
defaultLocation.lon = -3.6795366500000455;

var App = (function(lng, undefined) {
    map = {};
    currentPosition = {};
    
    geoposOptions = { timeout: 10000, enableHighAccuracy: true };
    
    serverDev = {urlList: 'http://192.168.1.130/promccweb/index.php/api/list'};
    serverProd = {urlList: 'http://app.hubservice.es/promoshop/promccweb/index.php/api/list'};
    
    serverInfo = DEVEL ? serverDev : serverProd;    
    
    getCurrentPositionSuccess = function (position) {
        App.initializeMap(position.coords.latitude, position.coords.longitude);
        App.currentPosition.lat = position.coords.latitude;
        App.currentPosition.lon = position.coords.longitude;

        App.map.addMarker({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          title: 'Mi ubicación',
          infoWindow: {
                  content: '<p>Mi ubicación</p>'
              }
        });
        App.getCentrosComerciales();
    };

    getCurrentPositionError = function (error) {
        App.geoposOptions.enableHighAccuracy = false;
        App.geoposOptions.timeout = 5000;
        navigator.geolocation.getCurrentPosition(App.getCurrentPositionSuccess, 
                                             function(error){alert('Geolocation failed: '+error.message);Lungo.Notification.hide();},
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

    verTiendas = function(ccIDHandler) {
        tiendaID = ccIDHandler.substring(10);
        Lungo.Notification.show();
        App.map.removeMarkers();
        App.map.addMarker({
          lat: App.currentPosition.lat,
          lng: App.currentPosition.lon,
          title: 'Mi ubicación',
          infoWindow: {
                  content: '<p>Mi ubicación</p>'
              }
        });
        getTiendas(tiendaID);
    };

    getTiendas = function(parCcID) {
        params = {model: 'Tienda', ccID: parCcID};
        if (DEVEL)        
            Lungo.Service.get(App.serverInfo.urlList, params, pintaTiendas, "json");
        else
            Lungo.Service.post(App.serverInfo.urlList, params, pintaTiendas, "json");
    };

    pintaTiendas = function(result) {
        for (var i = 0; i < result.length; i++) {
            App.map.addMarker({
              lat: result[i].latitud,
              lng: result[i].longitud,
              title: result[i].nombre,
              icon: './img/marcador_tienda.png',
              infoWindow: {
                  content: '<p>' + result[i].nombre + '</p>' + result[i].descripcion + '<br>' + 
                           '<nav class="on-left"><button id="btnTiendas' + result[i].idcentrocomercial + '" onclick="App.verTiendas(this.id)" data-view-article="article_1" data-label="Home">Tiendas</button></nav><nav class="on-right"><button id="btnOfertas" onclick="App.verTiendas(this.id)" data-label="Section">Ofertas</button></nav>',
                maxWidth: '150px'
              }
            });
            if (i==0) {
                App.map.setCenter(result[i].latitud, result[i].longitud);
            }
        }
        App.map.zoomIn(3);
        Lungo.Notification.hide();
    };

    verOfertasCC = function(ccIDHandler) {
        alert(ccIDHandler);
    };

    pintaCentrosComerciales = function(result) {
        for (var i = 0; i < result.length; i++) {
            App.map.addMarker({
              lat: result[i].latitud,
              lng: result[i].longitud,
              title: result[i].nombre,
              icon: './img/marcador_cc.png',
              infoWindow: {
                  content: '<p>' + result[i].nombre + '</p>' + result[i].descripcion + '<br>' + 
                           '<nav class="on-left"><button id="btnTiendas' + result[i].idcentrocomercial + '" onclick="App.verTiendas(this.id)" data-view-article="article_1" data-label="Home">Tiendas</button></nav><nav class="on-right"><button id="btnOfertas" onclick="App.verTiendas(this.id)" data-label="Section">Ofertas</button></nav>',
                maxWidth: '150px'
              }
            });
            if (i==0) {
                App.map.setCenter(result[i].latitud, result[i].longitud);
            }
        }
        if (localStorage.getItem("inicios")){
            if (localStorage.getItem("inicios")<3){
                var inicios = parseInt(localStorage.getItem("inicios"));
                inicios = inicios + 1;
                localStorage.setItem("inicios", inicios);
                Lungo.Notification.html('<h1>Comience</h1>Pinche en el centro comercial más cercano para encontrar sus ofertas', "Cerrar");
            } else {
                Lungo.Notification.hide();
            }
        }else{
            Lungo.Notification.html('<h1>Comience</h1>Pinche en el centro comercial más cercano para encontrar sus ofertas', "Cerrar");
            localStorage.setItem("inicios",1);
        }
    };

    getCentrosComerciales = function () {
        params = {model: 'Centrocomercial', curLat: App.currentPosition.lat, curLon: App.currentPosition.lon};
        if (DEVEL)        
            Lungo.Service.get(App.serverInfo.urlList, params, pintaCentrosComerciales, "json");
        else
            Lungo.Service.post(App.serverInfo.urlList, params, pintaCentrosComerciales, "json");
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
        getCentrosComerciales: getCentrosComerciales,
        verTiendas: verTiendas,
        verOfertasCC: verOfertasCC
    };

})(Lungo);

App.carousel = {prev: null, next: null};

Lungo.ready(function() {
    Lungo.Element.loading("#map", 1);

    Lungo.Service.Settings.async = true;
    Lungo.Service.Settings.error = function(type, xhr){
        console.log("Hubo un error al acceder al servidor");
        console.log(type);
        console.log(xhr);
        if (DEVEL)
            $$('#main-article').html(xhr.response);

        Lungo.Notification.hide();
    };
    
    Lungo.Service.Settings.crossDomain = true;
    Lungo.Service.Settings.timeout = 10000;
    Lungo.Notification.show();
    navigator.geolocation.getCurrentPosition(App.getCurrentPositionSuccess, 
                                             App.getCurrentPositionError,
                                             App.geoposOptions
                                            );
});

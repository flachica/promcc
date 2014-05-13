var DEVEL = false;
var defaultLocation = {};
defaultLocation.lat = 40.43794472516468;
defaultLocation.lon = -3.6795366500000455;

Lungo.ready(function() {
    if (DEVEL) {
        $$('#menuTest').removeClass('hidden');
        $$('#buscaOfertas').removeClass('hidden');
    }

    Lungo.Element.loading("#map", 1);

    Lungo.Service.Settings.async = true;
    Lungo.Service.Settings.error = function(type, xhr){
        console.log("Hubo un error al acceder al servidor");
        console.log(type);
        console.log(xhr);
        if (DEVEL)
            $$('#main-article').html(xhr.response);

        Lungo.Notification.error(
            "Error",
            type,
            "cancel",
            7
        );
    };
    
    Lungo.Service.Settings.crossDomain = true;
    Lungo.Service.Settings.timeout = 10000;
    App.ccCercano();
    Lungo.dom('#main').on('load', function(event){
        $$('#verMenuCcCercanos').removeClass('hidden');
    });
});

var App = (function(lng, undefined) {
    map = {};
    currentPosition = {};
    segundosCuentaAtras = 0;
    cuentaAtrasID = {};

    geoposOptions = { timeout: 10000, enableHighAccuracy: true };
    
    //casa
    serverDev = {urlList: 'http://192.168.1.128/promccweb/index.php/api/list'};
    //crea    
    //serverDev = {urlList: 'http://10.13.16.94/promccweb/index.php/api/list'};
    serverProd = {urlList: 'http://app.hubservice.es/promoshop/promccweb/index.php/api/list'};
    
    serverInfo = DEVEL ? serverDev : serverProd;

    resultadoErrorPosicion = function(){
        $$('#main-article').html('');
        var result = [{"idoferta":"-1","idtienda":"-1","nombre":"No se encontró su posición","descripcion":"Busque en el botón superior o pulse aquí para volver a intentarlo","foto":"","numcanjeos":"","fechadesde":"","fechahasta":"","precio":"0.00","codigocanjeo":"","curLat":"","curLon":""}]
        RenderedView.renderTemplate('ofertas', result, '#main-article',true);
    };

    pintaCentrosComercialesSEL = function(items) {
        RenderedView.renderTemplate('selCentrosComerciales', items, '#selectCC', false);
    };

    pintaTiendasSEL = function(items) {
        Lungo.Notification.hide();
        RenderedView.renderTemplate('selTiendas', items, '#selectTD', true);
    };

    busca = function() {
        getOfertas($$('#txtBusqueda').val(), $$('#selectCC').val(), $$('#selectTD').val());
        Lungo.Router.section("oferta");
    };

    getOfertasCC = function(ccID, ccNombre) {
        getOfertas("", ccID, "", -1);
        Lungo.Notification.html('<h1>Bienvenido/a</h1>Usted está viendo las ofertas del Centro Comercial ' + ccNombre, "Cerrar");
    };

    getOfertasUltimaHora = function() {
        getOfertas("", "", "", 1);
        Lungo.Router.section("oferta");
    };

    getOfertasDosUltimasHoras = function() {
        getOfertas("", "", "", 2);
        Lungo.Router.section("oferta");
    };

    getOfertasTresUltimasHoras = function() {
        getOfertas("", "", "", 3);
        Lungo.Router.section("oferta");
    };


    getFormBusqueda = function() {
        $$('#selectCC').html('<option value="-1">[Cualquiera]</option>');
        $$('#selectCC').on("change", function(){
                                        Lungo.Notification.show();
                                        getTiendas(App.pintaTiendasSEL,this.value);
                                     }
                            );
        getCentrosComerciales(App.pintaCentrosComercialesSEL);
        Lungo.Router.section("busqueda");
    };

    getFormTest = function() {
        Lungo.Router.section("test");
    };    
    
    getCurrentPositionSuccess = function (position) {
        /*//flachica: Inicializo mapa
        App.initializeMap(position.coords.latitude, position.coords.longitude);
        App.currentPosition = new Object();
        App.currentPosition.lat = position.coords.latitude;
        App.currentPosition.lon = position.coords.longitude;

        App.map.addMarker({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          title: 'Mi ubicación',
          infoWindow: {
                  content: '<p>Mi ubicación</p>'
              }
        });*/

        App.currentPosition = new Object();
        App.currentPosition.lat = position.coords.latitude;
        App.currentPosition.lon = position.coords.longitude;
        App.getCentrosComerciales(App.pintaCentrosComerciales);
    };

    getCurrentPositionError = function (error) {
        App.geoposOptions.enableHighAccuracy = false;
        App.geoposOptions.timeout = 5000;
        navigator.geolocation.getCurrentPosition(App.getCurrentPositionSuccess, 
                                                 App.getCurrentPositionLowAccuracyError,
                                                 App.geoposOptions
                                            );
    };

    getCurrentPositionLowAccuracyError = function(error){
        App.currentPosition = {};
        App.currentPosition.lat = -1;
        App.currentPosition.lon = -1;
        Lungo.Notification.confirm({
            icon: 'map-marker',
            title: 'Busque en la barra lateral',
            description: 'No se ha podido ubicar su posición. Si lo desea puede encontrar sus ofertas en el botón superior. <br><br>Si el problema persiste pruebe ir a <b>Ajustes</b> y dar permisos para que las aplicaciones relacionadas con <b>Google</b> puedan acceder a su posición.',
            accept: {
                icon: 'checkmark',
                label: 'Aceptar',
                callback: App.resultadoErrorPosicion()
            },
            cancel: {
                icon: 'close',
                label: 'Cerrar',
                callback: App.resultadoErrorPosicion()
            }
        });
    };

    initializeMap = function (pLat, pLon) {
        App.map = new GMaps({
            el: '#map',
            lat: pLat,
            lng: pLon,
            zoomControl : true,
            zoomControlOpt: {
                style : 'LARGE',
                position: 'TOP_LEFT'
            },
            panControl : false,
            streetViewControl : false,
            mapTypeControl: false,
            overviewMapControl: false
        });
    };

    verTiendas = function(ccIDHandler) {
        ccID = ccIDHandler.substring(10);
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
        getTiendas(App.pintaTiendas, ccID);
    };

    getTiendas = function(callback, parCcID) {
        params = {model: 'Tienda', ccID: parCcID};
        if (DEVEL)        
            Lungo.Service.get(App.serverInfo.urlList, params, callback, "json");
        else
            Lungo.Service.post(App.serverInfo.urlList, params, callback, "json");
    };

    getOfertas = function(parTxtBusqueda, parCC, parTD, parHoras) {
        params = {model: 'Oferta', txtBusqueda: parTxtBusqueda, ccID: parCC, tdID: parTD, horas: parHoras};
        if (DEVEL)        
            Lungo.Service.get(App.serverInfo.urlList, params, pintaOfertas, "json");
        else
            Lungo.Service.post(App.serverInfo.urlList, params, pintaOfertas, "json"); 
    }

    pintaOfertas = function(result) {
        Lungo.Router.section("ofertas");
        RenderedView.renderProducts('ofertas', result, '#container');
    }

    verOfertasTD = function (tiendaIDHandler) {
        var tiendaID = tiendaIDHandler.substring(10);
        $$('#verMenuCcCercanos').addClass('hidden');
        Lungo.Notification.show();
        getOfertas('', -1, tiendaID);        
    }

    pintaTiendas = function(result) {
        for (var i = 0; i < result.length; i++) {
            App.map.addMarker({
              lat: result[i].latitud,
              lng: result[i].longitud,
              title: result[i].nombre,
              icon: './img/marcador_tienda.png',
              infoWindow: {
                  content: '<p>' + result[i].nombre + '</p>' + result[i].descripcion + '<br>' + 
                           '<nav class="on-left"><button id="btnOfertas' + result[i].idtienda + '" onclick="App.verOfertasTD(this.id)">Ofertas</button></nav>',
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
        /*  //flachica: logica para pintar el mapa con los puntos marcadores de centros comerciales
            for (var i = 0; i < result.length; i++) {
            App.map.addMarker({
              lat: result[i].latitud,
              lng: result[i].longitud,
              title: result[i].nombre,
              icon: './img/marcador_cc.png',
              infoWindow: {
                  content: '<p>' + result[i].nombre + '</p>' + result[i].descripcion + '<br>' + 
                           '<nav class="on-left"><button id="btnTiendas' + result[i].idcentrocomercial + '" onclick="App.getOfertasCC(this.id.substring(10))" >Ofertas</button></nav><nav class="on-right"></nav>',
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
        }*/
        App.getOfertasCC(result[0].idcentrocomercial, result[0].nombre);
    };

    getCentrosComerciales = function (callback) {
        params = {model: 'Centrocomercial', curLat: App.currentPosition.lat, curLon: App.currentPosition.lon};
        if (DEVEL)        
            Lungo.Service.get(App.serverInfo.urlList, params, callback, "json");
        else
            Lungo.Service.post(App.serverInfo.urlList, params, callback, "json");
    };

    verDetalleOferta = function(ofertaHandlerID) {
        var parOfertaID = ofertaHandlerID.substring(8);
        //Pincha en error de busqueda. La oferta con un ID -1 indica que ha habido un error.       
        if (parOfertaID == "-1") {
            App.ccCercano();
        } else {
            params = {model: 'Oferta', ofertaID: parOfertaID};
            if (DEVEL)        
                Lungo.Service.get(App.serverInfo.urlList, params, pintaDetalleOferta, "json");
            else
                Lungo.Service.post(App.serverInfo.urlList, params, pintaDetalleOferta, "json");
        }
    }

    ccCercano = function () {
        Lungo.Router.section('main');
        Lungo.Notification.show();
        navigator.geolocation.getCurrentPosition(App.getCurrentPositionSuccess, 
                                                 App.getCurrentPositionError,
                                                 App.geoposOptions
                                                 );
    }

    twoDigits = function (value) {
       if(value < 10) {
        return '0' + value;
       }
       return value;
    };

    cuentaAtras = function () {
        $$('#txtCuentaAtras').html(toDDHHMMSS(App.segundosCuentaAtras));         
        App.segundosCuentaAtras -=1;
         
        if (App.segundosCuentaAtras <= 0) {
            $$('#txtCuentaAtras').html(App.segundosCuentaAtras);  
            clearInterval(App.cuentaAtrasID);
        }
     };

    pintaDetalleOferta = function(result) {
        Lungo.Router.section("detalleoferta");
        App.segundosCuentaAtras = result[0].segundosRestantes;
        App.cuentaAtras();
        App.cuentaAtrasID = setInterval(cuentaAtras,1000);
        RenderedView.renderTemplate('detalleOferta', result, '#detalleOferta', true);
    };

    canjearOferta = function (ofertaHandlerID) {
        var parOfertaID = ofertaHandlerID.substring(16);
        var method = "GET";
        if (!DEVEL)
            method = "POST";

        $$('#pieCanjeo').html(
                                '<div class="form" align="center">' +
                                        '<label>Email</label>' +
                                        '<input id="email" type="email" placeholder="Indique su email" class="border" />' +
                                        '<input id="ofertaID" type="hidden" value="' + parOfertaID + '" />' +
                                        '<button onClick="App.dameCodigoBarrasCanjeo()" class="anchor margin-bottom" data-label="Normal" type="submit">Enviar</button>' +
                                  '</div>'
                              );
    };

    toDDHHMMSS = function (seconds) {
        var sec_num = parseInt(seconds, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        var days = 0;
        if (hours>23){
            days = Math.floor(hours / 24);
            hours = hours - (days * 24);
        }

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var time    = hours+':'+minutes+':'+seconds;
        if (days > 0)
            time = days + " días " + time;
        return time;
    }

    dameCodigoBarrasCanjeo = function() {
        if(!validateEmail($$('#email').val())) {
            alert('Indique un correo válido');
            return;
        }
        var url = App.serverInfo.urlList.substring(0,App.serverInfo.urlList.length-4) + "canjear";
        params = {ofertaID: $$('#ofertaID').val(), email: $$('#email').val()};
        if (DEVEL)        
            Lungo.Service.get(url, params, App.pintaCodBar, "json");
        else
            Lungo.Service.post(url, params, App.pintaCodBar, "json");
    };

    pintaCodBar = function (result) {
        if (result.status == "KO"){
            alert(result.message);
        } else
            $$('#pieCanjeo').html("<div align='center'><img src='" + App.serverInfo.urlList.substring(0,App.serverInfo.urlList.length-19) + "/images/" + result.filename + "'></img><strong>" + result.barcode + "</strong></div>");
    };

    validateEmail = function (email) { 
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    return {
        getCurrentPositionSuccess: getCurrentPositionSuccess,
        getCurrentPositionError: getCurrentPositionError,
        pintaCentrosComerciales: pintaCentrosComerciales,
        geoposOptions: geoposOptions,
        initializeMap: initializeMap,
        serverInfo: serverInfo,
        getCentrosComerciales: getCentrosComerciales,
        verTiendas: verTiendas,
        verOfertasCC: verOfertasCC,
        verOfertasTD: verOfertasTD,
        getOfertas: getOfertas,
        verDetalleOferta: verDetalleOferta,
        getCurrentPositionLowAccuracyError: getCurrentPositionLowAccuracyError,
        getFormBusqueda: getFormBusqueda,
        busca: busca,
        getOfertasCC: getOfertasCC,
        pintaCentrosComercialesSEL: pintaCentrosComercialesSEL,
        pintaTiendas: pintaTiendas, 
        pintaTiendasSEL: pintaTiendasSEL, 
        resultadoErrorPosicion: resultadoErrorPosicion,
        ccCercano: ccCercano,
        cuentaAtras: cuentaAtras,
        pintaDetalleOferta: pintaDetalleOferta,
        canjearOferta: canjearOferta,
        dameCodigoBarrasCanjeo: dameCodigoBarrasCanjeo,
        pintaCodBar: pintaCodBar,
        getFormTest: getFormTest,
        getOfertasUltimaHora: getOfertasUltimaHora,
        getOfertasDosUltimasHoras: getOfertasDosUltimasHoras,
        getOfertasTresUltimasHoras: getOfertasTresUltimasHoras,
    };

})(Lungo);

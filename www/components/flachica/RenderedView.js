var RenderedView = {
		ofertas: 	    '<ul>' + 
                            '{{#ofertas}}' +
                                '<li id="liOferta{{idoferta}}" onClick="App.verDetalleOferta(this.id)" class="accept">' +
                                    '<button class="on-right" data-icon="menu"><abbr>{{precio}} &#x20ac;</abbr></button>' +
						            '<strong>{{nombre}}</strong>' +
                                    '<small>{{descripcion}}</small>' +
						        '</li>' +
                            '{{/ofertas}}' +
                        '</ul>',
        selCentrosComerciales: '{{#selCentrosComerciales}}' +
                                    '<option value="{{idcentrocomercial}}">{{nombre}}</option>' +
                                '{{/selCentrosComerciales}}',
		selTiendas:  '<option value="-1">[Cualquiera]</option>' +
                     '{{#selTiendas}}' +
                                    '<option value="{{idtienda}}">{{nombre}}</option>' +
                     '{{/selTiendas}}',
        detalleOferta: '{{#detalleOferta}}' +
                        '<ul>' +
                            '<li>' +
                                '<div class="layout horizontal">' +
                                    '<div align="center" data-layout="primary">' +
                                        '<img src="./img/icon-57.png"/>' +
                                    '</div>' +
                                    '<div vertical-align="middle" align="center" data-layout="primary">' +
                                        '<button class="cancel"><abbr>{{precio}} &#x20ac;</abbr></button>' +
                                    '</div>' +
                                '</div>' +
                            '</li>' +
                            '<li class="theme">' +
                                '<p align="center">{{nombre}}</p>' +
                            '</li>' +
                            '<li>' +
                                '<p align="justify">{{descripcion}}</p>' +
                            '</li>' +
                            '<li>' +
                                '<div align="center">' +
                                    '<strong id="txtCuentaAtras">12:00:00</strong>' +
                                '</div>' +
                            '</li>' +
                            '<li >' +
                                '<div align="center">' +
                                    '<button id="btnCanjearOferta{{idoferta}}" onClick="App.canjearOferta(this.id)" class="cancel"><abbr>Canjear</abbr></button>' +
                                '</div>' +
                            '</li>' +
                        '</ul>' +
                        '{{/detalleOferta}}',
		renderTemplate: function(template, items, sectionSelector, override) {
			var dataTemplate = [];
			dataTemplate[template] = items;
			var section = Mustache.render(this[template], dataTemplate);
            if (override)
    			$$(sectionSelector).html(section);
            else
    			$$(sectionSelector).append(section);
		}
}

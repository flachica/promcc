var RenderedView = {
		ofertas: 	    '<ul>' + 
                            '{{#ofertas}}' +
                                '<li id="liOferta{{idoferta}}" onClick="App.canjeaOferta(this.id)" class="accept">' +
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

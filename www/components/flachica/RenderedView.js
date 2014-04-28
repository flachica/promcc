var RenderedView = {
		ofertas: 	    /*'<ul>' + 
                            '{{#ofertas}}' +
                                '<li id="liOferta{{idoferta}}" onClick="App.verDetalleOferta(this.id)" class="accept">' +
                                    '<button class="on-right" data-icon="menu"><abbr>{{precio}} &#x20ac;</abbr></button>' +
						            '<strong>{{nombre}}</strong>' +
                                    '<small>{{descripcion}}</small>' +
						        '</li>' +
                            '{{/ofertas}}' +
                        '</ul>',*/
                        '<li class="thumb big">' +
						'{{#ofertas}}' +
						'	<div id="liOferta{{idoferta}}" onClick="App.verDetalleOferta(this.id)" style="width: 50%">' +
						'{{#foto}}' +
						'		<div class="centered">'+
						'			<img  alt="{{nombre}}" style="max-width: 100%" id="{{idoferta}}" src="{{foto}}">'+
						'			<div>' +
						'				<span class="on-right tag count">{{precio}} €</span>' +
						'				<strong>{{nombre}}</strong>' +
						'				<small>{{nombretienda}}</small>' +
						'				{{#preciobase}}' +
						'				<span class="on-right tachado">{{preciobase}} €</span>' +
						'				{{/preciobase}}' +
						'				<small>{{descripcion}}</small>' +
						'			</div>' +
						'		</div>' +
						'{{/foto}}' +
				
						'{{^foto}}' +
						'{{/foto}}' +
				
						'	</div>' +
				
						'{{/ofertas}}' +
						'</li>',
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
                                        '<img style="width: 50%" src="{{foto}}" />' +
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
                                    '<strong>Caduca en: </strong><strong id="txtCuentaAtras">Calculando . . .</strong>' +
                                '</div>' +
                            '</li>' +
                            '<li id="pieCanjeo">' +
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
		},
        renderProducts: function(template, data, sectionSelector, callback, error) {
        	//flachica Hacer para que sea 2 o 4 columnas depediendo de si se ejecuta en móvil 
			$$(sectionSelector).html('');
			var itemsForRow = 2;
			var rowsCount = Math.floor(data.length/itemsForRow);
			for (var i=0;i<rowsCount;i++){
				var items = [];
				for(var j=0;j<itemsForRow;j++){
					var itemToShow  = (i*itemsForRow) + j;
                    if (data[itemToShow].foto == '' || data[itemToShow].foto == null)
                        data[itemToShow].foto = 'static/images/empty.png';
					items.push(data[itemToShow]);
				}
				this.renderTemplate(template, items, sectionSelector);
			}
			var items = [];
			if (data.length%itemsForRow>0) {
				var restOfItemsWithData = data.length%itemsForRow;
				var restOfItems = itemsForRow - restOfItemsWithData;
				for (var i=0;i<restOfItemsWithData;i++){
					var itemToShow  = data.length - restOfItemsWithData + i;
                    if (data[itemToShow].foto == '' || data[itemToShow].foto == null)
                        data[itemToShow].foto = 'static/images/empty.png';                    
					items.push(data[itemToShow]);
				}
				for (var i=0;i<restOfItems;i++){
					items.push({'vacio': 'vacio'});
				}
				this.renderTemplate(template, items, sectionSelector);
			}
            if (callback)
    			callback();
			return;
        }
}

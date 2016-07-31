$(function() {
	function checkstyle(style){
		var string = style.toLowerCase();
		var styles = ['vneck', 'crew'];
		
		$.each(styles, function(key, val){
			if(string.search(val) != -1){
				string = val;
				return false; // exit each loop upon match
			}
		});
		
		return string;
	}
	
	function checkcolor(style){
		var string = style.toLowerCase();
		var colors = ['black', 'gray', 'white'];
		
		$.each(colors, function(key, val){
			if(string.search(val) != -1){
				string = val;
				return false; // exit each loop upon match
			}
		});
		
		return string;
	}

	// build out table
	function loadtable(tableName){
		$.getJSON('data/' + tableName + '-data.json', function(data){
			var counter = 0;
			var oddEven = 'even';
			
			$('#items-list').empty();
			
			$.each(data, function(key, val){
				
				oddEven = counter % 2 === 0 ? 'even' : 'odd'; //determine if row is odd or even for coloring
				
				$('#items-list').append('<div class="item-row ' + oddEven + '"><span class="table-style"><a href="#">' + val.style +'</a></span><span class="table-description">' + val.description + '</span><span class="table-size">' + val.size + '</span><span class="table-price">$' + val.price + '</span><span class="table-available">' + val.quantity + '</span><div class="clear"></div></div>');
				
				counter++;
			});
		});
	}
	
	// combine dataset for easier parsing
	function combine(tableName, style, combined){
		$.getJSON('data/' + tableName + '-data.json', function(data){
			var styleCombined = {};
			var size = {};
			
			$.each(data, function(key, val){
				
				// build object for current style only
				if(val.style === style){
					// associate size with respective price and quantity
					size[val.size] = {
						'price' : val.price,
						'quantity' : val.quantity
					};
					// associate styles with size object
					styleCombined[val.style] = {
						'size' : size
					};
				}
			});
			combined(styleCombined);
		});
	}
	// IE NOPE: function loaditem(selectedSection = 'tops', selectedStyle = 0, selectedSize = 0)
	function loaditem(selectedSection, selectedStyle, selectedSize){
		$.getJSON('data/' + selectedSection + '-data.json', function(data){
			// default to first data item if no style is specified or found in dataset
			var item = data[0];
			var style = item.style;
			var quantity = 0;

			if(selectedStyle != 'init'){
				// clear dynamic sections
				$('#product-name').empty();
				$('#product-price').empty();
				$('#product-center').empty();
				$('#items-list').empty();
				$('#size').empty();
				$('#quantity').empty();
				
				// search for item with specified style and size
				var counter = 0;
				$.each(data, function(key, val){
					if(val.style == selectedStyle && val.size == selectedSize){
						item = data[counter];
						style = item.style;
						quantity = item.quantity;
						
						return false;
					}
					counter++;
				});
			}
			
			// populate product name
			$('#product-name').append(style);
			
			// populate product price
			$('#product-price').append('$' + item.price);
			
			// populate product image
			if(selectedSection === 'tops'){
				var imageName = checkstyle(style) + "-" + checkcolor(style); // determine corresponding image name
				$('#product-center').append('<img src="images/' + imageName + '.jpg">');
			}
			else if(selectedSection === 'bottoms'){
				$('#product-center').append('<img src="images/mens-jeans.jpg">');
			}
			else{
				$('#product-center').append('<img src="images/vans-checkered.jpg">');
			}
			
			// Update Size and Quantity options
			combine(selectedSection, style, function(styleCombined){
				loadtable(selectedSection);
				// populate size options
				var sizeOptions = '<option value="select">Select</option>';
				$.each(styleCombined[style]['size'], function(key, val){
					sizeOptions += '<option value="' + key + '">' + key + '</option>';
				});
				$('#size').append(sizeOptions);
				
				// options
				var quantityOptions = '<option value="select">Select</option>';
				for(i = 1; i < quantity + 1; i++){
					quantityOptions += '<option value="' + i + '">' + i + '</option>';
				}
				$('#quantity').append(quantityOptions);
				
				// set size if selected from "More Items" table
				if(selectedSize != 'init'){
					$('#size').val(selectedSize);
				}
			});
			// hidden form field - sloppy but quick
			if($('.dataset')){
				$('.dataset').remove();
			}
			$('form').append('<input class="dataset" style="display:none;" value="' + selectedSection + '">');
		});
	}
	
	// clickable tabs
	$('#categories li').click(function(){
		$('#categories li').removeClass('active');
		$(this).addClass('active');
		loadtable($(this).attr('id'));
	});
	
	// clickable table items
	$('#items-list').on('click', '.table-style a', function(e){
		e.preventDefault();
		var selectedSection = $('#categories .active').attr('id');
		var selectedStyle = $(this).html();
		var selectedSize = $(this).parent().siblings('.table-size').html();
		
		loaditem(selectedSection, selectedStyle, selectedSize);
	});
	
	// update quantity based on selected size
	$('#size').change(function(){
		if($(this).val() !== 'select'){ // only update if actual size is selected
			var dataset = $('.dataset').val();
			var style = $('#product-name').html();
			var itemSize = $(this).val();
			combine(dataset, style, function(styleCombined){
				
				var quantity = styleCombined[style]['size'][itemSize]['quantity'];
				var price = styleCombined[style]['size'][itemSize]['price'];

				// options *duplicate code: fix if time allows*
				var quantityOptions = '<option value="select">Select</option>';
				for(i = 1; i < quantity + 1; i++){
					quantityOptions += '<option value="' + i + '">' + i + '</option>';
				}
				$('#quantity').empty().append(quantityOptions);
				
				// price
				$('#product-price').empty().append('$' + price);
				
			});
		}
	});
	
	// add to cart
	$('form').submit(function(e){
		e.preventDefault();
		var size = $('#size').val();
		var quantity = $('#quantity').val();
		
		// add overlay with message
		if(size == 'select'){ // no size selected
			$('body').append('<div class="overlay"><p class="error">Error! Please indicate size.</p></div>');
		}
		else if(quantity == 'default' || quantity == 'select'){ // no quantity selected
			$('body').append('<div class="overlay"><p class="error">Error! Please indicate quantity.</p></div>');
		}
		else{
			var name = $('#product-name').html(); // size and quantity selected
			$('body').append('<div class="overlay"><p class="success">Successfully added ' + name + ' - ' + size + ' - Qty: ' + quantity + ' to cart</p></div>');
		}
		// clear overlay
		$('.overlay').click(function(){
			$(this).remove();
		});
	});
	
	// add item count to tabs
	function tabcount(dataName){
		$.getJSON('data/' + dataName + '-data.json', function(data){
			var counter = 0;
			
			$.each(data, function(){
				counter++;
			});
			
			$('#' + dataName + ' .total').append('(' + counter + ')');
		});
	}
	
	// boot it up
	function init(){
		tabcount('tops');
		tabcount('bottoms');
		tabcount('shoes');
		loadtable('tops');
		loaditem('tops', 'init', 'init');
	}
	
	init();
});
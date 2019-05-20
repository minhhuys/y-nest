var Menu = {
	from : 0,
	size : 9,
	data : [],
	dataCategory : [],
	dataItem : [],
	tokenId : '',
	categoryId : '',
	arrIndex : [],

	initMenu : function(){
		var searchParams = {
			index : 'categories',
			type : 'category',
			from : 0,
			size : 100,
			body: {
				query: {
					bool: {
						"must" : [
						{
							query_string: {
								default_field : "merchantId",
								query: Configuration.ynestMerchantId
							}
						},
						{
							"match" : { "type" : 3}
						}
						]
					}
				}
			}
		};
		client.search(searchParams, function(error, data){
			var Ids = '';
			jQuery.each(data.hits.hits, function(index, value){
				Menu.dataCategory.push(value._source);
				Menu.arrIndex.push(index);
				var searchItems = {
					index : 'dishs',
					type : 'dish',
					from : 0,
					size : 100,
					body: {
						query: {
							bool: {
								"must" : [
								{
									"match" : {"categories.id" : value._source.id}
								}
								]
							}
						}
					}
				};
				client.search(searchItems, function(err, dataItem){
					var yn_product = [];
					$.each(dataItem.hits.hits, function(i, val){
						yn_product.push(val._source);
					})
					if( yn_product.length > 0){
						var yn_category = yn_product[0].categories.find(e => e.id == value._source.id);
						if(yn_category != undefined){

							$('#ys_tabMenu').append(Menu.buildCate(index, yn_category, Menu.arrIndex));
							$('#sc_tabs_730').append(Menu.buildProdParent(index, yn_category));
						}
					}
					$.each(yn_product, function(i, vl){
						$('#ys_listMenu_'+value._source.id).append(Menu.buildProd(vl));
						$('.modalDetail').append(Menu.buildModal(vl));
					})

					$('.tabMenu li').click(function(){
						var id = $(this).attr('data-target');

						$('.tabMenu li').removeClass('active');
						$('.sc_tabs_content').removeClass('active');

						$(this).addClass('active');
						$('#sc_tab_'+id).addClass('active');
					});
				})
			});
			var urlString = window.location.href;
			var getUrl = new URL(urlString);
			var getID = getUrl.searchParams.get('categoryId');
			var tokenId = jQuery.cookie('tokenId');
			if(getID != undefined){
				jQuery.cookie('categoryId', "getID", {path : '/'});
				jQuery.cookie('tokenId', tokenId, {path : '/'});
			}
		})
	},

	getRandom : function(arr, n) {
		var result = new Array(n),
		len = arr.length,
		taken = new Array(len);
		if (n > len)
			throw new RangeError("getRandom: more elements taken than available");
		while (n--) {
			var x = Math.floor(Math.random() * len);
			result[n] = arr[x in taken ? taken[x] : x];
			taken[x] = --len in taken ? taken[len] : len;
		}
		return result;
	},

	initOrder : function(){
		var urlString = window.location.href;
		var url = new URL(urlString);
		var getID = url.searchParams.get('id');
		var relatedItems = [];

		var searchParams = {
			index : 'categories',
			type : 'category',
			from : 0,
			size : 1000,
			body: {
				query: {
					bool: {
						"must" : [
						{
							query_string: {
								default_field : "merchantId",
								query: Configuration.ynestMerchantId
							}
						},
						{
							"match" : { "type" : 3}
						}
						]
					}
				}
			}
		};
		client.search(searchParams, function(error, data){
			var dataCateGo = [];
			var build = '';
			jQuery.each(data.hits.hits, function(index, value){
				dataCateGo.push(value._source);
			});
			var randomCate = Menu.getRandom(dataCateGo, 5);
			// console.log(randomCate);
			jQuery.each(randomCate, function(index, value){
				// console.log(value);
				build+='<li class="cat-item">';
				build+='<a href="menu.html">'+value.name+'</a>';
				build+='</li>';
				jQuery('#product-categories').html(build);
			})


			var searchItems = {
				index : "dishs",
				type : 'dish',
				from : 0,
				size : 10,
				body: {
					query: {
						bool: {
							"must" : [
							{
								"match_phrase" : { "id" : getID}
							}
							]
						}
					}
				}
			};
			client.search(searchItems, function(err, dataItems){
				var idCate = '';
				jQuery.each(dataItems.hits.hits, function(i, vl){
					jQuery.each(vl._source.categories, function(i, val){
						jQuery('#order-detail').append(Menu.buildOrder(vl._source, val.name));
						idCate += val.id + ' ';
						jQuery("#ynest-"+vl._source.id+ " button.single_add_to_cart_button").click(function(){
							ShoppingCart.pushToCart(vl._source, jQuery('#qty-prod').val());
						})
					})
					jQuery('#title-order-page').append(Menu.buildTitleOrderPage(vl._source));
					
				});
				client.search({
					index : "dishs",
					type : 'dish',
					from : 0,
					size : 10,
					body: {
						query: {
							bool: {
								"must" : [
								{
									"match" : { "categories.id" : idCate}
								}
								]
							}
						}
					}
				}, function(error, data){
					var items = [];
					jQuery.each(data.hits.hits, function(index, vlue){
						items.push(vlue._source);
					})
					var getRandomItems = Menu.getRandom(items, 3);
					jQuery.each(getRandomItems, function(i, v){
						jQuery('ul.products').append(Menu.buildRelated(v));
						jQuery('.add_to_cart_button_related_'+v.id).click(function(){
							ShoppingCart.pushToCart(v,1);
							// console.log("123333");
							// ShoppingCart.pushToCart(v.id, 1);
						})
					})
				})
			})
		})
	},


	buildCate(i, data, arr){

		var build = '';
		build+= '<li class="sc_tabs_title ' + ((i == 0) ? 'active' : ' ') + '" data-target="'+data.id+'">';
		build+= 	'<a href="javascript:;" class="theme_button" id="sc_tab_'+data.id+'_tab">'+data.name+'</a>';
		build+= '</li>';
		return build;
	},

	buildProdParent(i, data){
		var build = '';
		build+='<div id="sc_tab_'+data.id+'" class="sc_tabs_content ' + ( (i == 0) ? 'active' : ' ') + '">';
		build+='	<div id="sc_menuitems_347_wrap" class="sc_menuitems_wrap">';
		build+='		<div id="sc_menuitems_347" class="sc_menuitems sc_menuitems_style_menuitems-1 sc_slider_nopagination sc_slider_nocontrols margin_top_medium" data-interval="7492" data-slides-per-view="2">';
		build+='			<div class="sc_columns columns_wrap" id="ys_listMenu_'+data.id+'">';
		// build+='				<span>'+data.id+'</span>';
		build+='			</div>';
		build+='		</div>';
		build+='	</div>';
		build+='</div>';
		return build;
	},

	buildProd(data){
		// console.log(data);
		var build = '';
		var imageUrl = '';
		$.each(data.images, function (index, value) {
			imageUrl = Configuration.imageRoot + value.path
		});
		build+='<div class="column-1_2 column_padding_bottom">';
		build+='	<div id="sc_menuitems_347_'+data.id+'" class="sc_menuitems_item sc_menuitems_item_'+data.id+'" data-url="menu-item-1.html">';
		build+='		<div class="sc_menuitem_image">';
		build+='			<a class="show_popup_menuitem" href="#" data-target="#p_'+data.id+'" data-toggle="modal">';
		build+='				<img width="90" height="90" alt="" src="'+imageUrl+'">';
		build+='			</a>';
		build+='		</div>';
		build+='		<div class="sc_menuitem_price">'+data.price.formatMoney(0, 3)+'đ</div>';
		build+='		<div class="sc_menuitem_title">';
		build+='			<a class="show_popup_menuitem" href="#" data-target="#p_'+data.id+'" data-toggle="modal">'+data.name+'</a>';
		build+='		</div>';
		build+='		<div class="sc_menuitem_description">'+data.subDescription+'</div>';
		build+='	</div>';
		build+='</div>';
		
		return build;
	},

	buildModal(data){
		var build = '';
		var imageUrl = '';
		var cropSize = '?mode=Crop&width=770&height=280';
		$.each(data.images, function (index, value) {
			imageUrl = Configuration.imageRoot + value.path
		});
		build+='<div class="modal fade" id="p_'+data.id+'" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">';
		build+='  <div class="modal-dialog modal-lg modal-dialog-centered" role="document">';
		build+='    <div class="modal-content">';
		build+='		<div class="modal-header">';
		build+='        <button type="button" class="close" data-dismiss="modal" aria-label="Close">';
		build+='          <span aria-hidden="true">&times;</span>';
		build+='        </button>';
		build+='      </div>';
		build+='      <div class="modal-body">';
		build+='<div class="popup-menuitem">';
		build+='    <div class="sc_menuitems_wrap">';
		build+='        <div class="sc_menuitems sc_menuitems_style_menuitems-2">';
		build+='            <div class="sc_menuitems_item">';
		build+='                <div class="sc_menuitem_image">';
		build+='                    <img class="wp-post-image" width="1920" height="698" alt="" src="'+imageUrl+cropSize+'">';
		build+='                    <div class="sc_menuitem_spicy menuitem_spicylevel_5 ">'+data.name+'</div>';
		build+='                </div>';
		build+='                <div class="sc_menuitem_box_title">';
		build+='                    <div class="sc_menuitem_title"><strong>'+data.name+'</strong></div>';
		build+='                    <div class="sc_menuitem_price">'+data.price.formatMoney(0,3)+'đ</div>';
		build+='                    <div class="cL"></div>';
		build+='                </div>';
		build+='                <div class="sc_menuitem_content">';
		build+='                    <div class="sc_menuitem_content_title">';
		build+='                        <span class="icon-restaurant3"></span>Mô tả sản phẩm';
		build+='                    </div>';
		build+='                   <span>'+data.subDescription+'</span>';
		build+='                </div>';
		// build+='                <div class="sc_menuitem_nutritions">';
		// build+='                    <div class="sc_menuitem_nutritions_title">';
		// build+='                        <span class="icon-cereal18"></span>Nutritions';
		// build+='                    </div>';
		// build+='                    <ul class="sc_menuitem_nutritions_list">';
		// build+='                        <li>Calories: <span>250 KCALKcal</span></li>';
		// build+='                        <li>Cholesterol: <span>50MGmg</span></li>';
		// build+='                        <li>Fiber: <span>2.0Gg</span></li>';
		// build+='                        <li>Sodium: <span>175MGmg</span></li>';
		// build+='                        <li>Carbohydrates: <span>4.5Gg</span></li>';
		// build+='                        <li>Fat: <span>3.0Gg</span></li>';
		// build+='                        <li>Protein: <span>1.7Gg</span></li>';
		// build+='                    </ul>';
		// build+='                    <div class="cL"></div>';
		// build+='                </div>';
		build+='                <div class="sc_menuitem_more">';
		build+='                    <a class="sc_button sc_button_square sc_button_size_small margin_right_small" href="order.html?id='+data.id+'">ĐẶT NGAY</a>';
		build+='                    <div class="cL"></div>';
		build+='                </div>';
		build+='';
		build+='                <div class="clearfix"></div>';
		build+='            </div>';
		build+='        </div>';
		build+='    </div>';
		build+='</div>';
		build+='      </div>';
		build+='    </div>';
		build+='  </div>';
		build+='</div>';
		return build;
	},

	buildOrder(data, category){
		// console.log(data);
		var build = '';
		jQuery.each(data.images, function (index, value) {
			if(value.isFeatured == true){	
				imageUrl = Configuration.imageRoot + value.path
				return false;
			}
		});
		build+='<div id="ynest-'+data.id+'" class="post-'+data.id+' product has-post-thumbnail first sale">';
		build+='	<span class="onsale">Sale!</span>';
		build+='	<div class="images">';
		build+='		<a href="'+imageUrl+'" class="woocommerce-main-image zoom" title="" data-rel="prettyPhoto[product-gallery]">';
		build+='			<img src="'+imageUrl+'" class="attachment-shop_single size-shop_single" alt="'+data.name+'" title="'+data.name+'" />';
		build+='		</a>';
		// build+='		<div class="thumbnails columns-4">';
		// build+='			<a href="images/2000x2000.png" class="zoom first" title="" data-rel="prettyPhoto[product-gallery]">';
		// build+='				<img src="images/2000x2000.png" class="attachment-shop_thumbnail size-shop_thumbnail" alt="croissant" title="croissant" /></a>';
		// build+='			<a href="images/2000x2000.png" class="zoom" title="" data-rel="prettyPhoto[product-gallery]">';
		// build+='				<img src="images/2000x2000.png" class="attachment-shop_thumbnail size-shop_thumbnail" alt="panini" title="panini" />';
		// build+='			</a>';
		// build+='		</div>';
		build+='	</div>';
		build+='	<div class="summary entry-summary">';
		build+='		<h1 class="product_title entry-title">'+data.name+'</h1>';
		build+='		<div>';
		build+='			<p class="price">';
		build+='				<del>';
		var tempPrice = Common.buildPrice(data.discounts, data.price);
		build+='					<span class="woocommerce-Price-amount amount">';
		if( tempPrice.oldPrice != null && tempPrice.oldPrice > 0){
			build+='						<span class="woocommerce-Price-currencySymbol"></span>'+tempPrice.oldPrice.formatMoney(0,3)+'';
			build+='					đ</span>';
		}
		build+='				</del>';
		build+='				<ins>';
		build+='					<span class="woocommerce-Price-amount amount">';
		build+='						<span class="woocommerce-Price-currencySymbol"></span>'+data.price.formatMoney(0,3)+'';
		build+='					đ</span>';
		build+='				</ins>';
		build+='			</p>';
		build+='		</div>';
		build+='		<div>';
		build+='			<p>'+data.subDescription+'</p>';
		build+='		</div>';
		// build+='		<form class="cart">';
		build+='<div style="display: flex">';
		build+='			<div class="quantity">';
		build+='				<input id="qty-prod" style="text-align: center; margin: 15px;" type="number" step="1" min="1" max="" name="quantity" value="1" title="Qty" class="input-text qty text" size="4" pattern="[0-9]*" inputmode="numeric" />';
		build+='			</div>';
		build+='			<input type="hidden" name="add-to-cart" value="'+data.id+'" />';
		build+='			<button class="single_add_to_cart_button button alt">Thêm vào giỏ hàng</button>';
		// build+='		</form>';
		build+='</div>';
		build+='		<div class="product_meta">';
		build+='			<span class="posted_in">Phân loại:';
		build+='				<a href="menu.html" rel="tag">'+category+'</a>';
		build+='			</span>';
		build+='		</div>';
		build+='	</div>';
		build+='	<div class="woocommerce-tabs wc-tabs-wrapper">';
		build+='		<ul class="tabs wc-tabs">';
		build+='			<li class="description_tab active">';
		build+='				<a href="#tab-description">Mô tả</a>';
		build+='			</li>';
		// build+='			<li class="reviews_tab">';
		// build+='				<a href="#tab-reviews">Đánh giá (0)</a>';
		// build+='			</li>';
		build+='		</ul>';
		build+='		<div class="woocommerce-Tabs-panel woocommerce-Tabs-panel--description panel entry-content wc-tab" id="tab-description" style="display: block">';
		build+='			<h2>Mô tả sản phẩm : '+data.name+'</h2>';
		build+='			<p>'+data.description+'</p>';
		build+='		</div>';
		build+='		<div class="woocommerce-Tabs-panel woocommerce-Tabs-panel--reviews panel entry-content wc-tab" id="tab-reviews">';
		// build+='			<div id="reviews" class="woocommerce-Reviews">';
		// build+='				<div id="comments">';
		// build+='					<h2 class="woocommerce-Reviews-title">Reviews</h2>';
		// build+='					<p class="woocommerce-noreviews">There are no reviews yet.</p>';
		// build+='				</div>';
		// build+='				<div id="review_form_wrapper">';
		// build+='					<div id="review_form">';
		// build+='						<div id="respond" class="comment-respond">';
		// build+='							<h3 id="reply-title" class="comment-reply-title">Be the first to review &ldquo;Americano&rdquo;';
		// build+='								<small>';
		// build+='									<a rel="nofollow" id="cancel-comment-reply-link" href="#respond">Cancel reply</a>';
		// build+='								</small>';
		// build+='							</h3>';
		// build+='							<form action="#" method="post" id="commentform" class="comment-form">';
		// build+='								<p class="comment-notes">';
		// build+='									<span id="email-notes">Your email address will not be published.</span> Required fields are marked';
		// build+='									<span class="required">*</span>';
		// build+='								</p>';
		// build+='								<p class="comment-form-rating">';
		// build+='									<label for="rating">Your Rating</label>';
		// build+='									<select name="rating" id="rating" aria-required="true" required>';
		// build+='										<option value="">Rate&hellip;</option>';
		// build+='										<option value="5">Perfect</option>';
		// build+='										<option value="4">Good</option>';
		// build+='										<option value="3">Average</option>';
		// build+='										<option value="2">Not that bad</option>';
		// build+='										<option value="1">Very Poor</option>';
		// build+='									</select>';
		// build+='								</p>';
		// build+='								<p class="comment-form-comment">';
		// build+='									<label for="comment">Your Review';
		// build+='										<span class="required">*</span>';
		// build+='									</label>';
		// build+='									<textarea id="comment" name="comment" cols="45" rows="8" aria-required="true" required></textarea>';
		// build+='								</p>';
		// build+='								<p class="comment-form-author">';
		// build+='									<label for="author">Name';
		// build+='										<span class="required">*</span>';
		// build+='									</label>';
		// build+='									<input id="author" name="author" type="text" value="" size="30" aria-required="true" required />';
		// build+='								</p>';
		// build+='								<p class="comment-form-email">';
		// build+='									<label for="email">Email';
		// build+='										<span class="required">*</span>';
		// build+='									</label>';
		// build+='									<input id="email" name="email" type="email" value="" size="30" aria-required="true" required />';
		// build+='								</p>';
		// build+='								<p class="form-submit">';
		// build+='									<input name="submit" type="submit" id="submit" class="submit" value="Submit" />';
		// build+='									<input type="hidden" name="comment_post_ID" value="140" id="comment_post_ID" />';
		// build+='									<input type="hidden" name="comment_parent" id="comment_parent" value="0" />';
		// build+='								</p>';
		// build+='							</form>';
		// build+='						</div>';
		// build+='					</div>';
		// build+='				</div>';
		// build+='				<div class="clear"></div>';
		// build+='			</div>';
		build+='		</div>';
		build+='	</div>';
		build+='</div>';
		return build;
	},

	buildRelated(data){
		var build = '';
		jQuery.each(data.images, function (index, value) {
			if(value.isFeatured == true){	
				imageUrl = Configuration.imageRoot + value.path
				return false;
			}
		});
		build+='<li class="product has-post-thumbnail column-1_3 first">';
		build+='	<a href="single-product.html" class="woocommerce-LoopProduct-link"> </a>';
		build+='	<div class="post_item_wrap">';
		build+='		<div class="post_featured">';
		build+='			<div class="post_thumb">';
		build+='				<a class="hover_icon hover_icon_link" href="order.html?id='+data.id+'">';
		build+='					<img src="'+imageUrl+'" class="attachment-shop_catalog size-shop_catalog" alt="'+data.name+'" title="'+data.name+'" />';
		build+='				</a>';
		build+='			</div>';
		build+='		</div>';
		build+='		<div class="post_content">';
		build+='			<h3>';
		build+='				<a href="order.html?id='+data.id+'">'+data.name+'</a>';
		build+='			</h3>';
		build+='			<span class="price">';
		build+='				<span class="woocommerce-Price-amount amount">';
		build+='					<span class="woocommerce-Price-currencySymbol"></span>'+data.price.formatMoney(0,3)+'';
		build+='				đ</span>';
		build+='			</span>';
		build+='			<a href="#"></a>';
		build+='			<a rel="nofollow" data-quantity="1" data-product_id="139" data-product_sku="" class="button product_type_simple add_to_cart_button add_to_cart_button_related_'+data.id+'">Thêm vào giỏ hàng</a>';
		build+='		</div>';
		build+='	</div>';
		build+='</li>';
		return build;
	},

	buildTitleOrderPage(data){
		var build = '';
		build+='<h1 class="page_title">'+data.name+'</h1>';
		build+='<div class="breadcrumbs">';
		build+='	<a class="breadcrumbs_item home" href="index.html">Home</a>';
		build+='	<span class="breadcrumbs_delimiter"></span>';
		build+='	<span class="breadcrumbs_item current">'+data.name+'</span>';
		build+='</div>';
		return build;

	},
}
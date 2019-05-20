var Home = {
	from : 0,
	size : 9,
	data : [],
	dataCategory : [],
	dataImages : [],
	dataArticles : [],


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

	initHome : function(){
		var searchParams = {
			index : 'categories',
			type: 'category',
			from : 0,
			size : 100,
			body :{
				query : {
					bool : {
						"must" : [
						{
							query_string: {
								default_field : "merchantId",
								query: Configuration.ynestMerchantId
							}
						},
						{
							"match" : { "type" : 32}
						}
						]
					}
				}
			}
		};
		client.search(searchParams, function(error, data){
			var tempIDs = '';
			jQuery.each(data.hits.hits, function(index, value){
				Home.dataCategory.push(value._source);
				tempIDs += value._source.relationIds.join(' ') + ' ';
			});
			var searchArticles = {
				from : 0,
				size : 100,
				body : {
					query : {
						bool: {
							"must" : [
							{
								query_string : {
									default_field : "id",
									query : tempIDs
								}
							}
							]
						}
					}
				}
			};
			client.search(searchArticles, function(err, dataItem){
				jQuery.each(dataItem.hits.hits, function(i, val){
					Home.data.push(val._source);
				});

				var index = Home.dataCategory.find(e => e.displayOrder == 2);
				if(index != undefined){
					jQuery('#text-section2').text(index.name);
					jQuery('#content-section2').text(index.description);
				}

				var index = Home.dataCategory.find(e => e.displayOrder == 4);
				if (index != undefined) {
					jQuery.each(index.relationIds, function(rlsIndex, rlsVl){
						item = Home.data.find(e => e.id == rlsVl);
						jQuery('#section-ultilities').append(Home.buildItemUtilities(rlsIndex, item));
					})
				}

				var index = Home.dataCategory.find(e => e.displayOrder == 5);
				if(index != undefined){
					var build = '';
					jQuery.each(index.relationIds, function(rlsIndex, rlsVl){
						items = Home.data.find(e => e.id == rlsVl);
						jQuery('#section-events').append(Home.buildItemEvents(rlsIndex, items));
					})

					var tpj=jQuery;
					var rev_slider_2_2=tpj("#rev_slider_2_2");
					var revapi2;
					if(rev_slider_2_2.revolution===undefined) {
						revslider_showDoubleJqueryError("#rev_slider_2_2");
					}
					else {
						revapi2=rev_slider_2_2.show().revolution({
							sliderType:"standard", jsFileLocation:"//hotcoffee.themerex.net/wp-content/plugins/revslider/public/assets/js/", sliderLayout:"auto", dottedOverlay:"none", delay:9000, navigation: {
								keyboardNavigation:"off", keyboard_direction: "horizontal", mouseScrollNavigation:"off", onHoverStop:"off", touch: {
									touchenabled: "on", swipe_threshold: 75, swipe_min_touches: 50, swipe_direction: "horizontal", drag_block_vertical: false
								}, bullets: {
									enable: true, hide_onmobile: true, hide_under: 600, style: "", hide_onleave: false, direction: "horizontal", h_align: "center", v_align: "bottom", h_offset: 0, v_offset: 70, space: 16, tmp: '<span class="tp-bullet-image"></span><span class="tp-bullet-title"></span>'
								}
							}, visibilityLevels:[1240, 1024, 778, 480], gridwidth:1240, gridheight:840, lazyType:"none", shadow:0, spinner:"spinner0", stopLoop:"off", stopAfterLoops:-1, stopAtSlide:-1, shuffle:"off", autoHeight:"off", disableProgressBar:"on", hideThumbsOnMobile:"off", hideSliderAtLimit:0, hideCaptionAtLimit:0, hideAllCaptionAtLilmit:0, debugMode:false, fallbacks: {
								simplifyAll: "off", nextSlideOnWindowFocus: "off", disableFocusListener: false,
							}
						}
						);
					}
				}

				var index = Home.dataCategory.find(e => e.displayOrder == 7);
				var images = [];
				if(index != undefined){
					var build = '';
					jQuery.each(index.images, function(rlsIndex, rlsVl){
						images.push(rlsVl);
					});
					jQuery.each(images, function(index, value){
						jQuery('#gallery-ynest').append(Home.buildItemImages(index, Configuration.imageRoot + value.path));
					})
				}


				var index = Home.dataCategory.find(e => e.displayOrder == 8);
				if(index != undefined){
					var build = '';
					jQuery.each(index.relationIds, function(rlsIndex, rlsVl){
						item = Home.data.find(e => e.id == rlsVl);
						jQuery('#section-article').append(Home.buildArticles(rlsIndex, item));
					})
				}
			});
		});
	},

	initDetail : function(){
		var urlString = window.location.href;
		var url = new URL(urlString);
		var getID = url.searchParams.get('id');
		var searchParams = {
			index : 'categories',
			type : 'category',
			from : 0,
			size : 100,
			body : {
				query : {
					bool : {
						"must" : [
						{
							query_string: {
								default_field : "merchantId",
								query: Configuration.ynestMerchantId
							}
						},
						{
							"match" : { "type" : 2}
						}
						]
					}
				}
			}
		};
		client.search(searchParams, function(err, data){
			var tempIDs = '';
			jQuery.each(data.hits.hits, function(index, value){
				Home.dataCategory.push(value._source);
				tempIDs += value._source.id;
			});
			var searchArticles = {
				index : 'articles',
				type : 'article2',
				from : 0,
				size : 100,
				body: {
					query: {
						bool: {
							"must" : [
							{ "match": { "id": getID } }
							]
						}
					}
				} 
			};
			client.search(searchArticles, function(err, data){
				jQuery.each(data.hits.hits, function(index, value){
					jQuery('#post-ynest').append(Home.buildPostContent(value._source));
					jQuery('#title-post-ynest, .breadcrumbs_item.current').text(value._source.name);
				})

				var searchArticlesRelate = {
					index : 'articles',
					type : 'article2',
					from : 0,
					size : 100,
					body: {
						query: {
							bool: {
								"must": [
								{
									query_string : {
										default_field : "categoryIds",
										query : tempIDs
									}
								}
								]
							}
						}
					}
				};
				client.search(searchArticlesRelate, function(err, data){
					jQuery.each(data.hits.hits, function(i, vl){
						Home.dataArticles.push(vl._source);
					})
					var randomArticles = Home.getRandom(Home.dataArticles, 3);
					jQuery.each(randomArticles, function(index, value){
						jQuery('#related-post').append(Home.buildRelatedPost(index, value));
					})
				})
			})

		})	
	},

	initBlog : function(){
		
		var searchParams = {
			index : 'categories',
			type : 'category',
			from : 0,
			size : 100,
			body : {
				query : {
					bool : {
						"must" : [
						{
							query_string: {
								default_field : "merchantId",
								query: Configuration.ynestMerchantId
							}
						},
						{
							"match" : { "type" : 2}
						}
						]
					}
				}
			}
		};
		client.search(searchParams, function(err, data){
			var tempIDs_news = '';
			var tempIDs_events = '';
			jQuery.each(data.hits.hits, function(index, value){
				Home.dataCategory.push(value._source);
				if(value._source.name == 'Tin tức'){
					tempIDs_news += value._source.id;
				}else{
					tempIDs_events += value._source.id;
				}
			});
			var searchArticles = {
				index : 'articles',
				type : 'article2',
				from : 0,
				size : 100,
				body: {
					query: {
						bool: {
							"must": [
							{
								query_string : {
									default_field : "categoryIds",
									query : tempIDs_news
								}
							}
							]
						}
					}
				}
			};
			client.search(searchArticles, function(err, data){
				jQuery.each(data.hits.hits, function(index, value){
					Home.data.push(value._source);
					jQuery('#blog-ynest').append(Home.buildBlog(index, value._source));
				})
				if(Home.data.length < 5){
					var dataBlog_3 = Home.getRandom(Home.data, 3);
					dataBlog_3.forEach(function(value){				
						jQuery('#recent-blog-ynest').append(Home.buildRecentBlog(value));
					})
				}else{
					var dataBlog_5 = Home.getRandom(Home.data, 5);
					dataBlog_5.forEach(function(value){				
						jQuery('#recent-blog-ynest').append(Home.buildRecentBlog(value));
					})
				}
			})
		})		

	},

	initServices : function(){
		var searchParams = {
			index : 'products',
			type : 'product',
			from : 0,
			size : 10,
			body: {
				query: {
					bool: {
						"must" : [
						{
							query_string:{
								default_field: "merchantId",
								query: Configuration.ynestMerchantId
							}
						}
						]
					}
				}
			}
		};
		client.search(searchParams, function(err, data){
			jQuery.each(data.hits.hits, function(index, value){
				// console.log(value._source.name);
				if(value._source.name === 'Y-Flex' || value._source.name === 'Y-Seat' || value._source.name === 'Y-Daily'){
					jQuery('#service-block').append(Home.buildServicesBlock(value._source));
				}
			})
		})
	},

	buildItemUtilities(index,data){
		var build = '';
		jQuery.each(data.images, function (index, value) {
			if(value.isFeatured == true){
				imageUrl = Configuration.imageRoot + value.path;
				return false;
			}
		});
		build+='<div class="column-1_3 column_padding_bottom">';
		build+='	<div id="sc_services_258_1" class="sc_services_item">';
		build+='		<div class="sc_services_item_featured post_featured">';
		build+='			<div class="post_thumb" data-image="images/services_1.png" data-title="'+data.subDescription+'">';
		build+='				<a class="hover_icon hover_icon_link" href="javascript:;">';
		build+='					<img alt="" src="'+imageUrl+'?mode=Crop&width=300&height=281">';
		build+='				</a>';
		build+='			</div>';
		build+='		</div>';
		build+='		<h4 class="sc_services_item_title">';
		build+='			<a href="javascript:;">'+data.description+'</a>';
		build+='		</h4>';
		build+='	</div>';
		build+='</div>';
		return build;
	},

	buildItemImages(index,data){
		var build = '';
		build+='<div class="col-3 text-center" style="padding: .3rem">';
		build+='	<div style="width: 100%">';
		build+='		<a data-fancybox="gallery" href="'+data+'"><img src="'+data+'?mode=Crop&width=520&height=350" class="w-100"></a>';
		build+='	</div>';
		build+='</div>';
		return build;
	},

	buildArticles(index, data){
		var build = '';
		build+='<div class="isotope_item isotope_item_short isotope_item_short_4 isotope_column_4">';
		build+='	<div class="post_item post_item_short post_item_short_4 post_format_standard">';
		build+='		<div class="post_content isotope_item_content">';
		build+='			<div class="post_info_wrap info">';
		build+='				<div class="info-back">';
		build+='					<div class="post_cat">';
		build+='						<a href="#" rel="category tag">Y-Nest</a>';
		build+='					</div>';
		build+='					<h4 class="post_title">';
		build+='						<a href="post.html?id='+data.id+'">'+data.name+'</a>';
		build+='					</h4>';
		build+='					<div class="post_date">Posted '+data.modifiedDate.slice(0,10)+'</div>';
		build+='				</div>';
		build+='			</div>';
		build+='		</div>';
		build+='	</div>';
		build+='</div>';
		return build;
	},

	buildPostContent(data){
		var build = '';
		var cropSz = '?mode=Crop&width=760&height=510';
		jQuery.each(data.images, function (index, value) {
			if(value.isFeatured == true){
				imageUrl = Configuration.imageRoot + value.path + cropSz;
				return false;
			}
		});
		build+='<section class="post_featured">';
		build+='	<div class="post_thumb" data-image="'+imageUrl+'" data-title="'+data.name+'">';
		build+='		<a class="hover_icon hover_icon_view" href="'+imageUrl+'" title="'+data.name+'">';
		build+='			<img alt="" src="'+imageUrl+'">';
		build+='		</a>';
		build+='	</div>';
		build+='</section>';
		build+='<section class="post_content">';
		build+='	<div class="post_info">';
		build+='		<span class="post_info_item post_info_posted">';
		build+='			<a href="single-post.html" class="post_info_date date updated" content="'+data.createdDate+'">'+data.createdDate.slice(0, 10)+'</a>';
		build+='		</span>';
		build+='		<span class="post_info_item post_info_posted_by vcard">Đăng bởi';
		build+='			<a href="single-post.html" class="post_info_author">admin</a>';
		build+='		</span>';
		// build+='		<span class="post_info_item post_info_tags">in';
		// build+='			<a class="category_link" href="blog-sidebar.html">Blog With Sidebar</a>,';
		// build+='			<a class="category_link" href="blog.html">Blog Without Sidebar</a>,';
		// build+='			<a class="category_link" href="masonry-2-columns.html">Recipes</a>,';
		// build+='			<a class="category_link" href="masonry-3-columns.html">Restaurants</a>';
		// build+='		</span>';
		// build+='		<span class="post_info_item post_info_counters">';
		// build+='			<span class="post_counters_item post_counters_views icon-eye109" title="Views - 748">';
		// build+='				<span class="post_counters_number">748</span>';
		// build+='			</span>';
		// build+='			<a class="post_counters_item post_counters_comments icon-write57" title="Comments - 3" href="single-post.html#comments">';
		// build+='				<span class="post_counters_number">3</span>';
		// build+='			</a>';
		// build+='		</span>';
		build+='	</div>';
		build+='	<p>'+data.description+'</p>';
		// build+='	<div class="post_info post_info_bottom">';
		// build+='		<span class="post_info_item post_info_tags">Tags:';
		// build+='			<a class="post_tag_link" href="#">delicious</a>,';
		// build+='			<a class="post_tag_link" href="#">Our Clients</a>,';
		// build+='			<a class="post_tag_link" href="#">portfolio</a>';
		// build+='		</span>';
		// build+='	</div>';
		build+='</section>';
		return build;
	},

	buildRelatedPost(index,data){
		var build = '';
		var cropSz = '?mode=Crop&width=237&height=237';
		jQuery.each(data.images, function (i, value) {
			if(value.isFeatured == true){
				imageUrl = Configuration.imageRoot + value.path + cropSz;
				return false;
			}
		});
		build+='<div class="column-1_3 column_padding_bottom">';
		build+='	<article class="post_item post_item_related post_item_'+index+'">';
		build+='		<div class="post_content">';
		build+='			<div class="post_featured">';
		build+='				<div class="post_thumb" data-image="'+imageUrl+'" data-title="'+data.name+'">';
		build+='					<a class="hover_icon hover_icon_link" href="single-post.html">';
		build+='						<img width="370" height="370" alt="" src="'+imageUrl+'">';
		build+='					</a>';
		build+='				</div>';
		build+='			</div>';
		build+='			<div class="post_content_wrap">';
		build+='				<div class="post_info post_info_tags">';
		build+='					<a class="post_tag_link" href="#">Y-nest</a>';
		build+='				</div>';
		build+='				<h4 class="post_title">';
		build+='					<a href="post.html?id='+data.id+'">'+data.name+'</a>';
		build+='				</h4>';
		build+='				<div class="post_info_date">'+data.createdDate.slice(0,10)+'</div>';
		build+='			</div>';
		build+='		</div>';
		build+='	</article>';
		build+='</div>';
		return build;
	},

	buildItemEvents(index, data){
		var build = '';
		var crop = '?mode=crop&width=524&height=524';
		jQuery.each(data.images, function (i, value) {
			if(value.isFeatured == true){
				imageUrl = Configuration.imageRoot + value.path + crop;
				return false;
			}
		});
		build+=' <li data-index="rs-'+index+'" data-transition="fade" data-slotamount="default" data-easein="default" data-easeout="default" data-masterspeed="300" data-thumb="" data-rotate="0" data-saveperformance="off" data-title="Slide" data-description="">';
		build+='	<img src="images/transparent.png" alt="" data-bgposition="center center" data-bgfit="cover" data-bgrepeat="no-repeat" class="rev-slidebg" data-no-retina>';
		build+='	<div class="tp-caption Hotcoffee-style-7 tp-resizeme" id="slide-4-layer-1" data-x="643" data-y="238" data-width="["auto"]" data-height="["auto"]" data-transform_idle="o:1;" data-transform_in="opacity:0;s:500;e:Power2.easeInOut;" data-transform_out="opacity:0;s:500;s:500;" data-start="500" data-splitin="none" data-splitout="none" data-responsive_offset="on" style="font-size: 35px !important;">'+data.title+'</div>';
		build+='	<div class="tp-caption Hotcoffee-style-8 tp-resizeme" id="slide-4-layer-2" data-x="645" data-y="359" data-width="["auto"]" data-height="["auto"]" data-transform_idle="o:1;" data-transform_in="opacity:0;s:500;e:Power2.easeInOut;" data-transform_out="opacity:0;s:500;s:500;" data-start="500" data-splitin="none" data-splitout="none" mdata-responsive_offset="on">';
		build+='		ESPRESSO BLEND <br/>';
		build+='		Locally Roasted';
		build+='	</div>';
		build+='	<div class="tp-caption Hotcoffee-style-9 tp-resizeme" id="slide-4-layer-3" data-x="645" data-y="454" data-width="["auto"]" data-height="["auto"]" data-visibility="["on","on","on","off"]" data-transform_idle="o:1;" data-transform_in="opacity:0;s:500;e:Power2.easeInOut;" data-transform_out="opacity:0;s:500;s:500;" data-start="500" data-splitin="none" data-splitout="none" data-responsive_offset="on">'+data.description+'</div>';
		build+='	<div class="tp-caption no-style" id="slide-4-layer-4" data-x="654" data-y="565" data-width="["auto"]" data-height="["auto"]" data-transform_idle="o:1;" data-transform_in="opacity:0;s:500;e:Power2.easeInOut;" data-transform_out="opacity:0;s:500;s:500;" data-start="500" data-splitin="none" data-splitout="none" data-responsive_offset="on" data-responsive="off">';
		build+='		<a href="post.html?id='+data.id+'" class="sc_button sc_button_square sc_button_style_border_2 sc_button_size_medium">Chi tiết</a>';
		build+='	</div>';
		build+='	<div class="tp-caption tp-resizeme" id="slide-4-layer-5" data-x="70" data-y="205" data-width="["none","none","none","none"]" data-height="["none","none","none","none"]" data-transform_idle="o:1;" data-transform_in="x:-50px;opacity:0;s:500;e:Power2.easeInOut;" data-transform_out="x:-50px;opacity:0;s:500;s:500;" data-start="500" data-responsive_offset="on">';
		build+='		<img src="'+imageUrl+'" alt="" width="524" height="523" data-ww="524px" data-hh="523px" data-no-retina>';
		build+='	</div>';
		build+='	<div class="tp-caption tp-resizeme" id="slide-4-layer-6" data-x="649" data-y="118" data-width="["none","none","none","none"]" data-height="["none","none","none","none"]" data-transform_idle="o:1;" data-transform_in="opacity:0;s:500;e:Power2.easeInOut;" data-transform_out="opacity:0;s:500;s:500;" data-start="500" data-responsive_offset="on">';
		build+='		<img src="images/second_slider_el_2.png" alt="" width="202" height="104" data-ww="202px" data-hh="104px" data-no-retina>';
		build+='	</div>';
		build+='</li>';
		return build;
	},

	buildBlog(index, data){
		var build = '';
		var crop = '?mode=Crop&width=371&height=247';
		jQuery.each(data.images, function (i, value) {
			if(value.isFeatured == true){
				imageUrl = Configuration.imageRoot + value.path + crop;
				return false;
			}
		});
		build+='<div class="isotope_item isotope_item_masonry isotope_item_masonry_2 isotope_column_2">';
		build+='	<article class="post_item post_item_masonry post_item_masonry_2 post_format_standard">';
		build+='		<div class="post_featured">';
		build+='			<div class="post_thumb" data-image="'+imageUrl+'" data-title="'+data.name+'">';
		build+='				<a class="hover_icon hover_icon_link" href="post.html?id='+data.id+'">';
		build+='					<img width="370" height="246" alt="" src="'+imageUrl+'">';
		build+='				</a>';
		build+='			</div>';
		build+='		</div>';
		build+='		<div class="post_content isotope_item_content">';
		build+='			<h5 class="post_title">';
		build+='				<a href="post.html?id='+data.id+'">'+data.name+'</a>';
		build+='			</h5>';
		build+='			<div class="post_info">';
		build+='				<span class="post_info_item post_info_posted">';
		build+='					<a href="post.html?id='+data.id+'" class="post_info_date">'+data.createdDate.slice(0,10)+'</a>';
		build+='				</span>';
		build+='				<span class="post_info_item post_info_counters">';
		build+='					<a class="post_counters_item post_counters_views icon-eye109" title="Views - 745" href="single-post.html">';
		build+='						<span class="post_counters_number">745</span>';
		build+='					</a>';
		build+='					<a class="post_counters_item post_counters_comments icon-write57" title="Comments - 3" href="single-post.html#comments">';
		build+='						<span class="post_counters_number">3</span>';
		build+='					</a>';
		build+='				</span>';
		build+='			</div>';
		build+='			<div class="post_descr">';
		build+='				<p class="text-ellipsis line-3">'+data.subDescription+'</p>';
		build+='				<a href="post.html?id='+data.id+'" class="post_readmore">';
		build+='					<span class="post_readmore_label">Xem thêm</span>';
		build+='				</a>';
		build+='			</div>';
		build+='		</div>';
		build+='	</article>';
		build+='</div>';
		return build;
	},

	buildRecentBlog(data){
		var build = '';
		build+='<article class="post_item no_thumb first">';
		build+='	<div class="post_cat">';
		build+='		<a href="#" rel="category tag">Y-Nest</a>';
		build+='	</div>';
		build+='	<div class="post_content">';
		build+='		<h6 class="post_title">';
		build+='			<a href="post.html?id='+data.id+'">'+data.name+'</a>';
		build+='		</h6>';
		build+='	</div>';
		build+='</article>';
		return build
	},

	buildServicesBlock(data){ 

		var build = '';
		build+='<div class="sc_price_block sc_price_block_style_3 column-1_3">';
		build+='	<div class="sc_price_block_title">';
		build+='		<span>'+data.name+'</span>';
		build+='	</div>';
		build+='	<div class="sc_price_block_money">';
		build+='		<div class="sc_price">';
		build+='			<span class="sc_price_money">'+data.price.formatMoney(0,3)+'</span>';
	// build+='			<span class="sc_price_currency">đ</span>';
	build+='		</div>';
	build+='	</div>';
	build+='	<div class="sc_price_block_description">';
	build+='		<p>'+data.description+'</p>';
	build+='		<p>'+data.subDescription+'</p>';
	build+='	</div>';
	build+='	<div class="sc_price_block_link">';
	build+='		<a href="contacts.html" class="sc_button sc_button_square sc_button_style_border_1 sc_button_size_small">Đăng ký </a>';
	build+='	</div>';
	build+='</div>';
	return build;
}
}
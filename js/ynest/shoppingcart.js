var ShoppingCart = {
    change: false,
    data: [],
    dataProduct: [],
    $spShoppingCartItemQuantity: jQuery(".spShoppingCartItemQuantity"),
    $divShoppingCart: jQuery("#main-sidebar"),
    CustomerId: "Y-NestShoppingCart",
    $showCartPromotion: jQuery("#showCartPromotion"),
    init: function () {
        // ShoppingCart.cart();
        ShoppingCart.getItems();
    },


    getItems: function () {
        if (!!jQuery.cookie(ShoppingCart.CustomerId)) {
            var formData = new FormData();
            formData.append('anonymousCustomerId', jQuery.cookie(ShoppingCart.CustomerId));
        } else {
            jQuery.cookie(ShoppingCart.CustomerId, guid());
        }
        var searchParams = {
            index: 'shoppingcarts',
            type: 'shoppingcart',
            from: 0,
            size: 10000,
            body: {
                query: {
                    "bool": {
                        "must": [
                        {
                            "match": { "customerId": jQuery.cookie(ShoppingCart.CustomerId) }
                        },
                        {
                            "match": { "inventoryId": Configuration.inventoryId }
                        },
                        ]
                    }
                }
            }
        };


        client.search(searchParams,function (error, data) { 
            var build = '';
            var tempId = '';
            var quantity = '';
            var grandTotalPrice = 0;
            var grandTotalItem = 0;
            var cartID = '';
            var shoppingCartItemsId = '';
            jQuery.each(data.hits.hits, function (i, val) {
                ShoppingCart.data.push(val._source);  
            });
            var productIds = [];
            if(ShoppingCart.data[0] != undefined){    
                jQuery.each(ShoppingCart.data[0].shoppingCartItems, function(index, value){
                    productIds.push(value.targetId);
                })
            }
            var searchProduct = {
                index: 'dishs',
                type : 'dish',
                from: 0,
                size: 1000,
                body:   {
                    query:  {
                        "bool": {
                            "must": [
                            {
                                query_string: {
                                    default_field: "id",
                                    query: productIds.toString()
                                }
                            }
                            ]
                        }
                    }
                }
            }
            client.search(searchProduct, function (errorProduct, dataProduct) {

                jQuery.each(dataProduct.hits.hits, function (i, val) {
                    var tempData = ShoppingCart.data[0].shoppingCartItems.find(e=> e.targetId == val._source.id);
                    if(tempData != undefined){
                        grandTotalPrice += val._source.price * parseInt(tempData.quantity);
                        grandTotalItem += parseInt(tempData.quantity);
                        cartID = ShoppingCart.data[0].id;
                        shoppingCartItemsId = tempData.id;
                        if(tempData.quantity != 0){
                            jQuery('#newCart').append(ShoppingCart.buildDataCart(val._source, tempData.quantity, cartID, shoppingCartItemsId));   
                            jQuery('#newCartMobile').append(ShoppingCart.buildDataCart(val._source, tempData.quantity, cartID, shoppingCartItemsId));  
                            jQuery('#newCartMobile .empty_cart_text').addClass('hide');               
                        }
                    }
                });

                if(grandTotalPrice != 0){
                    jQuery('span#grandTotalPrice').html(grandTotalPrice.formatMoney(0,3));
                }else{
                    jQuery('span#grandTotalPrice').html('0.00');
                }
                if(grandTotalItem != 0){
                    jQuery('span.grandTotalItem').html(grandTotalItem);
                }else{
                    jQuery('span.grandTotalItem').html('0');
                    jQuery('#newCart').append('Không có sản phẩm !');   
                    jQuery('#newCartMobile').html('Không có sản phẩm !');                                   
                }
            });
            jQuery('#newCart').html('');           
            jQuery('#newCartMobile').html('');
            jQuery('.button-checkout').css('display','none');
            if(ShoppingCart.data != 0){
                if(ShoppingCart.data[0].shoppingCartItems.length != 0){
                    jQuery('.button-checkout').css('display','block'); 
                    jQuery('.button-checkout a').attr('onclick','ShoppingCart.pay(\'' +ShoppingCart.data[0].id+ '\')');
                }
            }
        });
    },

    buildDataCart(data, quantity, cartID, shoppingCartItemsId){
        var build = '';
        jQuery.each(data.images, function(index, vl){
            imgUrl = Configuration.imageRoot + vl.path;
        })
        build+='<li class="item-sidebar row" id="p_'+shoppingCartItemsId+'" class="ynest_'+data.id+'">';
        build+='    <div class="col-4">';
        build+='        <div>';
        build+='            <img src="'+imgUrl+'" alt="'+data.name+'" class="img-fluid">';
        build+='        </div>';
        build+='    </div>';
        build+='    <div class="col-6">';
        build+='        <a class="text-ellipsis line-1 reset" title="'+data.name+'" href="order.html?id='+data.id+'">'+data.name+'</a>';
        build+='        <p class="reset"><b>'+data.price.formatMoney(0,3)+'đ</b></p>';
        build+='        <span>Số lượng: '+quantity+'</span>';
        build+='    </div>';
        build+='    <div class="col-2" style="cursor: pointer;">';
        build+='        <a onclick=ShoppingCart.deleteItem(\'' +cartID+ '\',\''+shoppingCartItemsId+'\') class="text-center"><b>x</b></a>';
        build+='    </div>';
        build+='</li>';

        return build;  
    },

    pushToCart: function (productData, quantity) {
        var quantity = parseInt(quantity);
        if (ShoppingCart.data.length == 0) {
            var id = guid();
            var newShoppingCart = {
                id: id,
                targetId: Configuration.ynestMerchantId,
                inventoryId: Configuration.inventoryId,
                customerId: jQuery.cookie(ShoppingCart.CustomerId),
                targetName: "Giỏ hàng",
                merchantId: Configuration.ynestMerchantId,
                shoppingCartItems: [{
                    id: guid(),
                    quantity: quantity,
                    targetId: productData.id,
                    targetName: productData.name,
                    targetPrice: productData.price,
                    targetImagePath: productData.images.find(e=>e.isFeatured === true).path
                }]
            }
            this.data.push(newShoppingCart);

            jQuery.ajax({
                url: Configuration.apiUrl + "/ShoppingCart/Create",
                method: "POST",
                dataType: 'json',
                data: JSON.stringify(newShoppingCart),
                contentType: "application/json",
                processData: false,
                beforeSend : function(){
                    Loading.show();
                },
                success: function (data) {
                    // console.log(data);
                    Loading.show();
                },
                complete: function (result) {
                    if (result.Success === false) {
                        messageDialog.show("Thông báo",
                            "Không thể thêm vào giỏ hàng, quý khách liên hệ với CSKH để biết thêm chi tiết.");
                    } else {
                        Loading.hide();
                        ShoppingCart.getItems();
                    }
                }
            });
        }
        // Da co san pham nhung them san pham moi
        else {
            var tempShoppingCartItem = ShoppingCart.data[0].shoppingCartItems.find(e => e.targetId === productData.id);
            if (tempShoppingCartItem == undefined) {
                var shoppingCartItem = {
                    id: guid(),
                    shoppingCartId: ShoppingCart.data[0].id,
                    quantity: quantity,
                    targetId: productData.id,
                    targetName: productData.name,
                    targetPrice: productData.price,
                    targetImagePath: productData.images.find(e => e.isFeatured === true).path
                }
                ShoppingCart.data[0].shoppingCartItems.push(shoppingCartItem);
                var data = {
                    id : ShoppingCart.data[0].id,
                    shoppingCartItem : shoppingCartItem
                }           
                jQuery.ajax({
                    url: Configuration.apiUrl + "/ShoppingCart/CreateItem",
                    method: "POST",
                    dataType: 'json',
                    data: JSON.stringify(data),
                    contentType: "application/json",
                    processData: false,
                    beforeSend : function(){
                        Loading.show();
                    },
                    success: function (data) {
                        // console.log(data);
                    },
                    complete: function (result) {
                        if (result.Success === false) {
                            messageDialog.show("Thông báo",
                                "Không thể thêm vào giỏ hàng, quý khách liên hệ với CSKH để biết thêm chi tiết.");
                            ShoppingCart.countItems();
                        }else{
                            Loading.hide();
                            ShoppingCart.getItems();
                        }
                    }
                });
                // đã tồn tại sản phẩm và update số lượng
            } else {
                for (var i in ShoppingCart.data[0].shoppingCartItems) {
                    if (ShoppingCart.data[0].shoppingCartItems[i].targetId === productData.id) {
                        ShoppingCart.data[0].shoppingCartItems[i].quantity = parseInt(quantity) + parseInt(ShoppingCart.data[0].shoppingCartItems[i].quantity);
                        var updateData = {
                            id: ShoppingCart.data[0].id,
                            customerId: jQuery.cookie(ShoppingCart.CustomerId),
                            shoppingCartItem: {
                                id: ShoppingCart.data[0].shoppingCartItems[i].id,
                                quantity: ShoppingCart.data[0].shoppingCartItems[i].quantity
                            }
                        }
                        jQuery.ajax({
                            url: Configuration.apiUrl + "/ShoppingCart/UpdateItem",
                            method: "POST",
                            dataType: 'json',
                            data: JSON.stringify(updateData),
                            contentType: "application/json",
                            processData: false,
                            beforeSend : function(){
                                Loading.show();
                            },
                            success: function (data) {
                                console.log(data);
                            },
                            complete: function (result) {
                                if (result.Success === false) {
                                    messageDialog.show("Thông báo",
                                        "Không thể thêm vào giỏ hàng, quý khách liên hệ với CSKH để biết thêm chi tiết.");
                                    ShoppingCart.countItems();
                                }else{

                                    Loading.hide();
                                    ShoppingCart.getItems();
                                }
                            }
                        });
                        break; 
                    }
                }
            }
        }             
    },   

    deleteItem: function (CartId, ShoppingCartItemsId) {
        jQuery('#p_'+ShoppingCartItemsId).remove();
        for( var i=0; i < ShoppingCart.data[0].shoppingCartItems.length ; i++ ){
            if( ShoppingCart.data[0].shoppingCartItems[i].id == ShoppingCartItemsId){
                ShoppingCart.data[0].shoppingCartItems.splice(i,1);
                break;
            }
        }
        var data = {
            id : CartId,
            ShoppingCartItemId: ShoppingCartItemsId,
            InventoryId: Configuration.inventoryId,
            CustomerId: jQuery.cookie(ShoppingCart.CustomerId)
        };
        jQuery.ajax({
            url: Configuration.apiUrl + "/ShoppingCart/DeleteItem",
            method: "POST",
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: "application/json",
            processData: false,
            beforeSend : function(){
                Loading.show();
            },
            success: function (result) {
                Loading.hide();
                if (!result.Success) {
                    messageDialog.show("Thông báo", "Xin lõi khách hàng, hiện đang có lỗi xảy ra xin liên hệ với chăm sóc khác hàng theo số 024.7301.8818 để được trợ giúp!");
                    ShoppingCart.getItems();
                }else {
                    ShoppingCart.getItems();
                }
            }
        });
    },

    pay: function (id) {

        var tokenId = jQuery.cookie('tokenId');
        if(tokenId != undefined){
            var orderId = guid();
            var data = {
                id: id,
                customerId: jQuery.cookie(ShoppingCart.CustomerId),
                orderId: orderId
            };

            var tokenId = jQuery.cookie('tokenId');
            var categoryId = jQuery.cookie('categoryId');

            jQuery.ajax({
                url: Configuration.apiUrl + "/ShoppingCart/Pay",
                method: "POST",
                dataType: 'json',
                data: JSON.stringify(data),
                contentType: "application/json",
                processData: false,
                beforeSend: function () {
                // $("body").removeClass("open-cart");
                Loading.show();
            },
            success: function (result) {
                if (result.Success) {
                    window.location.href = '/thanh-toan/' + orderId;
                    // window.location.href = 'checkout.labo.io/checkout/index?id='+id+'&urlReturn='++'&tokenId=';
                } else {
                    // console.log(result);
                    Loading.hide();
                    ShoppingCart.$divShoppingCart.html("");
                    ShoppingCart.$spShoppingCartItemQuantity.html(0);
                    messageDialog.show("Thông báo", "Sản phẩm tạm thời đã bán hết, quý khách vui lòng chọn sản phẩm khác!");
                }
            },
            error: function (jq, status, message) {
                console.log('Error');
                Loading.hide();
            }
        });
        }else {
            // messageDialog.show("Thông báo", "Vui lòng đăng nhập trước khi thanh toán!");
            jQuery('#popup_login').css('display','block');
        }
        
    },
}
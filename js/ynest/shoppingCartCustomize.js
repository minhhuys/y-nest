var ShoppingCart = {
    change: false,
    data: [],
    dataProduct: [],
    $spShoppingCartItemQuantity: jQuery(".spShoppingCartItemQuantity"),
    $divShoppingCart: jQuery("#main-sidebar"),
    CustomerId: "ShoppingCartFoodTalk",
    $showCartPromotion: jQuery("#showCartPromotion"),
    init: function () {
        // ShoppingCart.cart();
        ShoppingCart.getItems();
    },
    cart: function () {
        $(".shopping-cart").on("click", function () {
            $("body").toggleClass("open-cart")
        }), 
        $("#cart-overlay,.close-cart").on("click", function (i) {
            if (ShoppingCart.change === true) {
                ShoppingCart.updateShoppingCarts();
            }
            i.preventDefault(), $("body").removeClass("open-cart");
        });
    },    
    countItems: function () {
        var temp = 0;
        ShoppingCart.$divShoppingCart.find('input[class="mini-qty"]').each(function () {
            temp += parseInt($(this).val());
        });
        ShoppingCart.$spShoppingCartItemQuantity.html(temp);
    },
    getItems: function () {

        jQuery('.button-checkout').css('display','none');

        if(ShoppingCart.data != 0){
            if(ShoppingCart.data[0].shoppingCartItems.length != 0){
                jQuery('.button-checkout').css('display','block'); 
            }
        }
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
                        }
                        ]
                    }
                }
            }

        };

        client.search(searchParams,function (error, data) { 
            jQuery.each(data.hits.hits, function (i, val) {
                var newShoppingCart = {
                    id: val._source.id,
                    targetId: Configuration.ynestMerchantId,
                    inventoryId: Configuration.inventoryId,
                    customerId: jQuery.cookie(ShoppingCart.CustomerId),
                    targetName: "Giỏ hàng",
                    merchantId: Configuration.ynestMerchantId,
                    shoppingCartItems: [],
                };
                ShoppingCart.data.push(newShoppingCart);
                if(val._source.shoppingCartItems.length != 0){
                    jQuery.each(val._source.shoppingCartItems, function(i, vl){
                        var searchProduct = {
                            index: 'dishs',
                            type : 'dish',
                            from: 0,
                            size: 1000,
                            body: {
                                query: {
                                    "bool": {
                                        "must": [
                                        {
                                            "bool": {
                                                "must": [
                                                {
                                                    "match_phrase": {"id": vl.targetId}
                                                }
                                                ]
                                            }
                                        }
                                        ]
                                    }

                                }
                            }
                        }
                        client.search(searchProduct, function (errorProduct, dataProduct) {
                            jQuery.each(dataProduct.hits.hits, function (i, value) {
                                var items = {
                                    id: vl.id,
                                    quantity: vl.quantity,
                                    targetId: vl.targetId,
                                    targetName: value._source.name,
                                    targetPrice: value._source.price,
                                    targetImagePath: value._source.images.find(e=>e.isFeatured === true).path
                                };
                                ShoppingCart.data[0].shoppingCartItems.push(items);
                                ShoppingCart.getNewItems(); 
                            });   
                        });
                    })
                }
            });
        });
    },


    getNewItems(){
        jQuery('.button-checkout').css('display','none');

        if(ShoppingCart.data != 0){
            if(ShoppingCart.data[0].shoppingCartItems.length != 0){
                jQuery('.button-checkout').css('display','block'); 
            }
        }
        ShoppingCart.buildPriceandQuantity();
        jQuery('#newCart').html('');
        ShoppingCart.data[0].shoppingCartItems.forEach(vlue => {
            jQuery('#newCart').append(ShoppingCart.buildDataCart(vlue,ShoppingCart.data[0].id));
        });    
    },

    pushToCart: function (productData, quantity) {
        var quantity = parseInt(quantity);

        // Tao gio hang moi
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
                success: function (data) {
                    // console.log(data);
                },
                complete: function (result) {
                    if (result.Success === false) {
                        messageDialog.show("Thông báo",
                            "Không thể thêm vào giỏ hàng, quý khách liên hệ với CSKH để biết thêm chi tiết.");
                    } else {
                        ShoppingCart.getNewItems();
                    }
                }
            });
        }

        // Neu gio hang da ton tai
        else {
            var tempShoppingCartItem = ShoppingCart.data[0].shoppingCartItems.find(e => e.targetId === productData.id);
            // Neu chua ton tai san pham
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
                    success: function (data) {
                        console.log(data);
                    },
                    complete: function (result) {
                        if (result.Success === false) {
                            messageDialog.show("Thông báo",
                                "Không thể thêm vào giỏ hàng, quý khách liên hệ với CSKH để biết thêm chi tiết.");
                            ShoppingCart.countItems();
                        }else{
                            ShoppingCart.getNewItems();
                        }
                    }
                });
            } 
            // Neu da ton tai san pham
            else {
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
                        console.log(updateData);
                        jQuery.ajax({
                            url: Configuration.apiUrl + "/ShoppingCart/UpdateItem",
                            method: "POST",
                            dataType: 'json',
                            data: JSON.stringify(updateData),
                            contentType: "application/json",
                            processData: false,
                            success: function (data) {
                                console.log(data);
                            },
                            complete: function (result) {
                                if (result.Success === false) {
                                    messageDialog.show("Thông báo",
                                        "Không thể thêm vào giỏ hàng, quý khách liên hệ với CSKH để biết thêm chi tiết.");
                                }else{
                                    ShoppingCart.getNewItems();
                                }
                            }
                        });
                        break; 
                    }
                }
            }
        }             
    },

    buildDataCart(data, cartId){
        var build = '';
        var imgURL = Configuration.imageRoot + data.targetImagePath;
        
        build+='<li class="item-sidebar row no-gutters" id="p_'+data.targetId+'">';
        build+='    <div class="col-4">';
        build+='        <div>';
        build+='            <img src="'+imgURL+'" alt="'+data.targetName+'" class="img-fluid">';
        build+='        </div>';
        build+='    </div>';
        build+='    <div class="col-6">';
        build+='        <p class="text-ellipsis line-1 reset" title="'+data.targetName+'">'+data.targetName+'</p>';
        build+='        <p class="reset"><b>'+data.targetPrice.formatMoney(0,3)+'đ</b></p>';
        build+='        <span><small><i>Số lượng: '+data.quantity+'</i></small></span>';
        build+='    </div>';
        build+='    <div class="col-2" style="cursor: pointer">';
        build+='        <a onclick=ShoppingCart.deleteItem(\'' +cartId+ '\',\''+data.targetId+'\') class="text-center"><b>x</b></a>';
        build+='    </div>';
        build+='</li>';

        return build;  
    },

    buildPriceandQuantity : function(){
        if(this.data.length != 0){
            var arr = this.data[0].shoppingCartItems;
            var countItems = [];
            var countPrices = [];
            jQuery.each(arr, function(index, value){
                countItems.push(value.quantity);
                countPrices.push(value.targetPrice * value.quantity);
            })
            function add(a, b) {
                return a + b;
            }
            var sumItems = countItems.reduce(add);
            var sumPrices = countPrices.reduce(add);

            jQuery('span#grandTotalPrice').html(sumPrices.formatMoney(0,3));
            jQuery('span#grandTotalItem').html(sumItems);
        }else{
            jQuery('span#grandTotalPrice').html('0.00');
            jQuery('span#grandTotalItem').html('0');
        }
    },

    changeQuantity: function (selector) {
        var $selector = $(selector);
        var id = $selector.attr('data-shoppingCartId');
        var targetId = $selector.attr('data-targetId');
        var targetPrice = $selector.attr('data-targetPrice');
        $("#ShoppingCartItem_SubTotal_" + id + targetId).html((targetPrice * $selector.val()).formatMoney(0, 3));

        for (var i in ShoppingCart.data) {
            if (ShoppingCart.data[i].id === id) {
                for (var j in ShoppingCart.data[i].shoppingCartItems) {
                    if (ShoppingCart.data[i].shoppingCartItems[j].targetId === targetId) {
                        ShoppingCart.data[i].shoppingCartItems[j].quantity = $selector.val();

                        var updateData = {
                            id: ShoppingCart.data[i].id,
                            customerId: $.cookie(ShoppingCart.CustomerId),
                            shoppingCartItem: {
                                id: ShoppingCart.data[i].shoppingCartItems[j].id,
                                quantity: ShoppingCart.data[i].shoppingCartItems[j].quantity
                            } 
                        }
                        $.ajax({
                            url: Configuration.apiUrl + "/ShoppingCart/UpdateItem",
                            method: "POST",
                            dataType: 'json',
                            data: JSON.stringify(updateData),
                            contentType: "application/json",
                            processData: false,
                            success: function (data) {
                                console.log(data);
                            },
                            complete: function (result) {
                                if (result.Success === false) {
                                    messageDialog.show("Thông báo",
                                        "Không thể thêm vào giỏ hàng, quý khách liên hệ với CSKH để biết thêm chi tiết.");
                                    ShoppingCart.countItems();
                                }else{
                                    ShoppingCart.getItems();
                                }
                            }
                        });
                        break; //Stop this loop, we found it!
                    }
                }
                break;
            }
        }        
        
    },    
    miniCartQuantity: function () {
        ShoppingCart.$divShoppingCart.find(".mini-cart-qty-dec").on("click", function () {
            var i = $(this).next(".mini-qty"),
            e = parseInt(i.val());
            !isNaN(e) && e > 1 && i.val(e - 1);
            ShoppingCart.changeQuantity(i);
        });
        ShoppingCart.$divShoppingCart.find(".mini-cart-qty-inc").on("click", function () {
            var i = $(this).prev(".mini-qty"),
            e = parseInt(i.val());
            isNaN(e) || i.val(e + 1);
            ShoppingCart.changeQuantity(i);
        });
    },


    deleteItem: function (id, itemId) {
        jQuery('#p_'+itemId).remove();
        if(this.data.length == 0)
            return;
        for( var i=0; i < this.data[0].shoppingCartItems.length ; i++ ){
            if( this.data[0].shoppingCartItems[i].targetId == itemId){
                this.data[0].shoppingCartItems.splice(i,1);
                break;
            }
        }
        var data = {
            id : id,
            ShoppingCartItemId: itemId,
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
            success: function (result) {
                // console.log(result);
                if (!result.Success) {
                    messageDialog.show("Thông báo", "Xin lõi khách hàng, hiện đang có lỗi xảy ra xin liên hệ với chăm sóc khác hàng theo số 024.7301.8818 để được trợ giúp!");
                    ShoppingCart.getItems();
                }else {
                    ShoppingCart.getItems();
                    // console.log('da xoa');
                }
            }
        });

    },

    pay: function () {
        var orderId = guid();
        var data = {
            id: jQuery.cookie(ShoppingCart.CustomerId),
            customerId: jQuery.cookie(ShoppingCart.CustomerId),
            orderId: orderId
        };
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
                    window.location = '/thanh-toan/' + orderId;
                } else {
                    Loading.hide();
                    ShoppingCart.$divShoppingCart.html("");
                    ShoppingCart.$spShoppingCartItemQuantity.html(0);
                    messageDialog.show("Thông báo", "Sản phẩm tạm thời đã bán hết, quý khách vui lòng chọn sản phẩm khác!");
                }
            },
            error: function (jq, status, message) {
                Loading.hide();
            }
        });
    },

}
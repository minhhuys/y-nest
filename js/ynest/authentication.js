var Auth = {

	tokenId : '',
	$formLogin : jQuery('.login_form'),
	$formRegis : jQuery('.registration_form'),

	check_mobile : '',
	check_email : '',

	init : function(){
		this.validate();
		this.checkLogin();
	},

	register : function(){
		if (!Auth.$formRegis.valid()) {
			return;
		}
		var data = {
			Email : jQuery("#registration_email").val(),
			Mobile : jQuery("#registration_mobile").val(),
			Password : jQuery("#registration_pwd").val(),
			merchantId : Configuration.ynestMerchantId
		}
		
		jQuery.ajax({
			url: "https://api.foodtalk.vn/User/Register",
			method: "POST",
			dataType: 'json',
			data: JSON.stringify(data),
			contentType: 'application/json',
			processData: false,
			beforeSend : function(){
				Loading.show();
			},
			success: function (data) {
				if(data.Success){
					Loading.hide();

					jQuery('#popup_registration').css('display','none');

					var dataLogin = {
						userName : jQuery("#registration_email").val(),
						password : jQuery("#registration_pwd").val(),
						merchantCode : 'ynest',
					}					
					jQuery.ajax({
						url: "https://api.foodtalk.vn/User/Login",
						method: "POST",
						dataType: 'json',
						data: JSON.stringify(dataLogin),
						contentType: 'application/json',
						processData: false,
						beforeSend : function(){
							Loading.show();
						},
						success: function (data) {
							if(data.Success){
								Loading.hide();
								document.cookie = "tokenId="+data.Data.tokenId;
								tokenId = jQuery.cookie('tokenId');
								window.location.href = window.location;								

							}else{
								messageDialog.show('Thông báo', "Email hoặc mật khẩu không đúng !");
								jQuery('#registration_mobile').val('');
								jQuery('#registration_email').val('');
							}
						},
						error: function (jq, status, message) {
							Loading.hide();
							waitingDialog.hide();
							messageDialog.show('Oops', "Went somthing wrong !");
						}
					})

				}else{
					messageDialog.show('Thông báo', data.Message);	
					Loading.hide();
					jQuery('#popup_registration').css('display','none');
				}
			},
			error: function () {
				alert('Error');
			}
		});
	},

	login : function(){
		if (!Auth.$formLogin.valid()) {
			return;
		}

		var data = {
			userName : jQuery('#log_email').val(),
			password : jQuery("#pwd").val(),
			merchantCode : 'ynest',
		}

		jQuery.ajax({
			url: "https://api.foodtalk.vn/User/Login",
			method: "POST",
			dataType: 'json',
			data: JSON.stringify(data),
			contentType: 'application/json',
			processData: false,
			beforeSend : function(){
				Loading.show();
			},
			success: function (data) {
				if(data.Success){
					Loading.hide();
					document.cookie = "tokenId="+data.Data.tokenId;
					tokenId = jQuery.cookie('tokenId');
					setTimeout(function(){
						messageDialog.show('Thông báo','Đăng nhập thành công!');
					}, 3000);
					window.location.href = window.location;
					jQuery('#popup_login').css('display','none');
					Auth.checkLogin();

				}else{
					Loading.hide();
					jQuery('#popup_login').css('display','none');
					jQuery('#log_email').val('');
					jQuery('#pwd').val('');
					messageDialog.show('Thông báo', "Email hoặc mật khẩu không đúng !");	
				}
			},
			error: function (jq, status, message) {
				Loading.hide();
				waitingDialog.hide();
				messageDialog.show('Oops', "Went somthing wrong !");
			}
		});
	},

	logout(){
		tokenId = jQuery.cookie('tokenId');
		if(tokenId){
			jQuery.removeCookie('tokenId');
			jQuery.removeCookie(ShoppingCart.CustomerId);
			window.location.href = window.location;
		}
	},

	checkLogin : function(){
		tokenId = jQuery.cookie('tokenId');
		if(tokenId != undefined){
			jQuery.ajax({
				url : "https://api.foodtalk.vn/User/GetUserDataByToken?tokenId="+tokenId,
				method : "GET",
				dataType: 'json',
				contentType: false,
				processData: false,
				success: function(result){
					if(result.Success){
						var data = JSON.parse(result.Message);
						jQuery('.popup_login_link').text(data.UserName).attr('href','javascript:;');
						jQuery('.popup_register_link').remove();
						jQuery('.sub-menu').append(Auth.buildItemTransaction());
						jQuery('.sub-menu').append(Auth.buildItemLogout());
					}
				},
				error: function(jq, status, message){
					alert('Error');
				}
			})
		}
	},

	validate(){

		this.$formLogin.validate({
			rules: {
				log_email : {
					required : true,
					email : true,
				},
				pwd : {
					required : true,
					minlength : 6,
				}
			},
			message : {
				log_email : {
					remote : "Email không hợp lệ"
				}
			}
		});
		
		this.$formRegis.validate({
			rules : {
				registration_email : {
					required : true,
					email : true, 
					// remote : {
					// 	url : 'https://api.labo.io/User/CheckUserExist',
					// 	type : 'POST',							
					// 	  dataType:"json",  
					// 	data :{
					// 		value : function(){
					// 			return jQuery('#registration_email').val();
					// 		},			
					// 		merchantId : function(){
					// 			return Configuration.ynestMerchantId;
					// 		},
					// 		field : function () {
					// 			return 'email';
					// 		}				
					// 	}
					// }
				},
				
				registration_mobile : {
					required : true,
					digits : true,
					minlength : 10,
					maxlength : 11,
					// remote : {
					// 	url : Configuration.apiUrl + '/User/CheckUserExist?field=mobile&value='+check_mobile+'&merchantId='+Configuration.ynestMerchantId,
					// 	type : 'GET',
					// 	success : function(data){
					// 		console.log(data);
					// 		if(data.Status){
					// 			message : {
					// 				registration_mobile : 'Email exist'
					// 			}
					// 		}
					// 	}
					// }
				},
				
				registration_pwd : {
					required : true,
					minlength : 6,
					maxlength : 16
				},
				registration_pwd2 : {
					required: true,
					minlength: 6,
					maxlength: 16,
					equalTo: registration_pwd
				},
				registration_agree : {
					required : true,
					maxlength : 1,
				}
			},
			message : {
				email : {
					remote : "Email không hợp lệ"
				},
				registration_mobile : {
					remote : "SDT khhông hợp lệ"
				},
				registration_agree : {
					required : 'Vui lòng đồng ý với điều khoản của Y-Nest',
				}
			}
		})
	},

	buildItemTransaction(){
		var build = '';
		build+='<li class="menu-item">';
		build+='	<a href="#popup_registration" class="popup_link popup_register_link icon-pencil" id="transaction_text">';
		build+='		Lịch sử giao dịch';
		build+='	</a>';
		build+='</li>';
		return build;
	},
	buildItemLogout(){
		var build = '';
		build+='<li class="menu-item">';
		build+='	<a onclick="Auth.logout()" class="popup_link popup_register_link icon-pencil" id="transaction_text" href="">';
		build+='		Đăng xuất';
		build+='	</a>';
		build+='</li>';
		return build;
	},
}
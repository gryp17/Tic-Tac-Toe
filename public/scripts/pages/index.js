$(document).ready(function () {

	//log in
	$("#login-form button").click(function () {
		
		$.ajax({
			url: "/login",
			type: "POST",
			data: $("#login-form").serialize()
		}).done(function (result) {
			if(result.user){
				window.location.href = "/lobby";
			}else{
				toastr.error(result);
			}
		});
		
	});
	
	
	//sign up and log in the user
	$("#signup-form button").click(function () {
		
		$.ajax({
			url: "/signup",
			type: "POST",
			data: $("#signup-form").serialize()
		}).done(function (result) {
			if(result.user){
				window.location.href = "/lobby";
			}else{
				toastr.error(result);
			}
		});
		
	});
	

});
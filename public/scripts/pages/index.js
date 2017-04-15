function index(){
	
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
		
		var formData = new FormData(document.getElementById("signup-form"));
		
		$.ajax({
			url: "/signup",
			type: "POST",
			enctype: "multipart/form-data",
			processData: false,
			contentType: false,
			data: formData
		}).done(function (result) {
			if(result.user){
				window.location.href = "/lobby";
			}else{
				toastr.error(result);
			}
		});
		
	});
}

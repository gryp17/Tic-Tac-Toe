$(document).ready(function () {

	
	$("#login-form button").click(function () {
		console.log("click");
		
		$.ajax({
			url: "/login",
			type: "POST",
			data: $("#login-form").serialize()
		}).done(function (result) {
			console.log(result);
			
			//TODO: fix
			if(result !== "invalid credentials"){
				window.location.href = "/lobby";
			}
			
		});
		
	});

});
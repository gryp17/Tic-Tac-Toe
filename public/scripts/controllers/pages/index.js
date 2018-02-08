function IndexController() {

	/**
	 * Login ajax request
	 */
	function login() {
		$.ajax({
			url: "/login",
			type: "POST",
			data: $("#login-form").serialize()
		}).done(function (result) {
			if (result.user) {
				window.location.href = "/lobby";
			} else {
				toastr.error(result);
			}
		});
	}

	//log in
	$("#login-form button").click(function () {
		login();
	});

	//text input handler
	$("#login-form input[type=password]").keypress(function (e) {
		if (e.which === 13) {
			login();
		}
	});


	//sign up and log in the user
	$("#signup-form .signup-btn").click(function () {

		var formData = new FormData(document.getElementById("signup-form"));

		$.ajax({
			url: "/signup",
			type: "POST",
			enctype: "multipart/form-data",
			processData: false,
			contentType: false,
			data: formData
		}).done(function (result) {
			if (result.user) {
				window.location.href = "/lobby";
			} else {
				toastr.error(result);
			}
		});

	});

	//redirect the click to the actual file input
	$(".browse-btn, .avatar-preview").click(function () {
		$(".avatar").click();
	});

	//on avatar file change generate the preview
	$(".avatar").change(function (e) {
		$(".avatar-preview").attr("src", URL.createObjectURL(e.target.files[0]));
	});

}

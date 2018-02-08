function TabsController() {

	//tabs view behaviour
	$(".tab-button").click(function () {
		$(".tab-button").removeClass("active");
		$(this).addClass("active");

		var target = $(this).attr("data-target");
		$(".tab-content").removeClass("active");
		$("#" + target).addClass("active");
	});

}
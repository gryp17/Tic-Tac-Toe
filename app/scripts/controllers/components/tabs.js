export default function TabsController() {

	//tabs view behaviour
	$('body').on('click', '.tab-button', function () {
		$('.tab-button').removeClass('active');
		$(this).addClass('active');

		var target = $(this).attr('data-target');
		$('.tab-content').removeClass('active');
		$('#' + target).addClass('active');
	});

}
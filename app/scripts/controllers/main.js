import 'bootstrap';
import 'toastr';

window.CommonController = require('@/app/scripts/controllers/common').default;
window.AudioService = require('@/app/scripts/controllers/services/audio').default;
window.GameController = require('@/app/scripts/controllers/pages/game').default;
window.IndexController = require('@/app/scripts/controllers/pages/index').default;
window.LobbyController = require('@/app/scripts/controllers/pages/lobby').default;
window.TabsController = require('@/app/scripts/controllers/components/tabs').default;
window.UserProfileModalController = require('@/app/scripts/controllers/components/user-profile-modal').default;

import '@/app/stylesheets/scss/main.scss';

$(document).ready(function () {

	//list of controllers that should be called always
	var commonControllers = [
		'Common'
	];
	
	//call the correct controller(s) depending on the data-controllers attribute
	var controllers = $('body').attr('data-controllers');
	
	if(controllers) {
		controllers = controllers.split(' ');
	}else{
		controllers = [];
	}

	controllers = commonControllers.concat(controllers);
	
	controllers.forEach(function (controller) {
		//append "Controller" to the controller name
		controller = controller+'Controller';
		
		if(window[controller]) {
			window[controller](window);
		}
	});

	
});
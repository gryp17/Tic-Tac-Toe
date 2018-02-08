$(document).ready(function (){
	
	//list of controllers that should be called always
	var commonControllers = [
		"Common"
	];
	
	//call the correct controller(s) depending on the data-controllers attribute
	var controllers = $("body").attr("data-controllers").split(" ");

	controllers = commonControllers.concat(controllers);
	
	controllers.forEach(function (controller){
		//append "Controller" to the controller name
		controller = controller+"Controller";
		
		if(window[controller]){
			window[controller](window);
		}
	});

	
});
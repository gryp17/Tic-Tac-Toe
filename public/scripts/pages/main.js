$(document).ready(function (){
	
	//call the correct function depending on the body class
	var page = $("body").attr("class");
	
	if(window[page]){
		window[page]();
	}
	
	//call the "common" code
	common();
	
});
$(document).ready(function (){
	
	//call the correct function/controller depending on the body class
	var page = $("body").attr("class");
	
	if(window[page]){
		window[page]();
	}
	
	//call the "common" and "components" code
	common();
	components();
	
});
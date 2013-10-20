function Material(m) { //color - RGB hexadecimal string, specularity 0 - 1, diffusion 0 - 1, ambience 0 - 1, shine 0 - 1, set by passing in a curly brackets array eg. {"color":"#808080","diffusion":0.5 ... etc.}
	var color = "#808080";
	var specularity = 0;
	var diffusion = 1;
	var ambience = arguments[0]["ambience"];
	var shine = 12;

	if(!(typeof m === 'undefined')){
		if(!(typeof m["color"] === 'undefined')){
			color = m["color"];
		}

		if(!(typeof m["specularity"] === 'undefined')){
			specularity = m["specularity"];
		}

		if(!(typeof m["diffusion"] === 'undefined')){
			diffusion = m["diffusion"];
		}

		if(!(typeof m["ambience"] === 'undefined')){
			ambience = m["ambience"];
		}

		if(!(typeof m["shine"] === 'undefined')){
			shine = m["shine"];
		}
	}

	this.setColor = function(a){
		color = a;
	}
	this.getColor = function(){
		return color;
	}
	this.setSpecularity = function(a){
		specularity = a;
	}
	this.getSpecularity = function(){
		return specularity;
	}
	this.setAmbience = function(a){
		ambience = a;
	}
	this.getAmbience = function(){
		return ambience;
	}
	this.setShine = function(a){
		shine = a;
	}
	this.getShine = function(){
		return shine;
	}
	this.setDiffusion = function(a){
		diffusion = a;
	}
	this.getDiffusion = function(){
		return diffusion;
	}
}


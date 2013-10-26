function Material(m) { //color - RGB hexadecimal string, specularity 0 - 1, specularMax 0 - 15, specularExponent 0 - infinity, diffusion 0 - 1, ambience 0 - 1, shine 0 - 1, set by passing in a curly brackets array eg. {"color":"#808080","diffusion":0.5 ... etc.}
	var color = "#808080";
	var specularity = 1;
	var diffusion = 1;
	var ambience = 1;
	var shine = 1;
	var specularMax = 5;
	var specularExponent = 3;
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

		if(!(typeof m["specularMax"] === 'undefined')){
			specularMax = m["specularMax"];
		}

		if(!(typeof m["specularExponent"] === 'undefined')){
			specularExponent = m["specularExponent"];
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

	this.getSpecularMax = function(){
		return specularMax;
	}

	this.setSpecularMax = function(s){
		specularMax = s;
	}

	this.getSpecularExponent = function(){
		return specularExponent;
	}

	this.setSpecularExponent = function(a){
		specularExponent = a;
	}
}


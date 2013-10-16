function Material(c,diff,amb,spec,sh) { //color, specularity 0 - 1, diffusion 0 - 1, ambience 0 - 1, shine 0 - 1
	var color = c;
	var specularity = spec;
	var diffusion = diff;
	var ambience = amb;
	var shine = shine;
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


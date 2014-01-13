define(["vector3D","vector2D"],function(Vector3D,Vector2D){
function Light(l){ //type, diffusion, specularity, pass a curly brackets array eg. {"type": "point", "diffusion": 1, "specularity": 1}
		this.diffusion = 1;
		this.specularity = 1;
		this.type = "point"; //Can be "point", "directional", or "spot" **spot light isn't made yet
		this.direction = new Vector3D(-10,-10,0);
		this.pos = new Vector3D();
		this.reach = 1;
		this.gel = {"r": 255, "g": 255, "b": 255};
		this.directionalDistance = 400;
		if(typeof l !== 'undefined'){
						
			if(typeof l.diffusion !== 'undefined'){
				this.diffusion = l.diffusion;
			}

			if(typeof l.specularity !== 'undefined'){
				this.specularity = l.specularity;
			}

			if(typeof l.type !== 'undefined'){
				this.type = l.type;
			}

		}
		
}

Light.prototype.setDiffusion = function(a){
	this.diffusion = a;
};
Light.prototype.getDiffusion = function(){
	return this.diffusion;
};
Light.prototype.setSpecularity = function(a){
	this.specularity = a;
};
Light.prototype.getSpecularity = function(){
	return this.specularity;
};
Light.prototype.setType = function(a){
	this.type = a;
};
Light.prototype.getType = function(){
	return this.type;
};
Light.prototype.setPosition = function(x,y,z){
	if(this.type != "spot" && this.type != "point") throw "Error: Light object is not a point or spot light, position cannot be defined. It is a(n) " + this.type + " light.";
	this.pos.set(x,y,z);
};
Light.prototype.getPosition = function(){
	return this.pos;
};
Light.prototype.setDirection = function(x,y,z){
	if(this.type != "directional" && this.type != "spot") throw "Error: Light object is not a directional or spot light. It is a(n) " + this.type + " light.";
	this.direction.set(x,y,z);
};
Light.prototype.getDirection = function(){
	return this.direction;
};
Light.prototype.setReach = function(r){
	this.reach = r;
};
Light.prototype.getReach = function(){
	return this.reach;
};
Light.prototype.setGel = function(a){
	this.gel.r = Math.round(a.r);
	this.gel.g = Math.round(a.g);
	this.gel.b = Math.round(a.b);
};
Light.prototype.getGel = function(){
	return this.gel;
};
Light.prototype.setGelBySaturation = function(){ // R G and B values are given as percentages of total color (or satuaturation). R + G + B = 1 is a statement that must always be true. Will fill in empty values.
	var redPerc   = arguments[0].r;
	var greenPerc = arguments[0].g;
	var bluePerc  = arguments[0].b;
	if(typeof redPerc === 'undefined'){
		if(typeof greenPerc === 'undefined'){
			redPerc   = (1 - bluePerc)/2;
			greenPerc = (1 - bluePerc)/2; 
		}else if(typeof bluePerc === 'undefined'){
			redPerc  = (1 - greenPerc)/2;
			bluePerc = (1 - greenPerc)/2;
		}else{
			redPerc = 1 - (greenPerc + bluePerc);
		}
	}else if(typeof greenPerc === 'undefined'){
		if(typeof bluePerc === 'undefined'){
			greenPerc = (1 - redPerc)/2;
			bluePerc  = (1 - redPerc)/2;
		}else{
			greenPerc = 1 - (redPerc + bluePerc);
		}
	}else if(typeof bluePerc === 'undefined'){
		bluePerc = 1 - (redPerc + greenPerc);
	}
	if(greenPerc < 0){
		greenPerc = 0;
	}
	if(redPerc < 0){
		redPerc = 0;
	}
	if(bluePerc < 0){
		bluePerc = 0;
	}
	if(redPerc + bluePerc + greenPerc != 1) throw "Error: R + G + B must be equal to 1";
	var maxPercent = Math.max(Math.max(redPerc,greenPerc),bluePerc);
	var red;
	var green;
	var blue;
	if(redPerc == maxPercent){
		red = 255;
		green = 255*greenPerc/redPerc;
		blue = 255*bluePerc/redPerc;
	}else if(greenPerc == maxPercent){
		green = 255;
		red = 255*redPerc/greenPerc;
		blue = 255*bluePerc/greenPerc;
	}else if(bluePerc == maxPercent){
		blue = 255;
		red = 255*redPerc/bluePerc;
		green = 255*greenPerc/bluePerc;
	}
	
	this.setGel({"r": red, "g": green, "b": blue});
};

Light.prototype.intensityAt = function(x,y,z) { //Returns vector with this.diffusion .at(0) and this.specularity .at(1)
	var diffusion;
	var specularity;
	if (this.type == "point") {
		var distance = this.distanceSquared(x,y,z);
		diffusion = this.getReach()*100000*this.getDiffusion()/(distance);
		specularity = 100000*this.specularity/(distance);

	}else if(this.type == "directional") {
		diffusion = this.getDiffusion();
		specularity = this.getSpecularity();
	}else if(this.type == "spot"){
		//Making this later
	}
	
	return new Vector2D(diffusion,specularity);
};

Light.prototype.directionAt = function(x,y,z) { //Returns unit vector in direction of the light
	var point = new Vector3D(x,y,z);
	var direction;
	if(this.type == "point"){
		direction = point.subtract(this.getPosition()).unit();
	}else if(this.type == "directional"){
		direction = this.getDirection().unit();
	}else if(this.type == "spot"){
		//Don't forget to add this
	}
	return direction;
};

Light.prototype.specularIntensityVector = function(x,y,z) { //Returns directional unit vector multiplied by the specular component

	return this.directionAt(x,y,z).multiply(this.getSpecularity());
};

Light.prototype.diffusionIntensityVector = function(x,y,z) { //Returns directional unit vector multiplied by the diffusion component
	return this.directionAt(x,y,z).multiply(this.intensityAt(x,y,z).at(0));

};

Light.prototype.distance = function(x,y,z) {
	var point = new Vector3D(x,y,z);
	var distance;
	if(this.type == 'point'){
		distance = this.getPosition().subtract(point).magnitude();
	}else if(this.type == 'directional'){
		distance = this.directionalDistance;
	}
	return distance;

};

Light.prototype.distanceSquared = function(x,y,z){
	var distance; //squared
	if(this.type == 'point'){
		distance = (x - this.getPosition().at(0))*(x - this.getPosition().at(0)) + (y - this.getPosition().at(1))*(y - this.getPosition().at(1)) + (z - this.getPosition().at(2))*(z - this.getPosition().at(2));
	}else if(this.type == 'directional'){
		distance = this.directionalDistance*this.directionalDistance;
	}
	return distance;
};
return Light;
});
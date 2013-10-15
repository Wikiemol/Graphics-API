function Light(t,diff,spec){ //type diffusion specularity
		var iDiff = diff;
		var iSpec = spec;
		var type; //Can be "point", "directional", or "spot" **spot light isn't made yet
		var direction = new Vector(-10,-10,0);
		if(typeof t === 'undefined'){
			type = 'point';
		}else{
			type = t;
		}
		var pos;
		this.setDiffuse = function(a){
			iDiff = a;
		};
		this.getDiffuse = function(){
			return iDiff;
		};
		this.setSpecularity = function(a){
			iSpec = a;
		};
		this.getSpecularity = function(){
			return iSpec;
		};
		this.setType = function(a){
			type = a;
		};
		this.getType = function(){
			return type;
		};
		this.setPos = function(x,y,z){
			if(type != "spot" || type != "point") throw "Error: Light object is not a point or spot light, position cannot be defined. It is a " + type + " light.";
			pos.set(x,y,z);
		};
		this.getPos = function(){
			return pos;
		};
		this.setDirection = function(x,y,z){
			if(type != "directional" || type != "spot") throw "Error: Light object is not a directional or spot light. It is a " + type + " light.";
			direction.set(x,y,z);
		};
}

Light.prototype.intensityAt = function(x,y,z) { //Returns vector with iDiff at 0 and iSpec at 1
	var point = new Vector(x,y,z);
	var iDiff;
	var iSpec;
	if (this.getType() == "point") {
		var distance = this.getPos().subtract(point).magnitude();
		iDiff = this.getDiffuse()/(distance*distance);
		iSpec = this.getSpecularity()/(distance*distance);
	}else if(this.getType() == "directional") {
		iDiff = this.getDiffuse();
		iSpec = this.getSpecularity();
	}else if(this.getType() == "spot"){
		//Making this later
	}
	return new Vector(iDiff,iSpec);
};

Light.prototype.directionAt = function(x,y,z) { //Returns unit vector in direction of the light
	var point = new Vector(x,y,z);
	var direction;
	if(this.getType() == "point"){
		direction = point.subtract(this.getPos()).unit();
	}else if(this.getType() == "directional"){
		direction = this.getDirection().unit();
	}
	return direction;
};


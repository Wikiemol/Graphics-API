function Light(l){ //type, diffusion, specularity, pass a curly brackets array eg. {"type": "point", "diffusion": 1, "specularity": 1}
		var iDiff = 1;
		var iSpec = 1;
		var type = "point"; //Can be "point", "directional", or "spot" **spot light isn't made yet
		var direction = new Vector(-10,-10,0);
		var pos = new Vector();
		var reach = 1;
		var gel = {"r": 255, "g": 255, "b": 255};
		
		if(!(typeof l === 'undefined')){
			console.log(l["diffusion"]);
			
			if(!(typeof l["diffusion"] === 'undefined')){
				iDiff = l["diffusion"];
			}

			if(!(typeof l["specularity"] === 'undefined')){
				iSpec = l["specularity"];
			}

			if(!(typeof l["type"] === 'undefined')){
				type = l["type"];
			}

		}
		
		this.setDiffusion = function(a){
			iDiff = a;
		};
		this.getDiffusion = function(){
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
		this.setPosition = function(x,y,z){
			if(type != "spot" && type != "point") throw "Error: Light object is not a point or spot light, position cannot be defined. It is a(n) " + type + " light.";
			pos.set(x,y,z);
		};
		this.getPosition = function(){
			return pos;
		};
		this.setDirection = function(x,y,z){
			if(type != "directional" && type != "spot") throw "Error: Light object is not a directional or spot light. It is a(n) " + type + " light.";
			direction.set(x,y,z);
		};
		this.setReach = function(r){
			reach = r;
		}
		this.getReach = function(){
			return reach;
		}

		this.setGel = function(a){
			gel["r"] = Math.round(a["r"]);
			gel["g"] = Math.round(a["g"]);
			gel["b"] = Math.round(a["b"]);
		}

		this.getGel = function(){
			return gel;
		}

		this.setGelBySaturation = function(){ // R G and B values are given as percentages of total color (or satuaturation). R + G + B = 1 is a statement that must always be true. Will fill in empty values.
			var redPerc   = arguments[0]["r"];
			var greenPerc = arguments[0]["g"];
			var bluePerc  = arguments[0]["b"];

			/*if(typeof g === 'undefined') { //If only red is defined, green + blue will be equal to the 1 - red;
				greenPerc  = (1 - r)/2;
				bluePerc   = (1 - r)/2;
			}else if(typeof b === 'undefined') { //If only blue is undefined, blue will be the remaining space of 1 - (r + g)
				bluePerc   = 1 - (r + g);
			}*/

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
		}
}

Light.prototype.intensityAt = function(x,y,z) { //Returns vector with iDiff .at(0) and iSpec .at(1)
	var point = new Vector(x,y,z);
	var iDiff;
	var iSpec;
	if (this.getType() == "point") {
		var distance = this.getPosition().subtract(point).magnitude();
		iDiff = this.getReach()*100000*this.getDiffusion()/(distance*distance);
		iSpec = this.getSpecularity()/(distance*distance);
	}else if(this.getType() == "directional") {
		iDiff = this.getDiffusion();
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
		direction = point.subtract(this.getPosition()).unit();
	}else if(this.getType() == "directional"){
		direction = this.getDirection().unit();
	}else if(this.getType() == "spot"){
		//Don't forget to add this
	}
	return direction;
};

Light.prototype.specularIntensityVector = function(x,y,z) { //Returns directional unit vector multiplied by the specular component
	return this.directionAt(x,y,z).multiply(this.getSpecularity());
};

Light.prototype.diffusionIntensityVector = function(x,y,z) { //Returns directional unit vector multiplied by the diffusion component
	// console.log(this.directionAt(x,y,z).multiply(this.intensityAt(x,y,z).at(0)).getVectorAsArray());
	return this.directionAt(x,y,z).multiply(this.intensityAt(x,y,z).at(0));

};

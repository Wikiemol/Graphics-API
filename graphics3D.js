function Graphics3D(context){
	this.cxt = context;
	var standard_coordinates = false;

	var sensor               = new Vector(0,0,1100);
	var focalLength          = 600;
	var lens                 = sensor.at(2) - focalLength;

	var queue                = [];

	var lights               = [];
	this.material			 = new Material("#808080",1);
	var concavePolygons      = false;
	var self = this;
	var ambientLight		 = 0;
	this.addLight = function(l,visible){
		lights.push(l);
		if(visible) {
			if(l.getType() == "directional"){
				console.warn("Warning: Directional lights cannot be shown. To get rid of this warning do not pass a visible boolean to addLight.");
			}
			var temp = this.getMaterial();
			this.setMaterial({"color":[255,128,0]});
			this.drawPrism(l.getPosition().at(0),l.getPosition().at(1),l.getPosition().at(2),10,10,10);
			this.setMaterial(temp);
		}
	}
	this.setMaterial = function(cl){
		
		// if(!(cl instanceof Array)) throw "Error: setMaterial takes Array as arguments."
		this.material = new Material({"color": cl["color"],
								"diffusion": cl["diffusion"],
								"ambience": cl["ambience"],
								"specularity": cl["specularity"],
								"shine": cl["shine"],
								"specularExponent": cl["specularExponent"],
								"specularMultiplier": cl["specularMultiplier"]});
	}
	
	this.setCoordinates = function(t){
		standard_coordinates = t;
	}
	this.getCoordinates = function(){
		return standard_coordinates;
	}
	this.setSensor = function(x,y,z){
		sensor.set(x,y,z);
		lens = z - focalLength;

	}
	this.getSensor = function(){
		return sensor;
	}
	this.setFocalLength = function(p){
		focalLength = p;
		if(focalLength <= 0){
			focalLength = 1;
		}
		lens = sensor.at(2) - focalLength;
	}
	this.getFocalLength = function(){
		return focalLength;
	}
	this.getLens = function(){
		return lens;
	}
	this.pushToQueue = function(p){
		queue.push(p);
	}
	this.setConcavePolygons = function(t){ //Allows for concave polygons to be drawn accurately. However, setting to "true" will make all polygon drawing slower.
		concavePolygons = t;
	}
	this.draw = function(t){ //lights true/false, ambience true/false, ambienceOnly true/false. Pass a curly brackets array i.e. {"lights": false, "ambience": false, "ambienceOnly": true}
		var lightIsOn = true;
		var ambienceIsOn = true;
		var ambienceOnly = false;

		if(!(typeof t === 'undefined')){
			if(!(typeof t["lights"] ==='undefined')){
				lightIsOn = t["lights"];
			}
	
			if(!(typeof t["ambience"] === 'undefined')){
				ambienceIsOn = t["ambience"];
			}

			if(!(typeof t["ambienceOnly"] === 'undefined')){
				ambienceOnly = t["ambienceOnly"];
			}
		}


		var g = new Graphics2D(this.cxt);
		
		g.setCoordinates(standard_coordinates);
		
		queue = queue.sort(function(a,b){
			var aMidPoint = a.midPoint();
			var bMidPoint = b.midPoint();
			var bDistance = Math.sqrt((sensor.at(0) - bMidPoint.at(0))*(sensor.at(0) - bMidPoint.at(0)) + 
									  (sensor.at(1) - bMidPoint.at(1))*(sensor.at(1) - bMidPoint.at(1)) +
									  (sensor.at(2) - bMidPoint.at(2))*(sensor.at(2) - bMidPoint.at(2)));

			var aDistance = Math.sqrt((sensor.at(0) - aMidPoint.at(0))*(sensor.at(0) - aMidPoint.at(0)) + 
									  (sensor.at(1) - aMidPoint.at(1))*(sensor.at(1) - aMidPoint.at(1)) +
									  (sensor.at(2) - aMidPoint.at(2))*(sensor.at(2) - aMidPoint.at(2)));
			return bDistance - aDistance;
		})

		//Calculating ambientLight
		var ambientLights = [];
		
		if(ambienceIsOn){
			for(var i = 0; i < queue.length; i++){
				if(queue[i].length != 3){
					if(createAmbientLightFor(i)){
						ambientLights.push(createAmbientLightFor(i));
					}
				}
			}


			if(ambienceOnly){
				lights = ambientLights;
			}else{
				lights = lights.concat(ambientLights);
			}
			
			// console.log(lights)
		}
		//Drawing polygons
		for(var i = 0; i < queue.length; i++){
			var a = queue[i];
			if(a instanceof Triangle3D){
				if(a.p1.at(2) < lens && a.p2.at(2) < lens && a.p3.at(2) < lens){
					var proj1 = this.projectPoint(a.p1.at(0),a.p1.at(1),a.p1.at(2));
					var proj2 = this.projectPoint(a.p2.at(0),a.p2.at(1),a.p2.at(2));
					var proj3 = this.projectPoint(a.p3.at(0),a.p3.at(1),a.p3.at(2));
					
					if(lightIsOn){
						g.setColor(applyLight(i));
					}else{
						g.setColor(a.getMaterial().getColor())
					}
					
					g.fillTriangle(proj1.at(0),proj1.at(1),proj2.at(0),proj2.at(1),proj3.at(0),proj3.at(1));
				}
			}else if(a instanceof Line3D){
				if(a.p1.at(2) < lens && a.p2.at(2) < lens){
					var proj1 = this.projectPoint(a.p1.at(0),a.p1.at(1),a.p1.at(2));
					var proj2 = this.projectPoint(a.p2.at(0),a.p2.at(1),a.p2.at(2));
					g.setColor(a.getMaterial().getColor());
					g.drawLine(proj1.at(0),proj1.at(1),proj2.at(0),proj2.at(1));
				}
			}
			
		}
		g.draw();
		queue = [];
		lights = [];
	}
	
		//console.log("0: "+queue[0]);
		//console.log("1: "+queue[1]);
	
	
	var applyLight = function(i){ //pass the item *number* in the queue not the item itself. Returns RGB color value.
		var a = queue[i];
		var midPoint		= a.midPoint();
		var specularity		= 0;
		var diffuse			= 0;
		var normal			= a.normal().unit();

		var material 		= a.getMaterial();
		var materialColor	= material.getColor();
		
		var totalGel		= {"r":0,"g":0,"b":0}; //After for loop below, this will contain the sum of r g and b respectively for all lights 
		var totalColor		= 0; //Will contain sum of all color values without discriminating r g and b components
		var viewPointVector = new Vector(0,0,0); //Vector between midpoint and viewPoint
		viewPointVector = viewPointVector.add(midPoint.subtract(self.getSensor())).unit();


		for(var i = 0; i < lights.length; i++){ //totaling light contributions

			/**Calculate Specularity**/
			var specularLight = lights[i].specularIntensityVector(midPoint.at(0),midPoint.at(1),midPoint.at(2)).multiply(1);

			var lightReflection = specularLight.add(normal.unit().multiply(normal.unit().dot(specularLight)).subtract(specularLight).multiply(2));

			if(lightReflection.dot(viewPointVector)*material.getSpecularity() > 0){
				specularity += lightReflection.dot(viewPointVector)*material.getSpecularity()*(400/lights[i].distance(midPoint.at(0),midPoint.at(1),midPoint.at(2)));
			}

			/**Calculate Diffusion**/

			var diffusionLight = lights[i].diffusionIntensityVector(midPoint.at(0),midPoint.at(1),midPoint.at(2));

			if(diffusionLight.dot(normal)*material.getDiffusion() >= 0){ //checks if diffusion is greater than 0, if so it will take it into account

				diffuse += diffusionLight.dot(normal)*material.getDiffusion(); //diffusion contribution is equal to the dot product of the light vector and the normal multiplied by the diffusion component of the material
			}

			/**Calculate color contribution (totalgel contribution)**/
			totalGel["r"] += lights[i].getGel()["r"]*lights[i].intensityAt(midPoint.at(0),midPoint.at(1),midPoint.at(2)).at(0);
			totalGel["g"] += lights[i].getGel()["g"]*lights[i].intensityAt(midPoint.at(0),midPoint.at(1),midPoint.at(2)).at(0);
			totalGel["b"] += lights[i].getGel()["b"]*lights[i].intensityAt(midPoint.at(0),midPoint.at(1),midPoint.at(2)).at(0);

			totalColor += (lights[i].getGel()["r"] + lights[i].getGel()["g"] + lights[i].getGel()["b"])*diffusionLight.magnitude();
		}

		
		var rRatio = 3*totalGel["r"]/totalColor;
		var gRatio = 3*totalGel["g"]/totalColor;
		var bRatio = 3*totalGel["b"]/totalColor;


		if(diffuse < 0){
			diffuse = 0;
		}else if( diffuse > 1){
			diffuse = 1;
		}
		
		/*** calculating color ***/

		var red = materialColor[0];
		var green = materialColor[1];
		var blue = materialColor[2];
		
		red *= diffuse*rRatio;
		green *= diffuse*gRatio;
		blue *= diffuse*bRatio;

		red += Math.pow(specularity*material.getSpecularMultiplier(),material.getSpecularExponent());
		green += Math.pow(specularity*material.getSpecularMultiplier(),material.getSpecularExponent());
		blue += Math.pow(specularity*material.getSpecularMultiplier(),material.getSpecularExponent());

		if(red > 255){ 
			red = 255;
		}

		if(blue > 255){
			blue = 255;
		}

		if(green > 255){
			green = 255;
		}

		var color = [red,green,blue];
		
		return color;

	}

	var createAmbientLightFor = function(a){ //creates a light to simulate light bouncing off of faces in space. The intensity of bounce depends on shine component

		if(queue[a][queue[a].length-1].getShine() == 0){ //If no shine component for material then there is no need to create a new light
			return false;
		}
		var materialColor  = queue[a][queue[a].length-1].getColor();
		var side1          = queue[a][0].subtract(queue[a][1]);
		var side2          = queue[a][2].subtract(queue[a][1]);
		var normal         = side1.cross(side2).unit();
		// console.log(normal.getVectorAsArray());
		var midPoint = new Vector(0,0,0);
		for(var i = 0; i < queue[a].length-1; i++){ //calculating midPoint
			midPoint = midPoint.add(new Vector(queue[a][i].at(0),queue[a][i].at(1),queue[a][i].at(2)));
		}
		
		// console.log(midPoint.getVectorAsArray())

		var diffuse = 0;

		for(var i = 0; i < lights.length; i++){
			var diffusionLight = lights[i].diffusionIntensityVector(midPoint.at(0),midPoint.at(1),midPoint.at(2));
				 diffuse += diffusionLight.dot(normal)*queue[a][queue[a].length - 1].getShine(); //diffusion contribution is equal to the dot product of the light vector and the normal multiplied by the diffusion component of the material
				 // console.log(queue[a][queue[a].length - 1].getShine());
			

		}

		
		// console.log("red: " + red + " | green: " + green + " | blue: " + blue);

		if(diffuse < 0){
			diffuse = 0;
		}else if( diffuse > 1){
			diffuse = 1;
		}

		//diffuse *= queue[a][queue[a].length-1].getShine();
		
		console.log(diffuse)
		var shineLight = new Light({"type": "point","diffusion": diffuse});
		shineLight.setPosition(midPoint.at(0),midPoint.at(1),midPoint.at(2))
		shineLight.setGel({"r": materialColor[0], "g": materialColor[1], "b": materialColor[2]});

		
		return shineLight;
	}
	
	function sensorDistance(x,y,z){
		var distance = Math.sqrt((x-sensor.at(0))*(x-sensor.at(0)) + (y-sensor.at(1))*(y-sensor.at(1)) + (z-sensor.at(2))*(z-sensor.at(2)));
		
		return distance;
	}
}

Graphics3D.prototype.getMaterial = function(){
	return this.material;
}	

Graphics3D.prototype.projectPoint = function(x_1,y_1,z_1){ //Takes a point in 3d space
	var t1 = (this.getLens()-this.getSensor().at(2))/(this.getSensor().at(2) - z_1); //the t derived from the z component of the parametric line between the point to be projected and the sensor assuming the line intersects the lens, the lens is flat, and the lens is parallel to the xy plane
	var x1 = this.getSensor().at(0)+this.getSensor().at(0)*t1-t1*x_1; //x component of the parametric line between the point to be projected and the sensor
	var y1 = this.getSensor().at(1)+this.getSensor().at(1)*t1-t1*y_1; //y component of the parametric line between the point to be projected and the sensor
	
	return new Vector(x1-this.getSensor().at(0),y1-this.getSensor().at(1));
}

Graphics3D.prototype.inverseProjectPoint = function(x_1,y_1,z_1){ //with a given z (z_1) value and the already projected x (x_1) and y (y_1) on the 2d plane, this finds the original x and y that were projected from 3d space onto the plane 
	var t1 = this.getLens()/(this.getSensor().at(2) - z_1);
	var x1 = x_1/t1;
	var y1 = y_1/t1;
	
	return [x1,y1];
}

Graphics3D.prototype.drawLine = function(x1,y1,z1,x2,y2,z2){
	var p1 = new Vector(x1,y1,z1);
	var p2 = new Vector(x2,y2,z2);

	var line = new Line3D(p1,p2,this.getMaterial());
	this.pushToQueue(line);

}

Graphics3D.prototype.drawPrism = function(x,y,z,w,h,d){
	this.drawLine(x-(w/2),y-(h/2),z-(d/2),x+(w/2),y-(h/2),z-(d/2)); //Bottom back line
	this.drawLine(x-(w/2),y-(h/2),z+(d/2),x+(w/2),y-(h/2),z+(d/2)); //Bottom front line
	this.drawLine(x-(w/2),y-(h/2),z+(d/2),x-(w/2),y-(h/2),z-(d/2)); //Bottom left line
	this.drawLine(x+(w/2),y-(h/2),z+(d/2),x+(w/2),y-(h/2),z-(d/2)); //Bottom right line

	this.drawLine(x-(w/2),y+(h/2),z-(d/2),x+(w/2),y+(h/2),z-(d/2)); //Top back line
	this.drawLine(x-(w/2),y+(h/2),z+(d/2),x+(w/2),y+(h/2),z+(d/2)); //Top front line
	this.drawLine(x-(w/2),y+(h/2),z+(d/2),x-(w/2),y+(h/2),z-(d/2)); //Top left line
	this.drawLine(x+(w/2),y+(h/2),z+(d/2),x+(w/2),y+(h/2),z-(d/2)); //Top right line

	this.drawLine(x-(w/2),y-(h/2),z-(d/2),x-(w/2),y+(h/2),z-(d/2)); //Back left line
	this.drawLine(x-(w/2),y-(h/2),z+(d/2),x-(w/2),y+(h/2),z+(d/2)); //Front left line
		
		  //	 0     , -100  , 0     , 0     , 100   ,  0
	this.drawLine(x+(w/2),y-(h/2),z-(d/2),x+(w/2),y+(h/2),z-(d/2)); //Back right line
	this.drawLine(x+(w/2),y-(h/2),z+(d/2),x+(w/2),y+(h/2),z+(d/2)); //Front right line
	
}

Graphics3D.prototype.fillTriangle = function(x1,y1,z1,x2,y2,z2,x3,y3,z3){
	if(typeof this.getMaterial() === 'undefined') console.warn("Warning material undefined.");
	var triangle = new Triangle3D(new Vector(x1,y1,z1),new Vector(x2,y2,z2),new Vector(x3,y3,z3),this.getMaterial());
	this.pushToQueue(triangle);
}

Graphics3D.prototype.fillPolygon = function(a){ 
		if(typeof this.getMaterial() === 'undefined') console.warn("Warning material undefined."); 
		if(a.length%3 != 0) throw "Error: Incorrect argument length in fillPolygon. Length of argument must be divisible by 3."
		if(a.length/3 <= 2) throw "Error: Polygons must have at least 3 vertices."

		var polygon = [];
		var midpoint = new Vector(0,0,0);
		var material = this.getMaterial();
		for(var i = 0; i < a.length/3; i++){
			polygon[i] = new Vector(a[i*3],a[i*3 + 1],a[i*3 + 2]);
			midpoint = midpoint.add(polygon[i].multiply(3/a.length));
		}
 
		for(var i = 0; i < polygon.length - 1; i++){
			this.pushToQueue(new Triangle3D(polygon[i],polygon[i+1],midpoint,material));
		}
		
		this.pushToQueue(new Triangle3D(polygon[polygon.length - 1], polygon[0],midpoint,material));
}



Graphics3D.prototype.drawGrid = function() {
	var temp = this.getMaterial();
	this.setMaterial(new Material("#808080"));
	for(var i = 0; i <= 10; i++){
		this.drawLine(-300+i*60,0,300,-300+i*60,0,-300);
	}
	for(var i = 0; i <= 10; i++){
		this.drawLine(-300,0,-300+i*60,300,0,-300+i*60);
	}
	
	this.setMaterial(temp);
};

Graphics3D.prototype.fillPrism = function(x,y,z,w,h,d,xr,yr,zr) { //center point x y and z - width height and depth - rotation about x, y and z axis with respect to center point
	if(typeof xr === 'undefined') { xr = 0; yr = 0; zr = 0; }
	else if(typeof yr === 'undefined') {yr = 0; zr = 0;}
	else if(typeof zr === 'undefined') {zr = 0;}
	var center = new Vector(x,y,z);
	var rotationX = new Matrix('rx',xr);
	var rotationY = new Matrix('ry',yr);
	
	var rotationZ = new Matrix('rz',zr);

	var top = [rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(w/2,h/2,-d/2)))).add(center),
			   rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(-w/2,h/2,-d/2)))).add(center),
			   rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(-w/2,h/2,d/2)))).add(center),
			   rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(w/2,h/2,d/2)))).add(center)];

	var bottom = [rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(w/2,-h/2,-d/2)))).add(center),
				  rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(-w/2,-h/2,-d/2)))).add(center),
				  rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(-w/2,-h/2,d/2)))).add(center),
				  rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(w/2,-h/2,d/2)))).add(center)];

	this.fillPolygon([top[0].at(0),top[0].at(1),top[0].at(2), //Top
					 top[1].at(0),top[1].at(1),top[1].at(2),
					 top[2].at(0),top[2].at(1),top[2].at(2),
					 top[3].at(0),top[3].at(1),top[3].at(2)]);

	this.fillPolygon([bottom[3].at(0),bottom[3].at(1),bottom[3].at(2), //Bottom
					 bottom[2].at(0),bottom[2].at(1),bottom[2].at(2),
					 bottom[1].at(0),bottom[1].at(1),bottom[1].at(2),
					 bottom[0].at(0),bottom[0].at(1),bottom[0].at(2)]);

	for(var i = 0; i < 4; i++){
		this.fillPolygon([
						 bottom[i%4].at(0),bottom[i%4].at(1),bottom[i%4].at(2),
						 bottom[(i+1)%4].at(0),bottom[(i+1)%4].at(1),bottom[(i+1)%4].at(2),
						 top[(i+1)%4].at(0),top[(i+1)%4].at(1),top[(i+1)%4].at(2),
						 top[i%4].at(0),top[i%4].at(1),top[i%4].at(2)
						 ]);
	}
};

Graphics3D.prototype.fillEllipsoid = function(x,y,z,xRadius,yRadius,zRadius,xr,yr,zr,divisions) {
	var divisions = divisions; //if we want n divisions, divisions must equal n/2
	var stretchX  = xRadius/100;
	var stretchY  = yRadius/100;
	var stretchZ  = zRadius/100;
	var rx = new Matrix('rx',xr);
	var ry = new Matrix('ry',yr);
	var rz = new Matrix('rz',zr);
	
	for(var i = 0; i <= divisions; i++){
		// no stretch is a sphere with a radius of 100
		var z1 = (i)*100/divisions;
		var z2 = (i+1)*100/divisions;
		// x^2 + y^2 = 100 - z^2
		for(var j = 0; j <= 2*divisions; j++){
			
			var p1 = new Vector(stretchX*Math.sqrt(100*100-z1*z1)*Math.cos(j*2*Math.PI/(2*divisions)), //x 
								stretchY*Math.sqrt(100*100-z1*z1)*Math.sin(j*2*Math.PI/(2*divisions)), //y
								stretchZ*z1);													  //z
			
			var p2 = new Vector(stretchX*Math.sqrt(100*100-z1*z1)*Math.cos((j+1)*2*Math.PI/(2*divisions)), //x
								stretchY*Math.sqrt(100*100-z1*z1)*Math.sin((j+1)*2*Math.PI/(2*divisions)), //y
								stretchZ*z1);														  //z
			
			var p3 = new Vector(stretchX*Math.sqrt(100*100-z2*z2)*Math.cos((j+1)*2*Math.PI/(2*divisions)), //x
								stretchY*Math.sqrt(100*100-z2*z2)*Math.sin((j+1)*2*Math.PI/(2*divisions)), //y
								stretchZ*z2);														  //z

			var p4 = new Vector(stretchX*Math.sqrt(100*100-z2*z2)*Math.cos((j)*2*Math.PI/(2*divisions)), //x
								stretchY*Math.sqrt(100*100-z2*z2)*Math.sin((j)*2*Math.PI/(2*divisions)), //y
								stretchZ*z2);														//z

			var p5 = new Vector(-stretchX*Math.sqrt(100*100-z1*z1)*Math.cos(j*2*Math.PI/(2*divisions)), //x 
								stretchY*Math.sqrt(100*100-z1*z1)*Math.sin(j*2*Math.PI/(2*divisions)), //y
								-stretchZ*z1);													  //z
			
			var p6 = new Vector(-stretchX*Math.sqrt(100*100-z1*z1)*Math.cos((j+1)*2*Math.PI/(2*divisions)), //x
								stretchY*Math.sqrt(100*100-z1*z1)*Math.sin((j+1)*2*Math.PI/(2*divisions)), //y
								-stretchZ*z1);														  //z
			
			var p7 = new Vector(-stretchX*Math.sqrt(100*100-z2*z2)*Math.cos((j+1)*2*Math.PI/(2*divisions)), //x
								stretchY*Math.sqrt(100*100-z2*z2)*Math.sin((j+1)*2*Math.PI/(2*divisions)), //y
								-stretchZ*z2);														  //z

			var p8 = new Vector(-stretchX*Math.sqrt(100*100-z2*z2)*Math.cos((j)*2*Math.PI/(2*divisions)), //x
								stretchY*Math.sqrt(100*100-z2*z2)*Math.sin((j)*2*Math.PI/(2*divisions)), //y
								-stretchZ*z2);
			/***Rotation transforms***/

			var rp1 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p1)))
			var rp2 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p2)))
			var rp3 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p3)))
			var rp4 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p4)))

			var rp5 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p5)))
			var rp6 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p6)))
			var rp7 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p7)))
			var rp8 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p8)))

			this.fillPolygon([rp1.at(0) + x,rp1.at(1) + y,rp1.at(2) + z,
							  rp2.at(0) + x,rp2.at(1) + y,rp2.at(2) + z,
							  rp3.at(0) + x,rp3.at(1) + y,rp3.at(2) + z,
							  rp4.at(0) + x,rp4.at(1) + y,rp4.at(2) + z]);
			this.fillPolygon([rp5.at(0) + x,rp5.at(1) + y,rp5.at(2) + z,
							  rp6.at(0) + x,rp6.at(1) + y,rp6.at(2) + z,
							  rp7.at(0) + x,rp7.at(1) + y,rp7.at(2) + z,
							  rp8.at(0) + x,rp8.at(1) + y,rp8.at(2) + z]);
		}
	}

};
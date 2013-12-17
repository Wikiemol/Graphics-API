function RayTracer(cxt){
	this.cxt = cxt;
	this.sensor 		= new Vector3D(0,0,1100);
	this.focalLength 	= 600;
	this.lens 			= this.sensor.at(2) - this.focalLength;
	this.lights			= [];
	this.objects		= [];	
}

function Sphere(x,y,z,r,m){
	this.position = new Vector3D(x,y,z)
	this.radius   = r;
	this.material = m;
}
/*intersect –– if line created by v - sensor intersects the sphere return an 
 *array [point of intersection,distance of intersection to sensor Squared,material] 
 *else return false
 */

Sphere.prototype.intersect = function(ray){
	var direction = ray.direction;
	var origin    = ray.origin;

	var A = direction.dot(direction);
	var B = direction.dot(origin) - direction.dot(this.position);
	var C = origin.dot(origin) + origin.dot(this.position) + this.position.dot(this.position) - this.radius*this.radius;

	var discriminant = B*B - 4*A*C

	if(discriminant < 0){
		// console.log(B*B)
		return false;
	}else{
		var sqrt = Math.sqrt(discriminant);
		var t1 = (-B + sqrt)/2*A;
		var t2 = (-B - sqrt)/2*A;

		var intersection1 = direction.multiply(t1).add(origin);
		var intersection2 = direction.multiply(t2).add(origin);
		if(Math.abs(t1) > Math.abs(t2)){
			var normal = intersection2.subtract(this.position);
			return {"intersection": intersection2, 
					"distance": intersection2.subtract(origin).magnitudeSquared(), 
					"material":this.material, 
					"normal": this.normal.multiply(-1)}
		}else{
			var normal = intersection1.subtract(this.position);
			return {"intersection": intersection1, 
					"distance": intersection1.subtract(origin).magnitudeSquared(), 
					"material":this.material, 
					"normal": this.normal.multiply(-1)}
		}
	}
}
function Plane(p,n,m){ //p is a point on the plane, n is the normal to the plane, and m is the material of the plane;
	this.point = p;
	this.normal = n;
	this.material = m;
}

Plane.prototype.intersect = function(ray) {
		var direction = ray.direction;
		var origin    = ray.origin;
		// console.log(this.normal)
		var t = -(origin.subtract(this.point).dot(this.normal))/(direction.subtract(origin).dot(this.normal));
		var x = t*(direction.at(0) - origin.at(0)) + origin.at(0);
		var y = t*(direction.at(1) - origin.at(1)) + origin.at(1);
		var z = t*(direction.at(2) - origin.at(2)) + origin.at(2);

		if(x < 100 && x > -100 && z <100 && z > -100){
			var intersect = new Vector3D(x,y,z);
			var distance  = origin.subtract(intersect).magnitudeSquared();
			return {"intersection": intersect, "distance": distance, "material":this.material, "normal": this.normal.multiply(-1)}	
		}else{
			return false;
		}
		
};

RayTracer.prototype.sphere = function(x,y,z,r,m) { //x,y,z is center, r is radius, m is material
	var s = new Sphere(x,y,z,r,m);
	this.objects.push(s);
};

RayTracer.prototype.plane = function(x,y,z,n,m) { //x,y,z is point on the plane, n is normal, m is material
	var p = new Vector3D(x,y,z);
	var plane = new Plane(p,n,m);
	this.objects.push(plane);
}
RayTracer.prototype.trace = function() {
	var widthhalf = this.cxt.canvas.width/2;
	var heighthalf = this.cxt.canvas.width/2;
	var g = new Graphics2D(this.cxt);
	for(var i = -widthhalf; i < widthhalf; i++){
		for(var j = -heighthalf; j < heighthalf; j++){
			var ray = {"direction": new Vector3D(i-this.sensor.at(0),j - this.sensor.at(1),this.lens - this.sensor.at(2)),"origin":this.sensor};
			// console.log(ray.direction.dot(ray.origin))
			var intersect = false;
			for(var k = 0; k < this.objects.length; k++){
				var temp = this.objects[k].intersect(ray);
				if(temp && (!intersect || temp.distance < intersect.distance)){
					intersect = temp;
				}
			}
			if(intersect){
				var color = this.applyLight(intersect.intersection,intersect.normal,intersect.material)
				g.drawPixel(i,j,color);
			}

		}
	}
	g.draw();
};

RayTracer.prototype.applyLight = function(p,normal,material){ //Pass point normal and material, Returns RGB color value.
	// return [255,255,255]
	var point 			= p;
	var specularity		= 0;
	var diffuse			= 0;
	var normal			= normal.unit();
	var material 		= material;
	var materialColor	= material.getColor();

	var totalGel		= {"r":0,"g":0,"b":0}; //After for loop below, this will contain the sum of r g and b respectively for all lights 
	var totalColor		= 0; //Will contain sum of all color values without discriminating r g and b components
	var viewPointVector = new Vector3D(0,0,0); //Vector between point and viewPoint
	viewPointVector = viewPointVector.add(point.subtract(this.sensor)).unit();
	var lightsLength = this.lights.length;
	for(var i = 0; i < lightsLength; i++){ //totaling light contributions
		/**Calculate Specularity**/
		var specularLight = this.lights[i].specularIntensityVector(point.at(0),point.at(1),point.at(2)).multiply(1);

		var lightReflection = specularLight.add(normal.unit().multiply(normal.unit().dot(specularLight)).subtract(specularLight).multiply(2));

		if(lightReflection.dot(viewPointVector)*material.getSpecularity() > 0){
			
			specularity += lightReflection.dot(viewPointVector)*material.getSpecularity()*(400/this.lights[i].distance(point.at(0),point.at(1),point.at(2)));

		}
		
		/**Calculate Diffusion**/
		var diffusionLight = this.lights[i].diffusionIntensityVector(point.at(0),point.at(1),point.at(2));
		var diffuseAdd = diffusionLight.dot(normal)*material.getDiffusion();
		if(diffuseAdd >= 0){ //checks if diffusion is greater than 0, if so it will take it into account
			diffuse += diffuseAdd; //diffusion contribution is equal to the dot product of the light vector and the normal multiplied by the diffusion component of the material
		}

		/**Calculate color contribution (totalgel contribution)**/
		var intensity = this.lights[i].intensityAt(point.at(0),point.at(1),point.at(2)).at(0);

		totalGel["r"] += this.lights[i].getGel()["r"]*intensity;
		totalGel["g"] += this.lights[i].getGel()["g"]*intensity;
		totalGel["b"] += this.lights[i].getGel()["b"]*intensity;

		totalColor += (this.lights[i].getGel()["r"] + this.lights[i].getGel()["g"] + this.lights[i].getGel()["b"])*diffusionLight.magnitude();
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
	var colorSum = 1/(red + green + blue);
	
	red *= diffuse*rRatio;
	green *= diffuse*gRatio;
	blue *= diffuse*bRatio;
	
	var specComponent = Math.pow(specularity*material.getSpecularMultiplier(),material.getSpecularExponent());

	red += specComponent*materialColor[0]*colorSum;
	green += specComponent*materialColor[1]*colorSum;
	blue += specComponent*materialColor[2]*colorSum;
	
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

RayTracer.prototype.projectPoint = function(x_1,y_1,z_1){ //Takes a point in 3d space
	var t1 = (this.getLens()-this.sensor.at(2))/(this.sensor.at(2) - z_1); //the t derived from the z component of the parametric line between the point to be projected and the sensor assuming the line intersects the lens, the lens is flat, and the lens is parallel to the xy plane
	var x1 = this.sensor.at(0)+this.sensor.at(0)*t1-t1*x_1; //x component of the parametric line between the point to be projected and the sensor
	var y1 = this.sensor.at(1)+this.sensor.at(1)*t1-t1*y_1; //y component of the parametric line between the point to be projected and the sensor
	return new Vector2D(x1-this.sensor.at(0),y1-this.sensor.at(1));
};
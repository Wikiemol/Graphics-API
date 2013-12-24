function RayTracer(cxt){
	this.WIDTH = cxt.canvas.width;
	this.HEIGHT = cxt.canvas.height;
	this.cxt = cxt;
	this.sensor 		= new Vector3D(0,0,1100);
	this.focalLength 	= 600;
	this.lens 			= this.sensor.at(2) - this.focalLength;
	this.lights			= [];
	this.objects		= [];	
	this.ambience		= 0.2
	this.imgData 		= this.cxt.getImageData(0,0,this.WIDTH,this.HEIGHT);
	this.cdata			= this.imgData.data;
	this.materialData	= [];
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
	var op = origin.subtract(this.position);
	var A = direction.dot(direction);
	var B = 2*(direction.dot(op)); 
	var C = op.dot(op) - this.radius*this.radius;
	var discriminant = B*B - 4*A*C
	// console.log(origin)
	if(discriminant < 0){
		return false;
	}else{ //if 
		var sqrt = Math.sqrt(discriminant);
		var t1 = (-B + sqrt)/(2*A);
		var t2 = (-B - sqrt)/(2*A);
		// console.log(sqrt)
		var intersection1 = direction.multiply(t1).add(origin);
		var intersection2 = direction.multiply(t2).add(origin);
		if(Math.abs(t1) > Math.abs(t2) && t2 > 0 && (!ray.shadow || t2 < 0.999999)){ /*Theoretically, this value (0.99999) 
																						should be 1. However, making it 1 creates 
																						an extremely interesting mandala-like effect 
																						on the spheres. I would like to find out why.*/
			var normal = this.position.subtract(intersection2);
			// console.log(normal.at(0) + "," + normal.at(1) + "," + normal.at(2))
			return {"intersection": intersection2, 
					"distance": intersection2.subtract(origin).magnitudeSquared(), 
					"material":this.material, 
					"normal": normal.unit(),
					"t": t2,
					"type": "sphere"}
		}else if(t1 > 0 && (!ray.shadow || t1 < 0.999999)){
			
			var normal = intersection1.subtract(this.position);
			return {"intersection": intersection1, 
					"distance": intersection1.subtract(origin).magnitudeSquared(), 
					"material":this.material, 
					"normal": normal.unit(),
					"t": t1,
					"type": "sphere"}
		}else{
			return false
		}
	}
}
function Plane(x,y,z,n,m,w,h){ //p is a point on the plane, n is the normal to the plane, and m is the material of the plane;
	this.point = new Vector3D(x,y,z);
	this.normal = n;
	this.material = m;
	this.width = w;
	this.height = h;
}

Plane.prototype.intersect = function(ray) {
		var direction = ray.direction;
		var origin    = ray.origin;
		var dor = direction.subtract(origin)
		// console.log(this.normal)
		var t = -(origin.subtract(this.point).dot(this.normal))/(direction.dot(this.normal));
		// var t = (this.normal.multiply(-1).dot(origin.subtract(this.point)))/(this.normal.dot(dor))

		//if denominator is non 0 and (if it is a shadow cast) the point is between the origin and direction vector
		var intersect = direction.multiply(t).add(origin);
		// if(intersect != origin && direction.subtract(origin).dot(this.normal) != 0 && (!ray.shadow || (t < 0 && t > -1))){
		if(intersect.at(2) < direction.add(origin).at(2) && direction.dot(this.normal) != 0 && t > 0 && (!ray.shadow || t < 1)) {	
			var distance  = origin.subtract(intersect).magnitudeSquared();
			// console.log(t)
			return {"intersection": intersect, 
					"distance": distance, 
					"material":this.material, 
					"normal": this.normal.multiply(-1).unit(),
					"t": t,
					"type": "plane"}	
		}else{
			return false;
		}
		
};

RayTracer.prototype.sphere = function(x,y,z,r,m) { //x,y,z is center, r is radius, m is material
	var s = new Sphere(x,y,z,r,m);
	this.objects.push(s);
};

RayTracer.prototype.plane = function(x,y,z,n,m) { //x,y,z is point on the plane, n is normal, m is material
	var plane = new Plane(x,y,z,n,m);
	this.objects.push(plane);
}
RayTracer.prototype.trace = function() {
	for(var x = -this.WIDTH/2 + this.sensor.at(0); x < this.WIDTH/2 + this.sensor.at(0); x++){
		for(var y = -this.HEIGHT/2 + this.sensor.at(1); y < this.HEIGHT/2 + this.sensor.at(1); y++){
			var ray = {"direction": new Vector3D(x - this.sensor.at(0),y - this.sensor.at(1),this.lens - this.sensor.at(2)), "origin": this.sensor}
			var intersect = this.cast(ray);
			if(intersect && intersect.intersection.at(2) < this.lens){
				var illumination = this.ambience;
				var reflectionRay = {"direction": intersect.normal.unit().multiply(2*(ray.direction.unit().dot(intersect.normal))).subtract(ray.direction), "origin": intersect.intersection}
				var reflection    = this.cast(reflectionRay);
				for(var i = 0; i < this.lights.length; i++){
					var shadowRay = {"direction": intersect.intersection.subtract(this.lights[i].pos), "origin": this.lights[i].pos, "shadow": true};
					var cast = this.cast(shadowRay);
					if(!cast){
						illumination += this.illuminate(intersect.intersection,intersect.normal,intersect.material,this.lights[i]);
					}
				}

				var red 	= intersect.material.c[0]*illumination;
				var blue	= intersect.material.c[1]*illumination;
				var green	= intersect.material.c[2]*illumination;
				this.drawPixel(x - this.sensor.at(0),y - this.sensor.at(1),[red,blue,green],intersect.material.c);
			}
		}
	}
	this.cxt.putImageData(this.imgData,0,0);
};

RayTracer.prototype.bounce = function(ray,currentIllumination,numberOfBounces) {
	var intersect = this.cast(ray);
	var distance = ray.origin.subtract(intersect.intersection).magnitudeSquared(); //distance between ray origin and point intersected
	var isSeen = false;
};

RayTracer.prototype.drawPixel = function(x1,y1,color,materialColor){
	var	x = x1+this.WIDTH/2;
	var	y = -y1+this.HEIGHT/2;
	
	if(x < this.WIDTH && x >= 0 && y < this.HEIGHT && y >= 0){
		var point = (x+y*this.WIDTH)*4;

		this.cdata[point + 0] = color[0]; //r
		this.cdata[point + 1] = color[1]; //g
		this.cdata[point + 2] = color[2]; //b
		this.cdata[point + 3] = 255; //a

		this.materialData[(x+y*this.WIDTH)] = materialColor; 
	}
}
RayTracer.prototype.cast = function(ray){
	var intersect = false; 
	for(var k = 0; k < this.objects.length; k++){
		var temp = this.objects[k].intersect(ray);
		if(temp && (!intersect || temp.distance < intersect.distance) && (temp.intersection.vectorArray != ray.origin.vectorArray) ){
			intersect = temp;
		}
	}
	return intersect
}
RayTracer.prototype.illuminate = function(point,normal,material,light){
	var normal = normal;
	var illumination = 0;
	var specularLight = light.specularIntensityVector(point.at(0),point.at(1),point.at(2))
	var specularIntensity = light.intensityAt(point.at(0),point.at(1),point.at(2)).at(1);
	var diffusionIntensity = light.intensityAt(point.at(0),point.at(1),point.at(2)).at(0);
	var Lm = point.subtract(light.pos).unit();
	var lightReflection = Lm.reflectOver(normal);
	if(Lm.dot(normal) > 0){
		illumination += light.diffusion*(Lm.dot(normal))*diffusionIntensity					
	}
	if(lightReflection.dot(point.subtract(this.sensor)) > 0){
		illumination += light.specularity*Math.pow((lightReflection.dot(point.subtract(this.sensor).unit())),material.shine)*specularIntensity
	}

	return illumination;
}
RayTracer.prototype.projectPoint = function(x_1,y_1,z_1){ //Takes a point in 3d space
	var t1 = (this.getLens()-this.sensor.at(2))/(this.sensor.at(2) - z_1); //the t derived from the z component of the parametric line between the point to be projected and the sensor assuming the line intersects the lens, the lens is flat, and the lens is parallel to the xy plane
	var x1 = this.sensor.at(0)+this.sensor.at(0)*t1-t1*x_1; //x component of the parametric line between the point to be projected and the sensor
	var y1 = this.sensor.at(1)+this.sensor.at(1)*t1-t1*y_1; //y component of the parametric line between the point to be projected and the sensor
	return new Vector2D(x1-this.sensor.at(0),y1-this.sensor.at(1));
};
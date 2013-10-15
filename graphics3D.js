function Graphics3D(context){
	this.cxt = context;
	var material;
	var standard_coordinates = false;
	var sensor = new Vector(0,0,1100);
	var focalLength = 600;
	var lens = sensor.at(2) - focalLength;
	var queue    = [];
	
	var concavePolygons = false;
	var lightVector = new Vector(-10,-10,-10);
	var lightIntensity = 200;
	var self = this;
	
	this.setMaterial = function(cl){
		material = cl;
	}
	
	this.getMaterial = function(){
		return material;
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
	this.setConcavePolygons = function(t){ //Allows for concave polygons to be drawn accurately. Setting to "true" will make all polygon drawing slower.
		concavePolygons = t;
	}
	this.setLightVector = function(a,b,c){
		lightVector.set(a,b,c);
	}
	this.draw = function(){
		var g = new Graphics2D(this.cxt);
		
		g.setCoordinates(standard_coordinates);

		this.sortQueue();
		
		for(var i = 0; i < queue.length; i++){
			if(queue[i].length == 4){
				
				var p1 	  = queue[i][0];
				var p2	  = queue[i][1];
				var p3	  = queue[i][2];
				
				if(p1.at(2) < lens && p2.at(2) < lens && p3.at(2) < lens){
					var proj1 = this.projectPoint(p1.at(0),p1.at(1),p1.at(2));
					var proj2 = this.projectPoint(p2.at(0),p2.at(1),p2.at(2));
					var proj3 = this.projectPoint(p3.at(0),p3.at(1),p3.at(2));
					
					//applyLight(i);
					
					g.setColor(queue[i][3].getColor());
					g.fillTriangle(proj1.at(0),proj1.at(1),proj2.at(0),proj2.at(1),proj3.at(0),proj3.at(1));
				}
			}else if(queue[i].length == 3){
				
				var p1 	  = queue[i][0];
				var p2	  = queue[i][1];
				
				if(p1.at(2) < lens && p2.at(2) < lens){
					var proj1 = this.projectPoint(p1.at(0),p1.at(1),p1.at(2));
					var proj2 = this.projectPoint(p2.at(0),p2.at(1),p2.at(2));
					//applyLight(i);
					g.setColor(queue[i][2].getColor());
					g.drawLine(proj1.at(0),proj1.at(1),proj2.at(0),proj2.at(1));
				}
			}else{
				
				var projectedPoints = [];
				//applyLight(i);
				g.setColor(queue[i][queue[i].length - 1].getColor());
				
				for(var j = 0; j < queue[i].length - 1; j++){
					projectedPoints[j*2] = this.projectPoint(queue[i][j].at(0),queue[i][j].at(1),queue[i][j].at(2)).at(0);
					projectedPoints[j*2 + 1] = this.projectPoint(queue[i][j].at(0),queue[i][j].at(1),queue[i][j].at(2)).at(1);
				}
				
				if(!concavePolygons){
					
					g.fillPolygonConvex(projectedPoints);
				}else{
					
					g.fillPolygon(projectedPoints);
				}
				
			}
			
		}
		queue = [];
	}
	
	this.sortQueue = function(){
		//console.log("0: "+queue[0]);
		//console.log("1: "+queue[1] + "\n");
		for(var i = 0; i < queue.length; i++){
			var maxDistance = null;
			for(var j = i; j < queue.length; j++){
				var midPoint = [0,0,0]
				
				for(var k = 0; k < (queue[j].length - 1); k++){
					midPoint[0] += queue[j][k].at(0)/(queue[j].length - 1);
					midPoint[1] += queue[j][k].at(1)/(queue[j].length - 1);
					midPoint[2] += queue[j][k].at(2)/(queue[j].length - 1)
				}
				
				var averageDistance = sensorDistance(midPoint[0],midPoint[1],midPoint[2]);
				//console.log("Max distance: " + maxDistance + " | averageDistance: " + averageDistance );
				//console.log("1) midPoint: " + midPoint + " | maxDistance: " + maxDistance + " | averageDistance: " + averageDistance); console.log( "queue[" + i + "]: " + queue[i]); console.log("queue[" + j + "]: " + queue[j]); 
				if(!maxDistance || averageDistance > maxDistance){
					var temp = queue[j];
					maxDistance = averageDistance;
					queue[j] = queue[i];
					queue[i] = temp;
				}
				//console.log("2) midPoint: " + midPoint + " | maxDistance: " + maxDistance + " | averageDistance: " + averageDistance); console.log( "queue[" + i + "]: " + queue[i]); console.log("queue[" + j + "]: " + queue[j] + "\n"); 

			
			}
		}
		//console.log("0: "+queue[0]);
		//console.log("1: "+queue[1]);
	}
	
	var applyLight = function(a){ //pass the item *number* in the queue not the item itself. Will look at and change the color value of queue[a]
		
		
	}

		
	function sensorDistance(x,y,z){
		var distance = Math.sqrt((x-sensor.at(0))*(x-sensor.at(0)) + (y-sensor.at(1))*(y-sensor.at(1)) + (z-sensor.at(2))*(z-sensor.at(2)));
		
		return distance;
	}

}


Graphics3D.prototype.projectPoint = function(x_1,y_1,z_1){ //Takes a point in 3d space
	var t1 = (this.getLens()-this.getSensor().at(2))/(this.getSensor().at(2) - z_1); //the t derived from the z component of the parametric line between the point to be projected and the sensor assuming the line intersects the lens, the lens is flat, and the lens is parallel to the xy plane
	var x1 = this.getSensor().at(0)+this.getSensor().at(0)*t1-t1*x_1; //x component of the parametric line between the point to be projected and the sensor
	var y1 = this.getSensor().at(1)+this.getSensor().at(1)*t1-t1*y_1; //y component of the parametric line between the point to be projected and the sensor
	
	return new Vector(x1-this.getSensor().at(0),y1-this.getSensor().at(1));
}

Graphics3D.prototype.inverseProject = function(x_1,y_1,z_1){ //with a given z (z_1) value and the already projected x (x_1) and y (y_1) on the 2d plane, this finds the original x and y that were projected from 3d space onto the plane 
	var t1 = this.getLens()/(this.getSensor().at(2) - z_1);
	var x1 = x_1/t1;
	var y1 = y_1/t1;
	
	return [x1,y1];
}

Graphics3D.prototype.drawLine = function(x1,y1,z1,x2,y2,z2){

	this.pushToQueue([[x1,y1,z1],[x2,y2,z2],this.getMaterial()]);

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
	if(typeof this.getMaterial() === 'undefined') console.log("Warning material undefined."); 
	this.pushToQueue([new Vector(x1,y1,z1),new Vector(x2,y2,z2),new Vector(x3,y3,z3),this.getMaterial()]);

}

Graphics3D.prototype.fillPolygon = function(a){ 
		if(typeof this.getMaterial() === 'undefined') console.log("Warning material undefined."); 
		if(a.length%3 != 0) throw "Error: Incorrect argument length in fillPolygon. Length of argument must be divisible by 3."
		if(a.length/3 <= 2) throw "Error: Polygons must have at least 3 vertices."

		var polygon = [];

		for(var i = 0; i < a.length/3; i++){
			polygon[i] = new Vector(a[i*3],a[i*3 + 1],a[i*3 + 2]);
		}

		polygon.push(this.getMaterial());
		
		this.pushToQueue(polygon);
			
		
}

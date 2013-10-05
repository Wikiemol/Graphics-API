function Graphics3D(context,c){
	this.cxt = context;
	var color = c;
	var standard_coordinates = false;
	var sensor = [0,0,1100];
	var focalLength = 600;
	var lens = sensor[2] - focalLength;
	var queue		    = [];
	
	if(!c){
		color = "#000000";
	}
	
	this.setColor = function(cl){
		color = cl;
	}
	this.getColor = function(){
		return color;
	}

	this.magnitude = function(a){
		var k = 0;

		for(var i = 0; i < a.length; i++){
			k += a[i]*a[i];
		}

		return Math.sqrt(k);
	}

	this.crossProduct = function(a,b){
		return [a[1]*b[2] - a[2]*b[1],-a[0]*b[2]+a[2]*b[0],a[0]*b[1] - a[1]*b[0]]
	}

	this.setCoordinates = function(t){
		standard_coordinates = t;
	}
	this.getCoordinates = function(){
		return standard_coordinates;
	}
	this.setSensor = function(x,y,z){
		sensor = [x,y,z];
		lens = z - focalLength;
	}
	this.getSensor = function(){
		return sensor;
	}
	this.setFocalLength = function(p){
		focalLength = p;
		lens = sensor[2] - focalLength;
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
	
	this.draw = function(){
		var g = new Graphics2D(this.cxt);
		g.setCoordinates(standard_coordinates);

		this.sortQueue();
		
		for(var i = 0; i < queue.length; i++){
			if(queue[i].length == 4){
				var p1 	  = queue[i][0];
				var p2	  = queue[i][1];
				var p3	  = queue[i][2];
				var proj1 = this.projectPoint(p1[0],p1[1],p1[2]);
				var proj2 = this.projectPoint(p2[0],p2[1],p2[2]);
				var proj3 = this.projectPoint(p3[0],p3[1],p3[2]);

				g.setColor(queue[i][3]);
				
				g.fillTriangle(proj1[0],proj1[1],proj2[0],proj2[1],proj3[0],proj3[1]);
			}else if(queue[i].length == 3){
				
				var p1 	  = queue[i][0];
				var p2	  = queue[i][1];
				var proj1 = this.projectPoint(p1[0],p1[1],p1[2]);
				var proj2 = this.projectPoint(p2[0],p2[1],p2[2]);
				
				g.setColor(queue[i][2]);
				
				g.drawLine(proj1[0],proj1[1],proj2[0],proj2[1]);
			}
			
		}
		queue = [];
	}
	
	this.sortQueue = function(){
		
		for(var i = 0; i < queue.length; i++){
			var maxDistance = null;
			for(var j = i; j < queue.length; j++){
				
				var averageDistance = 0;
				for(var k = 0; k < (queue[j].length - 1); k++){
					averageDistance += sensorDistance(queue[j][k][0],queue[j][k][1],queue[j][k][2])/(queue[j].length - 1);
				}
				
				if(!maxDistance || averageDistance > maxDistance){
					var temp = queue[j];
					maxDistance = averageDistance;
					queue[j] = queue[i];
					queue[i] = temp;
				}
			
			}
		}
		
	}
	
		
	function sensorDistance(x,y,z){
		var distance = Math.sqrt((x-sensor[0])*(x-sensor[0]) + (y-sensor[1])*(y-sensor[1]) + (z-sensor[2])*(z-sensor[2]));

		return distance;
	}

}


Graphics3D.prototype.projectPoint = function(x_1,y_1,z_1){
	var t1 = (this.getLens()-this.getSensor()[2])/(this.getSensor()[2] - z_1); 
	var x1 = this.getSensor()[0]+this.getSensor()[0]*t1-t1*x_1;
	var y1 = this.getSensor()[1]+this.getSensor()[1]*t1-t1*y_1;
	
	return [x1-this.getSensor()[0],y1-this.getSensor()[1]];
}

Graphics3D.prototype.inverseProject = function(x_1,y_1,z_1){ //with a given z (z_1) value and the already projected x (x_1) and y (y_1) on the 2d plane, this finds the original x and y that were projected from 3d space onto the plane 
	var t1 = this.getLens()/(this.getSensor()[2] - z_1);
	var x1 = x_1/t1;
	var y1 = y_1/t1;
	
	return [x1,y1];
}

Graphics3D.prototype.drawLine = function(x1,y1,z1,x2,y2,z2){
	this.pushToQueue([[x1,y1,z1],[x2,y2,z2],this.getColor()]);

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

	this.pushToQueue([[x1,y1,z1],[x2,y2,z2],[x3,y3,z3],this.getColor()]);

}




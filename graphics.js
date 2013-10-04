function Graphics(context,c){
	this.cxt = context;
	var color = c;
	var standard_coordinates = false;
	var perspective = 200;
	var projectionPlane = 100;
	var depthMap	    = [];
	var cue		    = [];

	for(var i = 0; i < this.cxt.canvas.width; i++){
		depthMap[i] = [];
		for(var j = 0; j < this.cxt.canvas.height; j++){
			depthMap[i][j] = null;
		}
	}
	
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
	this.setPerspective = function(p){
		perspective = p;
	}
	this.getPerspective = function(){
		return perspective;
	}
	this.setProjectionPlane = function(p){
		return projectionPlane;
	}
	this.getProjectionPlane = function(){
		return projectionPlane;
	}
	this.pushToCue = function(p){
		cue.push(p);
	}
	
	this.draw = function(){
		
		this.sortCue();
		
		for(var i = 0; i < cue.length; i++){
			if(cue[i].length == 4){
				var p1 	  = cue[i][0];
				var p2	  = cue[i][1];
				var p3	  = cue[i][2];
				var proj1 = this.projectPoint(p1[0],p1[1],p1[2]);
				var proj2 = this.projectPoint(p2[0],p2[1],p2[2]);
				var proj3 = this.projectPoint(p3[0],p3[1],p3[2]);

				this.setColor(cue[i][3]);
				
				this.fillTriangle(proj1[0],proj1[1],proj2[0],proj2[1],proj3[0],proj3[1]);
			}else if(cue[i].length == 3){
				
				var p1 	  = cue[i][0];
				var p2	  = cue[i][1];
				var proj1 = this.projectPoint(p1[0],p1[1],p1[2]);
				var proj2 = this.projectPoint(p2[0],p2[1],p2[2]);
				
				this.setColor(cue[i][2]);
				
				this.drawLine(proj1[0],proj1[1],proj2[0],proj2[1]);
			}
			
		}
		cue = [];
	}
	//*******//
	this.sortCue = function(){
		
		for(var i = 0; i < cue.length; i++){
			var maxDistance = null;
			for(var j = i; j < cue.length; j++){
				
				var averageDistance = 0;
				for(var k = 0; k < (cue[j].length - 1); k++){
					averageDistance += perspectiveDistance(cue[j][k][0],cue[j][k][1],cue[j][k][2])/(cue[j].length - 1);
				}
				
				if(!maxDistance || averageDistance > maxDistance){
					var temp = cue[j];
					maxDistance = averageDistance;
					cue[j] = cue[i];
					cue[i] = temp;
				}
			
			}
		}
		
	}
	//*******//
		
	function perspectiveDistance(x,y,z){
		var distance = Math.sqrt(x*x + y*y + (z-perspective)*(z-perspective));

		return distance;
	}

}



Graphics.prototype.drawPixel = function(x,y){
	this.cxt.fillStyle = this.getColor();
	if(!this.getCoordinates()){
		this.cxt.fillRect(x,y,1,1);
		
	}else{
		this.cxt.fillRect(x+this.cxt.canvas.width/2,-y+this.cxt.canvas.height/2,1,1);
	}

}

Graphics.prototype.drawLine = function(x_1,y_1,x_2,y_2){
	
	var x1 = x_1;
	var y1 = y_1;
	var x2 = x_2;
	var y2 = y_2;

	if(x1 > x2){
		x1 = x_2;
		y1 = y_2;
		x2 = x_1;
		y2 = y_1;
	}

	var dx = x2 - x1;
	var dy = y2 - y1;

	if(dx == 0 && dy == 0){
		this.drawPixel(x1,y1);
		return;
	}


	if(Math.abs(dy) > Math.abs(dx)){
		var slope = dx/dy;
		var sign = 1;

		if(dx/dy < 0){
			sign = -1;
		}

		for(var i = 0;i < Math.abs(dy); i++){
			this.drawPixel(x1 + sign*i*slope,y1 + i*sign);
		}


	}else{ 

		var slope = dy/dx;

		for(var i = 0; i < Math.abs(dx); i++){

			this.drawPixel(x1 + i,y1 + i*slope);
		}


	}
}


Graphics.prototype.fillTriangle = function(x_1,y_1,x_2,y_2,x_3,y_3){
	
	
	var x1 = Math.round(x_1);
	var y1 = Math.round(y_1);
	var x2 = Math.round(x_2);
	var y2 = Math.round(y_2);
	var x3 = Math.round(x_3);
	var y3 = Math.round(y_3);
	
	var minX = Math.min(Math.min(x1,x2),x3);
	var minY = Math.min(Math.min(y1,y2),y3);
	var maxX = Math.max(Math.max(x1,x2),x3);
	var maxY = Math.max(Math.max(y1,y2),y3);

	var area = getArea(x1,y1,x2,y2,x3,y3);
	
	for(var i = 0; i < Math.abs(maxX - minX); i++){
		
		for(var j = 0; j < Math.abs(maxY - minY); j++){
			
			if(area == getArea(minX + i, minY + j,x1,y1,x2,y2) + getArea(minX + i, minY + j,x2,y2,x3,y3) + getArea(minX + i, minY + j,x3,y3,x1,y1)){
					this.drawPixel(minX + i, minY + j);
			}
		}
	}
	
	
	function getArea(x_1,y_1,x_2,y_2,x_3,y_3){	
		return Math.abs((x_1*(y_2 - y_3) + x_2*(y_3 - y_1) + x_3*(y_1 - y_2))/2)
	}

	
	
}

Graphics.prototype.projectPoint = function(x_1,y_1,z_1){
	var t1 = this.getProjectionPlane()/(this.getPerspective() - z_1); 
	var x1 = t1*x_1;
	var y1 = t1*y_1;
	
	return [x1,y1];
}

Graphics.prototype.inverseProject = function(x_1,y_1,z_1){ //with a given z (z_1) value and the already projected x (x_1) and y (y_1) on the 2d plane, this finds the original x and y that were projected from 3d space onto the plane 
	var t1 = this.getProjectionPlane()/(this.getPerspective() - z_1);
	var x1 = x_1/t1;
	var y1 = y_1/t1;
	
	return [x1,y1];
}

Graphics.prototype.drawLine3d = function(x1,y1,z1,x2,y2,z2){
	this.pushToCue([[x1,y1,z1],[x2,y2,z2],this.getColor()]);

}

Graphics.prototype.drawPrism = function(x,y,z,w,h,d){
	this.drawLine3d(x-(w/2),y-(h/2),z-(d/2),x+(w/2),y-(h/2),z-(d/2)); //Bottom back line
	this.drawLine3d(x-(w/2),y-(h/2),z+(d/2),x+(w/2),y-(h/2),z+(d/2)); //Bottom front line
	this.drawLine3d(x-(w/2),y-(h/2),z+(d/2),x-(w/2),y-(h/2),z-(d/2)); //Bottom left line
	this.drawLine3d(x+(w/2),y-(h/2),z+(d/2),x+(w/2),y-(h/2),z-(d/2)); //Bottom right line

	this.drawLine3d(x-(w/2),y+(h/2),z-(d/2),x+(w/2),y+(h/2),z-(d/2)); //Top back line
	this.drawLine3d(x-(w/2),y+(h/2),z+(d/2),x+(w/2),y+(h/2),z+(d/2)); //Top front line
	this.drawLine3d(x-(w/2),y+(h/2),z+(d/2),x-(w/2),y+(h/2),z-(d/2)); //Top left line
	this.drawLine3d(x+(w/2),y+(h/2),z+(d/2),x+(w/2),y+(h/2),z-(d/2)); //Top right line

	this.drawLine3d(x-(w/2),y-(h/2),z-(d/2),x-(w/2),y+(h/2),z-(d/2)); //Back left line
	this.drawLine3d(x-(w/2),y-(h/2),z+(d/2),x-(w/2),y+(h/2),z+(d/2)); //Front left line
		
		  //	 0     , -100  , 0     , 0     , 100   ,  0
	this.drawLine3d(x+(w/2),y-(h/2),z-(d/2),x+(w/2),y+(h/2),z-(d/2)); //Back right line
	this.drawLine3d(x+(w/2),y-(h/2),z+(d/2),x+(w/2),y+(h/2),z+(d/2)); //Front right line
	
}

Graphics.prototype.fillTriangle3d = function(x1,y1,z1,x2,y2,z2,x3,y3,z3){

	this.pushToCue([[x1,y1,z1],[x2,y2,z2],[x3,y3,z3],this.getColor()]);

}




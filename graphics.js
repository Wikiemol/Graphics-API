function Graphics(context,c){
	this.cxt = context;
	var color = c;
	var standard_coordinates = false;
	var perspective = 200;
	var projectionPlane = 100;

	var cue = []; //Polygons to be drawn
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
		
		sortCue();
		
		for(var i = 0; i < cue.length; i++){
			this.setColor(cue[i][3]);
			var p1 = this.projectPoint(cue[i][0][0],cue[i][0][1],cue[i][0][2]);
			var p2 = this.projectPoint(cue[i][1][0],cue[i][1][1],cue[i][1][2]);
			var p3 = this.projectPoint(cue[i][2][0],cue[i][2][1],cue[i][2][2]);
			this.fillTriangle(Math.round(p1[0]),Math.round(p1[1]),Math.round(p2[0]),Math.round(p2[1]),Math.round(p3[0]),Math.round(p3[1]));
		}
		clearCue();
	}

	function sortCue(){ //Sorts polygons in order of the depth of their midpoint from furthest away to closest
		var l = cue.length;
		for(var i = 0; i < l; i++){
				
				for(var j = 1; j < l; j++){
					if(((cue[i][0][2] + cue[i][1][2] + cue[i][2][2])/3 > (cue[j][0][2] + cue[j][1][2] + cue[j][2][2])/3)){
				
						var temp = cue[j];
						cue[j] = cue[i];
						cue[i] 	 = temp;
					}
				}
		
		}
	}
	
	function clearCue(){
		
		cue = [];
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


Graphics.prototype.fillTriangle = function(x1,y1,x2,y2,x3,y3){

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

Graphics.prototype.drawLine3d = function(x1,y1,z1,x2,y2,z2){
	this.drawLine(this.projectPoint(x1,y1,z1)[0],this.projectPoint(x1,y1,z1)[1],this.projectPoint(x2,y2,z2)[0],this.projectPoint(x2,y2,z2)[1]);
	
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
	this.drawLine3d(x+(w/2),y-(h/2),z-(d/2),x+(w/2),y+(h/2),z-(d/2)); //Back right line
	this.drawLine3d(x+(w/2),y-(h/2),z+(d/2),x+(w/2),y+(h/2),z+(d/2)); //Front right line
	
}

Graphics.prototype.fillTriangle3d = function(x1,y1,z1,x2,y2,z2,x3,y3,z3){
	
	this.pushToCue([[x1,y1,z1],[x2,y2,z2],[x3,y3,z3],this.getColor()]);
	
}




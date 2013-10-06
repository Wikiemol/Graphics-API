function Graphics2D(context,c){
	this.cxt = context;
	var color = c;
	var standard_coordinates = false;
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

	this.setCoordinates = function(t){
		standard_coordinates = t;
	}

	this.getCoordinates = function(){
		return standard_coordinates;
	}
}



Graphics2D.prototype.drawPixel = function(x,y){
	this.cxt.fillStyle = this.getColor();
	if(!this.getCoordinates()){
		this.cxt.fillRect(x,y,1,1);
		
	}else{
		this.cxt.fillRect(x+this.cxt.canvas.width/2,-y+this.cxt.canvas.height/2,1,1);
	}

}

Graphics2D.prototype.drawLine = function(x_1,y_1,x_2,y_2){
	
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


Graphics2D.prototype.fillTriangle = function(x_1,y_1,x_2,y_2,x_3,y_3){
	
	
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


Graphics2D.prototype.fillPolygon = function(a){ //points must be ordered by user
	var points = [];
	var averageCenter = [0,0];
	var closestToCenter;
	var shortestToCenter;
	for(var i = 0; i < a.length/2; i++){ //calculates the average center and fills the points array in an organized manor with the user input.
		points[i] = [a[i*2],a[i*2 + 1]];
		
		averageCenter[0] += points[i][0]/(a.length/2);
		averageCenter[1] += points[i][1]/(a.length/2);
		
	}

	for(var i = 0; i < points.length; i++){ //finds the index of the point in the points array which is closest to the average center
		var distance = Math.sqrt((points[i][0] - averageCenter[0])*(points[i][0] - averageCenter[0]) + (points[i][1] - averageCenter[1])*(points[i][1] - averageCenter[1]))
		if(typeof closestToCenter === 'undefined' || (distance < shortestToCenter)){
			
			shortestToCenter = distance;
			closestToCenter = i;
		}
	}
	for(var i = 0; i < closestToCenter; i++){ //shifts the array so that the point which is closest to the average center is first. This allows for concave polygons. 
		var temp = points[0];
		points.shift();
		points.push(temp);
	}
	
	var pivot = points[0];
	
	for(var i = 1; i < points.length-1; i++){
		this.fillTriangle(points[i][0],points[i][1],points[i+1][0],points[i+1][1],pivot[0],pivot[1]);
	}	
	
}







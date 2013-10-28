function Graphics2D(context,c){
	this.cxt 					= context;
	var color 					= c;
	var standard_coordinates 	= false;
	var WIDTH 					= context.canvas.width;
	var HEIGHT 					= context.canvas.height;
	var imageData 				= context.getImageData(0,0,WIDTH,HEIGHT);
	var data 					= imageData.data;
	
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

	this.drawPixel = function(x1,y1){
		var red = parseInt(parseInt(color.charAt(1) + color.charAt(2),16).toString(10),10);
		var green = parseInt(parseInt(color.charAt(3) + color.charAt(4),16).toString(10),10);
		var blue = parseInt(parseInt(color.charAt(5) + color.charAt(6),16).toString(10),10);

		var x = Math.round(x1);
		var y = Math.round(y1);

		if(standard_coordinates){
			x = Math.round(x1+WIDTH/2);
			y = Math.round(-y1+HEIGHT/2);
		}

		if(x <= WIDTH && x >= 0 && y <= HEIGHT && y >= 0){
			var point = (x+y*HEIGHT)*4;

			data[point + 0] = red; //r
			data[point + 1] = green; //g
			data[point + 2] = blue; //b
			data[point + 3] = 255; //a
		}
	}

	this.draw = function(){
		context.putImageData(imageData,0,0);
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
	var n1 = Math.abs(maxX - minX);
	var n2 = Math.abs(maxY - minY);
	for(var i = 0; i < n1; i++){
		
		for(var j = 0; j < n2; j++){
			
			if(area == getArea(minX + i, minY + j,x1,y1,x2,y2) + getArea(minX + i, minY + j,x2,y2,x3,y3) + getArea(minX + i, minY + j,x3,y3,x1,y1)){
					this.drawPixel(minX + i, minY + j);
			}
		}
	}
	
	
	function getArea(x_1,y_1,x_2,y_2,x_3,y_3){	
		return Math.abs((x_1*(y_2 - y_3) + x_2*(y_3 - y_1) + x_3*(y_1 - y_2))/2)
	}

	
	
}


Graphics2D.prototype.fillPolygon = function(a){ //points must be ordered by user, does not work for all concave polygons
	if(a.length%2 != 0) throw "Error: Incorrect argument length in fillPolygon. Length of argument must be divisible by 2."
	if(a.length/2 < 3) throw "Error: Polygons must have at least 3 vertices."

	var points = [];
	var pointsx = [];
	var pointsy = [];
	var averageCenter = [0,0]; //median average
	var closestToCenter;
	var shortestToCenter;
	for(var i = 0; i < a.length/2; i++){
		points[i] = [a[i*2],a[i*2 + 1]];
		
		pointsx.push(a[i*2]);
		pointsy.push(a[i*2 + 1]);
		
	}
	var j;
	for(var i = 0; i < pointsx.length; i++){ //Insertion sort of pointsx
		var temp = pointsx[i];
		
		for(j = i-1; j >= 0 && points[j] > temp; j--){
			pointsx[j+1] = pointsx[j];
		}
		pointsx[j+1] = temp;
		
	}
	for(var i = 0; i < pointsy.length; i++){ //Insertion sort of pointsy
		var temp = pointsy[i];
		
		for(j = i-1; j >= 0 && pointsy[j] > temp; j--){
			pointsy[j+1] = pointsy[j];
		}
		pointsy[j+1] = temp;
		
	}
	if(pointsx.length%2 == 0){ //median of x values
		averageCenter[0] = (pointsx[pointsx.length/2] + pointsx[pointsx.length/2]- 1)/2 
	}else{
		averageCenter[0] = pointsx[(pointsx.length-1)/2]
	}
	
	if(pointsy.length%2 == 0){ //median of y values
		averageCenter[1] = (pointsy[pointsy.length/2] + pointsy[pointsy.length/2]- 1)/2
	}else{
		averageCenter[1] = pointsy[(pointsy.length-1)/2]
	}

	for(var i = 0; i < points.length; i++){ //finds the index of the point in the points array which is closest to the average center
		var distance = Math.sqrt((points[i][0] - averageCenter[0])*(points[i][0] - averageCenter[0]) + (points[i][1] - averageCenter[1])*(points[i][1] - averageCenter[1]))
		if(typeof closestToCenter === 'undefined' || (distance < shortestToCenter)){
			shortestToCenter = distance;
			closestToCenter = i;
		}
	}
	for(var i = 0; i < closestToCenter; i++){ //shifts the array so that the point which is closest to the median center is first. This allows for concave polygons. 
		var temp = points[0];
		points.shift();
		points.push(temp);
	}
	
	var pivot = points[0];
	
	for(var i = 1; i < points.length-1; i++){
		this.fillTriangle(points[i][0],points[i][1],points[i+1][0],points[i+1][1],pivot[0],pivot[1]);
	}	
}

Graphics2D.prototype.fillPolygonConvex = function(a){ //assumes polygon passed is convex. Faster than general polygon.
	var midPoint = [0,0];
	var n1 = a.length/2;
	for(var i = 0; i < n1; i++){
		midPoint[0] += a[i*2]/(n1);
		midPoint[1] += a[i*2 + 1]/(n1);
	}
	var n2 = a.length/2 - 1;
	for(var i = 0; i < n2; i++){
		this.fillTriangle(a[i*2],a[i*2 + 1],a[i*2 + 2],a[i*2 + 3],midPoint[0],midPoint[1]);
	}
	this.fillTriangle(a[a.length - 2],a[a.length - 1],a[0],a[1],midPoint[0],midPoint[1]);
}





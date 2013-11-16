function Graphics2D(context,c){
	this.cxt 					= context;
	this.color 					= [0,0,0];
	this.standard_coordinates 	= false;
	this.WIDTH 					= context.canvas.width;
	this.HEIGHT 				= context.canvas.height;
	this.imageData 				= context.getImageData(0,0,this.WIDTH,this.HEIGHT);
	this.cdata 					= this.imageData.data;
	
	if(!c){
		color = [0,0,0];
	}else{
		color = [c[0],c[1],c[2]];
	}

}

Graphics2D.prototype.setColor = function(cl){

	this.color = [cl[0],cl[1],cl[2]];

}
Graphics2D.prototype.getColor = function(){
	return this.color;
}

Graphics2D.prototype.setCoordinates = function(t){
	this.standard_coordinates = t;
}

Graphics2D.prototype.getCoordinates = function(){
	return this.standard_coordinates;
}

Graphics2D.prototype.drawPixel = function(x1,y1){
	
	var x = Math.round(x1);
	var y = Math.round(y1);
	if(this.standard_coordinates){
		x = Math.round(x1+this.WIDTH/2);
		y = Math.round(-y1+this.HEIGHT/2);
	}

	if(x < this.WIDTH && x >= 0 && y < this.HEIGHT && y >= 0){
		var point = (x+y*this.WIDTH)*4;

		this.cdata[point + 0] = this.color[0]; //r
		this.cdata[point + 1] = this.color[1]; //g
		this.cdata[point + 2] = this.color[2]; //b
		this.cdata[point + 3] = 255; //a
	}
}

Graphics2D.prototype.draw = function(){
	this.cxt.putImageData(this.imageData,0,0);
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

Graphics2D.prototype.interpolateTriangle = function(x_1,y_1, x_2,y_2, x_3,y_3, r1,g1,b1, r2,g2,b2, r3,g3,b3){
	var tempColor = this.getColor();

	var x1 = Math.round(x_1);
	var y1 = Math.round(y_1);
	
	var x2 = Math.round(x_2);
	var y2 = Math.round(y_2);

	var x3 = Math.round(x_3);
	var y3 = Math.round(y_3);

	/*****variables for triangle check****/
	var aboveX = (x1 + x2 + x3)/3
	var aboveY = (y1 + y2 + y3)/3
	
	//assuming z of the point above the plane is 1 and z of the plane is 0
	var normal1 = 	[(y1 - y2),
					-(x1 - x2),
					(x1 - x2)*(aboveY - y2) - (y1 - y2)*(aboveX - x2)] //p1,p2,above
	var normal2 = 	[(y2 - y3),
					-(x2 - x3),
					(x2 - x3)*(aboveY - y3) - (y2 - y3)*(aboveX - x3)] //p2,p3,above
	var normal3 = 	[(y3 - y1),
					-(x3 - x1),
					(x3 - x1)*(aboveY - y1) - (y3 - y1)*(aboveX - x1)] //p3,p1,above
	var A1 = -normal1[0]/normal1[2];
	var B1 = -normal1[1]/normal1[2];
	// var C1 = x1*normal1[0]/normal1[2] + y1*normal1[1]/normal1[2];

	var A2 = -normal2[0]/normal2[2];
	var B2 = -normal2[1]/normal2[2];
	// var C2 = x2*normal2[0]/normal2[2] + y2*normal2[1]/normal2[2];

	var A3 = -normal3[0]/normal3[2];
	var B3 = -normal3[1]/normal3[2];
	// var C3 = x3*normal3[0]/normal3[2] + y3*normal3[1]/normal3[2];
	/*------end variables for triangle check---------*/


	var rnormal = [(y1 - y2)*(r3 - r2) - (r1 - r2)*(y3 - y2),
				  (r1 - r2)*(x3 - x2) - (x1 - x2)*(r3 - r2),
				  (x1 - x2)*(y3 - y2) - (y1 - y2)*(x3 - x2)]

	var gnormal = [(y1 - y2)*(g3 - g2) - (g1 - g2)*(y3 - y2),
				  (g1 - g2)*(x3 - x2) - (x1 - x2)*(g3 - g2),
				  (x1 - x2)*(y3 - y2) - (y1 - y2)*(x3 - x2)]

	var bnormal = [(y1 - y2)*(b3 - b2) - (b1 - b2)*(y3 - y2),
				  (b1 - b2)*(x3 - x2) - (x1 - x2)*(b3 - b2),
				  (x1 - x2)*(y3 - y2) - (y1 - y2)*(x3 - x2)]

	var Ar = -rnormal[0]/rnormal[2];
	var Br = -rnormal[1]/rnormal[2];
	var Cr = -Ar*x1 - Br*y1 + r1;

	var Ag = -gnormal[0]/gnormal[2];
	var Bg = -gnormal[1]/gnormal[2];
	var Cg = -Ag*x1 - Bg*y1 + g1;
	
	var Ab = -bnormal[0]/bnormal[2];
	var Bb = -bnormal[1]/bnormal[2];
	var Cb = -Ab*x1 - Bb*y1 + b1;

	var minX = Math.min(Math.min(x1,x2),x3);
	var minY = Math.min(Math.min(y1,y2),y3);
	var maxX = Math.max(Math.max(x1,x2),x3);
	var maxY = Math.max(Math.max(y1,y2),y3);

	/*var area = getArea(x1,y1,
					   x2,y2,
					   x3,y3);*/

	var n1 = Math.abs(maxX - minX);
	var n2 = Math.abs(maxY - minY);
	
	for(var i = 0; i < n1; i++){
		
		for(var j = 0; j < n2; j++){
			var x = minX + i;
			var y = minY + j;
			var isInTriangle = true;
			var z1 = (x - x1)*A1 + (y - y1)*B1;
			var z2 = A2*(x-x2) + B2*(y-y2);
			var z3 = A3*(x-x3) + B3*(y-y3);

			if(z1 < 0){
				isInTriangle = false;
			}
			if(z2 < 0){
				isInTriangle = false;
			}
			if(z3 < 0){
				isInTriangle = false;
			}

			/*var a1 = getArea(minX + i, minY + j,x2,y2,x3,y3);
			var a2 = getArea(minX + i, minY + j,x3,y3,x1,y1);
			var a3 = getArea(minX + i, minY + j,x1,y1,x2,y2);*/
			// if(area == a1 + a2 + a3){
			if(isInTriangle){

					var color = [Ar*x + Br*y + Cr, Ag*x + Bg*y + Cg, Ab*x + Bb*y + Cb];

					/*var color1 = c1.multiply(a1/(a1 + a2 + a3));
					var color2 = c2.multiply(a2/(a1 + a2 + a3));
					var color3 = c3.multiply(a3/(a1 + a2 + a3));
					var color  = color1.add(color2).add(color3).getVectorAsArray();*/
					this.setColor(color);
					this.drawPixel(x, y);
			}
		}
	}
	
	
	/*function getArea(x_1,y_1,x_2,y_2,x_3,y_3){	
		return Math.abs((x_1*(y_2 - y_3) + x_2*(y_3 - y_1) + x_3*(y_1 - y_2))/2)
	}*/
	this.setColor(tempColor);
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





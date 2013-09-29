function Graphics(context,c){
	this.cxt = context;
	var color = c;
	if(!c){
		color = "#000000";
	}
	console.log(color);
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

	
}

Graphics.prototype.drawPixel = function(x,y){
	this.cxt.fillStyle = this.getColor();
	this.cxt.fillRect(x,y,1,1);
	
	
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
	
	if(dx == 0){
		for(var i = 0; i < Math.abs(dy); i++){
			this.drawPixel(x1,y1+i*dy/Math.abs(dy));
		}
		return;
	}
	
	if(Math.abs(dy) > Math.abs(dx)){
		var slope = dx/dy;
		for(var i = 0; i < Math.abs(dy); i++){
			this.drawPixel(x1 + i*slope,y1 + i*slope/Math.abs(slope));
			
		}
		
		return;
	} 
	
	var slope = dy/dx;
	
	for(var i = 0; i < Math.abs(dx); i++){
		
		this.drawPixel(x1 + i,y1 + i*slope);
	}

	return;
	
}


Graphics.prototype.fillTriangle = function(x1,y1,x2,y2,x3,y3){
	
	var center = [(x1+x2+x3)/3,(y1+y2+y3)/3];
	var area = this.magnitude(this.crossProduct([x2-x1,y2-y1,0],[x3-x1,y3-y1,0]))/2;
	
	this.drawLine(x1,y1,x2,y2);
	this.drawLine(x2,y2,x3,y3);
	this.drawLine(x3,y3,x1,y1);
	var scale = 0.99; //Change so that the scaling factor gets smaller to match how big the triangle is (so that the minimum number of triangles are drawn). Maybe by scaling it so that the area of the new triangle is exactly the area minus the pixels of the perimeter. 
	console.log("Perimeter: " + perimeter + " | Area: " + area + " | Scale: " + scale );
	if(Math.abs(x1 - x2) < 1 && Math.abs(x2-x3) < 1 && Math.abs(y1 - y2) < 1 && Math.abs(y2-y3) < 1){
		return;
	}else{
		
		count++;
		this.fillTriangle(center[0] + (x1-center[0])*scale,center[1] + (y1-center[1])*scale,center[0] + (x2-center[0])*scale,center[1] + (y2-center[1])*scale,center[0] + (x3-center[0])*scale,center[1] + (y3-center[1])*scale);
		
	}
	
}

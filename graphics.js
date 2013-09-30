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
	
	
	if(Math.abs(dy) > Math.abs(dx)){
		var slope = dx/dy;
		var sign = 1;
		if(dx/dy < 0){
			sign = -1;
		}
		for(var i = 0; i < Math.abs(dy); i += sign){
			this.drawPixel(x1 + i*slope,y1 + i);
			
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
	
	var minX = Math.min(Math.min(x1,x2),x3);
	var minY = Math.min(Math.min(y1,y2),y3);
	var maxX = Math.max(Math.max(x1,x2),x3);
	var maxY = Math.max(Math.min(y1,y2),y3);
	
	var area = getArea(x1,y1,x2,y2,x3,y3);
	
	for(var i = 0; i < maxX - minX; i++){
		for(var j = 0; j < maxY - minY; j++){
			if(area == getArea(minX + i, minY + j,x1,y1,x2,y2) + getArea(minX + i, minY + j,x2,y2,x3,y3) + getArea(minX + i, minY + j,x3,y3,x1,y1)){
				this.drawPixel(minX + i, minY + j);
			}
		}
	}
	
	function getArea(x_1,y_1,x_2,y_2,x_3,y_3){	
		return Math.abs((x_1*(y_2 - y_3) + x_2*(y_3 - y_1) + x_3*(y_1 - y_2))/2)
	}
	
}

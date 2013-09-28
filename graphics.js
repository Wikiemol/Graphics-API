function Graphics(context,c){
	this.cxt = context;
	var color = c;

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
}

Graphics.prototype.drawPixel = function(x,y){
	this.cxt.fillStyle = this.getColor();
	this.cxt.fillRect(x,y,1,1);
	
}

Graphics.prototype.drawLine = function(x_1,y_1,x_2,y_2){
	var x1 = x_1;
	var x2 = x_2;
	var y1 = y_1;
	var y2 = y_2;
	
	var dx = x2 - x1;
	var dy = y2 - y1;
	
	var slope = 0;
	if(dx < 0 && dy < 0){
		x1 = x_2;
		y1 = y_2;
		x2 = x_1;
		y2 = y_1;

		dx = x2 - x1;
		dy = y2 - y1;
		
	}
	if(dx == 0 && dy == 0){
		
		this.drawPixel(x1,y1);
		return;
	}
	
	if(dy >= dx){
		
		slope = dx/dy;
		
		for(var i = 0; i <= Math.abs(dy);i++){
			this.drawPixel(x1+Math.floor(i*slope),y1+i);
		}
	}else{
		slope = dy/dx;
		
		
		for(var i = 0; i < Math.abs(dx); i++){
			this.drawPixel(x1+i,y1+Math.floor(i*slope));
			
		}
	}


}



Graphics.prototype.fillTriangle = function(x1,y1,x2,y2,x3,y3){
	
	var center = [(x1+x2+x3)/3,(y1+y2+y3)/3];
	
	var v1 = [center[0] - x1,center[1] - y1];
	var v2 = [center[0] - x2,center[1] - y2];
	var v3 = [center[0] - x3,center[1] - y3];
	
	var unitV1 = [v1[0]/this.magnitude(v1),v1[1]/this.magnitude(v1)];
	var unitV2 = [v2[0]/this.magnitude(v2),v2[1]/this.magnitude(v2)];
	var unitV3 = [v3[0]/this.magnitude(v3),v3[1]/this.magnitude(v3)];
	
	this.drawLine(x1,y1,x2,y2);
	this.drawLine(x2,y2,x3,y3);
	this.drawLine(x3,y3,x1,y1);
	
	if(Math.abs(x1 - x2) < 1 && Math.abs(x2-x3) < 1 && Math.abs(y1 - y2) < 1 && Math.abs(y2-y3) < 1){
		return;
	}else{
		this.fillTriangle(x1+unitV1[0],y1+unitV1[1],x2+unitV2[0],y2+unitV2[1],x3+unitV3[0],y3+unitV3[1]);
	}

	
}







function Graphics(context,c){
	this.cxt = context;
	var color = c;
	this.setColor = function(cl){
		color = cl;
	}
	this.getColor = function(){
		return color;
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
	
	if(dx == 0 && dy == 0){
		
		this.drawPixel(x1,y1);
		return;
	}else if(dx == 0 && dy != 0){
		
		for(var i = 0; i < Math.abs(dy); i++){
			this.drawPixel(x1,y1+i*dy/Math.abs(dy));
		}
		return;
	}else if(dx != 0 && dy == 0){
		for(var i = 0; i < Math.abs(dx); i++){
			this.drawPixel(x1+i*dx/Math.abs(dx),y1);
		}
		return;
	}else{}
	
	if(dx < 0 && dy < 0){
		x1 = x_2;
		y1 = y_2;
		x2 = x_1;
		y1 = y_2;
		
	}
	
	if(dy >= dx){
		
		slope = dy/dx;
		
		for(var i = 0; i < Math.abs(dy);i++){
			this.drawPixel(x1+Math.floor(i/slope),y1+i);
			//console.log((x1+Math.floor(i/slope)) + " " + (y1 + i*s/Math.abs(s)))
		}
	}else{
		slope = dx/dy;
		
		console.log("Slope: " + dx/dy);
		
		for(var i = 0; i < Math.abs(dx); i++){
			
			this.drawPixel(x1+i,y1+Math.floor(i/slope));
			console.log((x1+i*slope/Math.abs(slope)) + " " + (y1+Math.floor(i/slope)));
		}
	}


}






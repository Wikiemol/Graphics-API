function Graphics(context){
	this.cxt = context;
	//this.cxt.fillRect(0,0,100,100);
	
	
	
}

Graphics.prototype.drawPixel = function(x,y,color){
	this.cxt.fillStyle = color;
	this.cxt.fillRect(x,y,1,1);
}

Graphics.prototype.drawLine = function(x1,y1,x2,y2,color){
	
	var dx = x2 - x1;
	var dy = y2 - y1;
	
	var s = 0;
	var dist = Math.sqrt(dx*dx + dy*dy);
	var g = new Graphics(this.cxt);
	if(dx == 0 && dy == 0){
		g.drawPixel(x1,y1,color);
		return;
	}
	
	if(Math.abs(dx) > Math.abs(dy)){
		
		s = Math.min(Math.abs(Math.floor(dx/dy) - (dx/dy)),Math.abs(Math.ceil(dx/dy) - (dx/dy)));
		if(s==Math.abs(Math.floor(dx/dy) - (dx/dy))){
			
			s = Math.floor(dx/dy);
		}
		if(s==Math.abs(Math.ceil(dx/dy) - (dx/dy))){
			
			s = Math.ceil(dx/dy);
		}
		
		for(var i = 0; i < Math.abs(dx/s); i++){
			g.drawPixel(x1+i,y1 +Math.floor(i/s),color);
		}
		
	}else if(dx == dy){
		s = 1;
		for(var i = 0; i < dx; i++){
			console.log(dx + " " + (dx/s));
			g.drawPixel(x1+i,y1+i,color);
			
		}
	}else{
		s = Math.min(Math.abs(Math.floor(dy/dx) - (dy/dx)),Math.abs(Math.ceil(dy/dx) - (dy/dx)));
		if(s==Math.abs(Math.floor(dy/dx) - (dy/dx))){
			s = Math.floor(dy/dx);
		}
		if(s==Math.abs(Math.ceil(dy/dx) - (dy/dx))){
			s = Math.ceil(dy/dx);
		}
		for(var i = 0; i < Math.abs(dy/s); i++){
				g.drawPixel(x1 + Math.floor(i/s), y1+i,color);
			
		}
	}

	function gcf(alp,bet){
		
		var a = alp;
		var b = bet;
		var r = 0;
		if(a<b){
			a = bet;
			b = alp;
		}
		
		r = a%b;

		if(r != 0){
			return gcf(a,r);
		}
			
		return b;
	
		
		
		
	}
}


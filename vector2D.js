function Vector2D(a,b){
	this.vectorArray = new Float32Array(2);
	this.vectorArray[0] = a;
	this.vectorArray[1] = b;
}

Vector2D.prototype.getVectorAsArray = function(){
	return this.vectorArray;	
}

Vector2D.prototype.set = function(a,b){ //Completely overrides current this.vectorArray
	this.vectorArray = [a,b];
}

Vector2D.prototype.setAt = function(i,a){
	this.vectorArray[i] = a;
}

Vector2D.prototype.at = function(i){
	return this.vectorArray[i];
}

Vector2D.prototype.getLength = function(){
	return 2;
}

Vector2D.prototype.dot = function(v){
	var a = this.vectorArray;
	var b = v.vectorArray;
	var result = a[0]*b[0] + a[1]*b[1];

	return result;
}
	
Vector2D.prototype.magnitude = function(){
	var a = this.vectorArray;
	var k = a[0]*a[0] + a[1]*a[1];
	return Math.sqrt(k);
}

Vector2D.prototype.add = function(v){
	var a = this.vectorArray;
	var b = v.vectorArray;
	var result = new Vector2D(a[0] + b[0], a[1] + b[1]);
	return result;
}
	
Vector2D.prototype.subtract = function(v){
	var a = this.vectorArray;
	var b = v.vectorArray;
	var result = new Vector2D(a[0]-b[0],a[1]-b[1]);
	return result;
}

Vector2D.prototype.multiply = function(x){ //scalar multiplication
	var a = this.vectorArray;
	var result = new Vector2D(a[0]*x,a[1]*x);
	return result;
}

Vector2D.prototype.unit = function(){
	return this.multiply(1/this.magnitude());
}

Vector2D.prototype.angle = function(v){ //angle between two vectors
	var angle = Math.acos(this.dot(v)/(this.magnitude()*v.magnitude()))
	return angle;
}

Vector2D.prototype.area = function(v){ //area of the parallelogram formed by two vectors
	
	var a = this.vectorArray[0]*v.vectorArray[1] - this.vectorArray[1]*v.vectorArray[0];
	return a;
}

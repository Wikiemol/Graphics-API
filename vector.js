function Vector(){
	this.vectorArray = [];
	
	for(var i = 0; i < arguments.length; i++){
		this.vectorArray.push(arguments[i]);
	}
	
}

Vector.prototype.getVectorAsArray = function(){
	return this.vectorArray;	
}

Vector.prototype.set = function(){ //Completely overrides current this.vectorArray
	for(var i = 0; i < arguments.length; i++){
		this.vectorArray[i] = arguments[i];
	}
}

Vector.prototype.setAt = function(i,a){
	this.vectorArray[i] = a;
}

Vector.prototype.at = function(i){
	return this.vectorArray[i];
}

Vector.prototype.getLength = function(){
	return this.vectorArray.length;
}

Vector.prototype.cross = function(v){
	var a = this.getVectorAsArray();
	var b = v.getVectorAsArray();
	return new Vector(a[1]*b[2] - a[2]*b[1],-a[0]*b[2]+a[2]*b[0],a[0]*b[1] - a[1]*b[0]);
}

Vector.prototype.dot = function(v){
	var a = this.getVectorAsArray();
	var b = v.getVectorAsArray();
	var result = 0;
	for(var i = 0; i < a.length; i++){
		result += a[i]*b[i];
	}

	return result;
}
	
Vector.prototype.magnitude = function(){
	var a = this.getVectorAsArray();
	var k = 0;
	for(var i = 0; i < a.length; i++){
		k+= a[i]*a[i];
	}
	return Math.sqrt(k);
}

Vector.prototype.add = function(v){
	var a = this.getVectorAsArray();
	var b = v.getVectorAsArray();
	var result = new Vector();
	for(var i = 0; i < a.length; i++){
		result.setAt(i,a[i] + b[i]);
	}
	return result;
}
	
Vector.prototype.subtract = function(v){
	var a = this.getVectorAsArray();
	var b = v.getVectorAsArray();
	var result = new Vector();
	for(var i = 0; i < a.length; i++){
		result.setAt(i,a[i] - b[i]);
	}
	return result;
}

Vector.prototype.multiply = function(x){ //scalar multiplication
	var a = this.getVectorAsArray();
	var result = new Vector();
	for(var i = 0; i < a.length; i++){
		result.setAt(i,a[i]*x);
	}
	return result;
}

Vector.prototype.unit = function(){
	return this.multiply(1/this.magnitude());
}

Vector.prototype.angle = function(v){ //angle between two vectors
	var angle = Math.acos(this.dot(v)/(this.magnitude()*v.magnitude()))
	return angle;
}

Vector.prototype.area = function(v){ //area of the parallelogram formed by two vectors
	var a = this.cross(v).magnitude();
	return a;
}

Vector.prototype.vpush = function(a){
	this.vectorArray.push(a);
}
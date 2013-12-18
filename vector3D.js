function Vector3D(a,b,c){
	this.vectorArray = new Float32Array(3);
	this.vectorArray[0] = a;
	this.vectorArray[1] = b;
	this.vectorArray[2] = c;
	
}

Vector3D.prototype.getVectorAsArray = function(){
	return this.vectorArray;	
}

Vector3D.prototype.set = function(a,b,c){ //Completely overrides current this.vectorArray
	this.vectorArray = [a,b,c];
}

Vector3D.prototype.setAt = function(i,a){
	this.vectorArray[i] = a;
}

Vector3D.prototype.at = function(i){
	return this.vectorArray[i];
}

Vector3D.prototype.getLength = function(){
	return 3;
}

Vector3D.prototype.cross = function(v){
	var a = this.vectorArray;
	var b = v.vectorArray;
	return new Vector3D(a[1]*b[2] - a[2]*b[1],-a[0]*b[2]+a[2]*b[0],a[0]*b[1] - a[1]*b[0]);
}

Vector3D.prototype.dot = function(v){
	var a = this.vectorArray;
	var b = v.vectorArray;
	var result = a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
	return result;
}
	
Vector3D.prototype.magnitude = function(){
	var a = this.vectorArray;
	var k = a[0]*a[0] + a[1]*a[1] + a[2]*a[2]
	return Math.sqrt(k);
}

Vector3D.prototype.magnitudeSquared = function(){
	var a = this.vectorArray;
	var k = a[0]*a[0] + a[1]*a[1] + a[2]*a[2]
	return k;	
}

Vector3D.prototype.add = function(v){
	var a = this.vectorArray;
	var b = v.vectorArray;
	var result = new Vector3D(a[0] + b[0], a[1] + b[1], a[2] + b[2]);
	return result;
}
	
Vector3D.prototype.subtract = function(v){
	var a = this.vectorArray;
	var b = v.vectorArray;
	var result = new Vector3D(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
	return result;
}

Vector3D.prototype.multiply = function(x){ //scalar multiplication
	var a = this.vectorArray;
	var result = new Vector3D(a[0]*x,a[1]*x,a[2]*x);
	return result;
}

Vector3D.prototype.unit = function(){
	return this.multiply(1/this.magnitude());
}

Vector3D.prototype.angle = function(v){ //angle between two vectors
	var angle = Math.acos(this.dot(v)/(this.magnitude()*v.magnitude()))
	return angle;
}

Vector3D.prototype.area = function(v){ //area of the parallelogram formed by two vectors
	var a = this.cross(v).magnitude();
	return a;
}

Vector3D.prototype.roundVector = function(){
	var a = this.vectorArray;
	var vector = new Vector3D(Math.round(a[0]),Math.round(a[1]),Math.round(a[2]));
	return vector;
}
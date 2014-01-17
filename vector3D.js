define("vector3D", [], function() {	
	function Vector3D(a, b, c) {
		this.vectorArray = new Float32Array(3);
		this.vectorArray[0] = a;
		this.vectorArray[1] = b;
		this.vectorArray[2] = c;
	}
	
	Vector3D.prototype.getVectorAsArray = function() {
		return this.vectorArray;	
	};

	//Completely overrides current this.vectorArray
	Vector3D.prototype.set = function(a, b, c) { 
		this.vectorArray = [a, b, c];
		this.unitVector = this.multiply(1 / this.magnitude());
	};
	
	//Sets vector at an index
	Vector3D.prototype.setAt = function(i, a) {
		this.vectorArray[i] = a;
	};
	
	//Returns the item at the index
	Vector3D.prototype.at = function(i) {
		return this.vectorArray[i];
	};
	
	//Returns the length of the vector
	Vector3D.prototype.getLength = function() {
		return 3;
	};
	
	//Performs cross product
	Vector3D.prototype.cross = function(v) {
		var a = this.vectorArray;
		var b = v.vectorArray;
		return new Vector3D(a[1] * b[2] - a[2] * b[1], -a[0] * b[2] + a[2] * b[0], a[0] * b[1] - a[1] * b[0]);
	};
	
	//Performs dot product
	Vector3D.prototype.dot = function(v) {
		var a = this.vectorArray;
		var b = v.vectorArray;
		var result = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
		return result;
	};
	
	//Returns the magnitude of the vector
	Vector3D.prototype.magnitude = function() {
		var a = this.vectorArray;
		var k = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
		return Math.sqrt(k);
	};
	
	//Returns the square of the magnitude
	Vector3D.prototype.magnitudeSquared = function() {
		var a = this.vectorArray;
		var k = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
		return k;	
	};
	
	//Adds two vectors
	Vector3D.prototype.add = function(v) {
		var a = this.vectorArray;
		var b = v.vectorArray;
		var result = new Vector3D(a[0] + b[0], a[1] + b[1], a[2] + b[2]);
		return result;
	};
	
	//Subtracts two vectors
	Vector3D.prototype.subtract = function(v) {
		var a = this.vectorArray;
		var b = v.vectorArray;
		var result = new Vector3D(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
		return result;
	};
	
	//Scalar multiplication
	Vector3D.prototype.multiply = function(x) { 
		var a = this.vectorArray;
		var result = new Vector3D(a[0] * x, a[1] * x, a[2] * x);
		return result;
	};
	
	//Returns the unit vector
	Vector3D.prototype.unit = function() {
		if (typeof this.unitVector === "undefined") {
			this.unitVector = this.multiply(1 / this.magnitude());
		}
		return this.unitVector;
	};
	
	//Returns the angle between two vectors.
	Vector3D.prototype.angle = function(v) {
		var angle = Math.acos(this.dot(v) / (this.magnitude() * v.magnitude()));
		return angle;
	};
	
	//Returns the area of the parallelogram formed by two vectors
	Vector3D.prototype.area = function(v) {
		var a = this.cross(v).magnitude();
		return a;
	};
	
	//Rounds the vector
	Vector3D.prototype.roundVector = function() {
		var a = this.vectorArray;
		var vector = new Vector3D(Math.round(a[0]), Math.round(a[1]), Math.round(a[2]));
		return vector;
	};
	
	//Reflects this vector over another vector.
	Vector3D.prototype.reflectOver = function(vectorToReflectOver) { 
		return vectorToReflectOver.multiply(vectorToReflectOver.dot(this)).multiply(2).subtract(this);
	};
	
	return Vector3D;
});

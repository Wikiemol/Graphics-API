function Matrix() { //can take array of vectors, in addition, it can be set to a rotation matrix by passing 'rx' 'ry' or 'rx' as the first argument, and the angle to be rotated as the second
	var matrixArray = [];
	var width;
	var height;

	
	this.at = function(a,b){
		matrixArray[a].at(b);
	}
	this.column = function(a){

		var vector = new Vector();
		for(var i = 0; i < matrixArray.length; i++){
			vector.setAt(i,matrixArray[i].at(a));
		}
		return vector;
	}

	this.row = function(a){
		return matrixArray[a];
	}

	this.getHeight = function(){
		return height;
	}

	this.getWidth = function(){
		return width;
	}

	this.setRow = function(r,v){
		if(v.getLength != height) throw "Error: Argument not the right size. Cannot change height or width of matrix."
		if(!(v instanceof Vector)) throw 'Error: Rows can only be set to vectors.'
		matrixArray[r] = v;
	}

	this.setAt = function(a,b,v){
		matrixArray[a].setAt(b,v); 
	}

	this.getMatrixAsArray = function(){
		return matrixArray;
	}

	this.setMatrix = function(){ //Overrides instance completely
		
		matrixArray = [];
		if(arguments[0] instanceof Array){
			matrixArray = arguments[0];
			width = matrixArray[0].getLength();
			height = matrixArray.length;
		}else{
			width		= arguments[0].getLength();
			height		= arguments.length;
			for(var i = 0; i < arguments.length; i++){
				if(!(arguments[i] instanceof Vector)) throw 'Error: Matrix objects take vectors or a single array with vectors as elements.'
				if(arguments[i].getLength() != width && width) throw 'Error: All arguments must be the same length.'
				matrixArray.push(arguments[i]);
			}	
		}
	}

	if(arguments[0] instanceof Array){

		matrixArray = arguments[0];
		width = matrixArray[0].getLength();
		height = matrixArray.length;
	}else if(arguments[0] == 'rx'){
		this.rotationX(arguments[1]);
	}else if(arguments[0] == 'ry'){
		this.rotationY(arguments[1]);
	}else if(arguments[0] == 'rz'){
		this.rotationZ(arguments[1]);
	}else{
		width		= arguments[0].getLength();
		height		= arguments.length;
		for(var i = 0; i < arguments.length; i++){
			if(!(arguments[i] instanceof Vector)) throw 'Error: Matrix objects take vectors or a single array with vectors as elements.'
			if(arguments[i].getLength() != width && width) throw 'Error: All arguments must be the same length.'
			matrixArray.push(arguments[i]);

		}	
	}
	
}

Matrix.prototype.multiplyVector = function(v) {
	if(v.getLength() != this.getWidth()) throw "Error: Cannot multiply. Incompatible sizes."
	var vector = new Vector();
	for(var i = 0; i < this.getHeight(); i++){
		vector.setAt(i,this.row(i).dot(v));

	}
	return vector;
};

Matrix.prototype.multiplyMatrix = function(m) {
	
	if(m.getHeight() != this.getWidth()) throw "Error: Cannot multiply matrices. Incompatible sizes."
	var matrixA = [];
	for(var i = 0; i < this.getWidth(); i++){
		matrixA.push(new Vector());
	}
	for(var i = 0; i < this.getWidth(); i++){
		for(var j = 0; j < this.getWidth(); j++){
			matrixA[i].setAt(j,this.row(i).dot(m.column(j)));
		}
	}

	var matrix = new Matrix(matrixA);
	return matrix;

};

Matrix.prototype.multiply = function(s) {
	for(var i = 0; i < this.getHeight(); i++){
		this.setRow(i,this.row(i).multiply(s));
	}
};

Matrix.prototype.rotationX = function(theta) { //Makes this matrix the rotation matrix about the x axis for theta degrees
	this.setMatrix(new Vector(1,0,0),
				   new Vector(0,Math.cos(theta),-Math.sin(theta)),
				   new Vector(0,Math.sin(theta),Math.cos(theta)));
	
};

Matrix.prototype.rotationY = function(theta) { //Makes this matrix the rotation matrix about the y axis for theta degrees
	this.setMatrix(new Vector(Math.cos(theta),0,Math.sin(theta)),
				   new Vector(0,1,0),
				   new Vector(-Math.sin(theta),0,Math.cos(theta)));
};

Matrix.prototype.rotationZ = function(theta) { //Makes this matrix the rotation matrix about the z axis for theta degrees
	this.setMatrix(new Vector(Math.cos(theta),-Math.sin(theta),0),
				   new Vector(Math.sin(theta),Math.cos(theta),0),
				   new Vector(0,0,1));
};
function Triangle3D(p1,p2,p3,m){ //position vectors as first three parameters and material
	this.p1 			= p1;
	this.p2 			= p2;
	this.p3 			= p3;
	this.material 		= m;
	this.normal1 		= this.normal(); //normal for vertex 1
	this.normal2 		= this.normal(); //normal for vertex 2
	this.normal3 		= this.normal(); //normal for vertex 3
	this.flip 			= false;
	this.mid 			= this.p1.add(this.p2).add(this.p3).multiply(1/3);
	this.squareDistance;
}

Triangle3D.prototype.midPoint = function() {
	var midPoint = this.p1.add(this.p2).add(this.p3).multiply(1/3);
	return midPoint;
};

Triangle3D.prototype.normal = function(){
	var v1 = this.p1.subtract(this.p2);
	var v2 = this.p3.subtract(this.p2);
	if(this.flip){
		return v1.cross(v2).multiply(-1);
	}else{
		return v1.cross(v2);
	}
	
}

Triangle3D.prototype.getMaterial = function() {
	return this.material;
};
function Triangle3D(p1,p2,p3,m){ //position vectors as first three parameters and material
	this.p1 = p1;
	this.p2 = p2;
	this.p3 = p3;
	this.material = m;
}

Triangle3D.prototype.midPoint = function() {
	var midPoint = this.p1.multiply(1/3);
	midPoint = midPoint.add(this.p2.multiply(1/3));
	midPoint = midPoint.add(this.p3.multiply(1/3));
	
	return midPoint;
};

Triangle3D.prototype.normal = function(){
	var v1 = this.p1.subtract(this.p2);
	var v2 = this.p3.subtract(this.p2);
	return v1.cross(v2);
}

Triangle3D.prototype.getMaterial = function() {
	return this.material;
};
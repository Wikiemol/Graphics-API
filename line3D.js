function Line3D(p1,p2,material){
	this.p1 = p1;
	this.p2 = p2;
	this.material = material;
	this.mid 	= this.p1.add(this.p2).multiply(1/2);
}

Line3D.prototype.midPoint = function() {
	var midPoint = this.p1.add(this.p2).multiply(1/2);
	return midPoint;
};

Line3D.prototype.getMaterial = function() {
	return this.material;
};
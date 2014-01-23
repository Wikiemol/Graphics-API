define(["vector3D"],function(Vector3D){
  function Plane(x,y,z,n,m){ //p is a point on the plane, n is the normal to the plane, and m is the material of the plane;
    this.point    = new Vector3D(x,y,z);
    this.normal   = n;
    this.material = m;
    
  }
  
  Plane.prototype.intersect = function(ray) {
      //uses paremetric intersection
  
      var direction = ray.direction;
      var origin    = ray.origin;
      
      //((point on the plane minus the origin of the ray) dotted by the normal of the plane) divided by 
      //(the direction of the ray dotted by the normal of the plane)
      var t = (this.point.subtract(origin).dot(this.normal)) / (direction.dot(this.normal));
      
      //if denominator is non 0 and (if it is a shadow cast) the point is between the origin and direction vector
      var intersect = direction.multiply(t).add(origin);
      
      //if the direction of the ray is not orthogonal to the normal of the plane and 
      //the intersection is in front of the origin of the ray
      
      //if the ray is not orthogonal to the normal and
      //the intersection is in front of the origin of the ray and
      //and if the ray is a shadow ray the intersection is in behind the end of the ray
      if (direction.dot(this.normal) !== 0 && t > 0 && ((!ray.shadow) || (t < 1))) {  
        var distance  = origin.subtract(intersect).magnitudeSquared();

        return {"intersection": intersect, 
                "distance": distance, 
                "material": this.material, 
                "normal": this.normal.unit().multiply(-1),
                "t": t,
                "type": "plane"};
      } else {
        return false;
      }
      
  };
  

  return Plane;
});

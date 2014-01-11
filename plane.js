define(["vector3D"],function(Vector3D){
function Plane(x,y,z,n,m){ //p is a point on the plane, n is the normal to the plane, and m is the material of the plane;
  this.point = new Vector3D(x,y,z);
  this.normal = n;
  this.material = m;

}

Plane.prototype.intersect = function(ray) {
    
    var direction = ray.direction;
    var origin    = ray.origin;
    
    var t = (this.point.subtract(origin).dot(this.normal))/(direction.dot(this.normal));
    
    //if denominator is non 0 and (if it is a shadow cast) the point is between the origin and direction vector
    var intersect = direction.multiply(t).add(origin);
    
    if(direction.dot(this.normal) != 0 && t > 0.001 && (!ray.shadow || t < 1)) {  
      var distance  = origin.subtract(intersect).magnitudeSquared();
      // console.log(t)
      return {"intersection": intersect, 
          "distance": distance, 
          "material":this.material, 
          "normal": this.normal.unit().multiply(-1),
          "t": t,
          "type": "plane"}
    }else{
      return false;
    }
    
};

return Plane;
});

//normal.(point - t(direction) - origin) = 0
//normal.(point - origin) - t*normal.direction = 0
//-t*normal.direction = -normal.(point -origin)
// t = normal.(point - origin)/normal.directi

// normal.(t(direction) + origin - point) = 0
// t.normal.direction = -normal(origin - point)
define(["vector3D"], function(Vector3D){
  function Sphere(x, y, z, r, m){
    this.position = new Vector3D(x, y, z);
    this.radius   = r;
    this.material = m;
  }
  /*intersect –– if line created by v - sensor intersects the sphere return an 
   *array [point of intersection, distance of intersection to sensor Squared, material] 
   *else return false
   */
  
  Sphere.prototype.intersect = function(ray){
    var direction = ray.direction;
    var origin    = ray.origin;
    var op = origin.subtract(this.position);
    var A = direction.dot(direction);
    var B = 2 * (direction.dot(op)); 
    var C = op.dot(op) - this.radius * this.radius;
    var discriminant = B * B - 4 * A * C;
    // console.log(origin)
    if (discriminant >= 0){  
      var sqrt = Math.sqrt(discriminant);
      var t1 = (-B + sqrt) / (2 * A);
      var t2 = (-B - sqrt) / (2 * A);
      var t = Math.min(t1, t2);
      if (t >= 0){
        var intersection = direction.multiply(t).add(origin);
        var normal = this.position.subtract(intersection);
        return {"intersection": intersection, 
            "distance": intersection.subtract(origin).magnitudeSquared(), 
            "material": this.material, 
            "normal": normal.unit(),
            "t": t,
            "type": "sphere"};
      } else {
        return false;
      }
    }
    return false;
  };
  return Sphere;
});

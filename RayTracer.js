define(["light","ply","triangle3D","vector3D","material","graphics2D","plane","sphere"], function(Light,PLY,Triangle3D,Vector3D,Material,Graphics2D,Plane,Sphere){
function RayTracer(cxt){
  this.WIDTH = cxt.canvas.width;
  this.HEIGHT = cxt.canvas.height;
  this.cxt = cxt;
  this.sensor     = new Vector3D(0,0,1100);
  this.focalLength    = 600;
  this.lens       = this.sensor.at(2) - this.focalLength;
  this.lights      = [];
  this.objects    = [];  
  this.ambience    = 0.2;
  this.imgData     = this.cxt.getImageData(0,0,this.WIDTH,this.HEIGHT);
  this.cdata      = this.imgData.data;
  this.materialData  = [];
  this.backgroundColor = [0,0,0];
}

RayTracer.prototype.sphere = function(x,y,z,r,m) { //x,y,z is center, r is radius, m is material
  var s = new Sphere(x,y,z,r,m);
  this.objects.push(s);
};

RayTracer.prototype.plane = function(x,y,z,n,m) { //x,y,z is point on the plane, n is normal, m is material
  var plane = new Plane(x,y,z,n,m);
  this.objects.push(plane);
}
RayTracer.prototype.trace = function() {
  
  for(var x = -this.WIDTH/2 + this.sensor.at(0); x < this.WIDTH/2 + this.sensor.at(0); x++){
    for(var y = -this.HEIGHT/2 + this.sensor.at(1); y < this.HEIGHT/2 + this.sensor.at(1); y++){
      var currentPosition = new Vector3D(x,y,this.lens); 
      var ray = {"direction": currentPosition.subtract(this.sensor), "origin": this.sensor};
      var intersect = this.cast(ray);
      if(intersect && intersect.intersection.at(2) < this.lens){
        var illumination = this.ambience;
        var viewVector = this.sensor.subtract(intersect.intersection); //vector from the intersection to the camera
        var reflectionVector = viewVector.reflectOver(intersect.normal); //view Vector reflected
        var reflectionRay = {"direction": reflectionVector.subtract(intersect.intersection), "origin": intersect.intersection};
        var reflectionCast = this.cast(reflectionRay);
        var reflectionIllumination = this.ambience; //illumination of the object that was reflected
        
        for(var i = 0; i < this.lights.length; i++){
          //the illumination of the current point without reflection
          var shadowRay = {"direction": this.lights[i].pos.subtract(intersect.intersection), "origin": intersect.intersection, "shadow": true};
          var cast = this.cast(shadowRay);
          if(!cast){
            illumination += this.illuminate(intersect.intersection,intersect.normal,intersect.material,this.lights[i]);
          }
          //the illumination of the point that will be reflected
          if(reflectionCast){
            var refshadowRay = {"direction": this.lights[i].pos.subtract(reflectionCast.intersection), "origin": reflectionCast.intersection, "shadow": true};
            var refcast = this.cast(refshadowRay);
          
            if(!refcast){
              reflectionIllumination += this.illuminate(reflectionCast.intersection,reflectionCast.normal,reflectionCast.material,this.lights[i]);
            }
          }
        }
        
        //this RGB
        var thisred   = intersect.material.c[0]*illumination;
        var thisblue  = intersect.material.c[1]*illumination;
        var thisgreen  = intersect.material.c[2]*illumination;
        var refred;
        var refblue;
        var refgreen;
        //reflection RGB
        if(reflectionCast){
          
          refred = reflectionCast.material.c[0]*reflectionIllumination;
          refblue = reflectionCast.material.c[1]*reflectionIllumination;
          refgreen = reflectionCast.material.c[2]*reflectionIllumination;
        
          //adding these factors to this RGB gives us how close the color is to the reflected color vs itself.
          //if not reflective at all, this won't affect the color.
        }else{
          refred = this.backgroundColor[0];
          refgreen = this.backgroundColor[1];
          refblue = this.backgroundColor[2];
          
        }
        var rfactor = (refred - thisred)*intersect.material.reflectivity;
        var bfactor = (refblue - thisblue)*intersect.material.reflectivity;
        var gfactor = (refgreen - thisgreen)*intersect.material.reflectivity;
        
        //full RGB
        var red = thisred + rfactor;
        var blue = thisblue + bfactor;
        var green = thisgreen + gfactor;
        this.drawPixel(x - this.sensor.at(0),y - this.sensor.at(1),[red,blue,green],intersect.material.c);
      }else{
        this.drawPixel(x - this.sensor.at(0),y - this.sensor.at(1),this.backgroundColor,null)
      }
    }
  }
  
  this.cxt.putImageData(this.imgData,0,0);
};

RayTracer.prototype.bounce = function(ray,currentIllumination,numberOfBounces) {
  var intersect = this.cast(ray);
  var distance = ray.origin.subtract(intersect.intersection).magnitudeSquared(); //distance between ray origin and point intersected
  var isSeen = false;
};

RayTracer.prototype.drawPixel = function(x1,y1,color,materialColor){
  var  x = x1+this.WIDTH/2;
  var  y = -y1+this.HEIGHT/2;
  
  if(x < this.WIDTH && x >= 0 && y < this.HEIGHT && y >= 0){
    var point = (x+y*this.WIDTH)*4;

    this.cdata[point + 0] = color[0]; //r
    this.cdata[point + 1] = color[1]; //g
    this.cdata[point + 2] = color[2]; //b
    this.cdata[point + 3] = 255; //a

    this.materialData[(x+y*this.WIDTH)] = materialColor; 
  }
}
RayTracer.prototype.cast = function(ray){
  var intersect = false; 
  for(var k = 0; k < this.objects.length; k++){
    var temp = this.objects[k].intersect(ray);
    if(temp && (!intersect || temp.distance < intersect.distance) && (temp.intersection.vectorArray != ray.origin.vectorArray) ){
      intersect = temp;
    }
  }
  return intersect
}
RayTracer.prototype.illuminate = function(point,normal,material,light){
  var illumination = 0;
  var specularLight = light.specularIntensityVector(point.at(0),point.at(1),point.at(2))
  var specularIntensity = light.intensityAt(point.at(0),point.at(1),point.at(2)).at(1);
  var diffusionIntensity = light.intensityAt(point.at(0),point.at(1),point.at(2)).at(0);
  var Lm = point.subtract(light.pos).unit();
  var lightReflection = Lm.reflectOver(normal);
  if(Lm.dot(normal) > 0){
    illumination += light.diffusion*(Lm.dot(normal))*diffusionIntensity          
  }
  if(lightReflection.dot(point.subtract(this.sensor)) > 0){
    illumination += light.specularity*Math.pow((lightReflection.dot(point.subtract(this.sensor).unit())),material.shine)*specularIntensity
  }

  return illumination;
}
RayTracer.prototype.projectPoint = function(x_1,y_1,z_1){ //Takes a point in 3d space
  var t1 = (this.getLens()-this.sensor.at(2))/(this.sensor.at(2) - z_1); //the t derived from the z component of the parametric line between the point to be projected and the sensor assuming the line intersects the lens, the lens is flat, and the lens is parallel to the xy plane
  var x1 = this.sensor.at(0)+this.sensor.at(0)*t1-t1*x_1; //x component of the parametric line between the point to be projected and the sensor
  var y1 = this.sensor.at(1)+this.sensor.at(1)*t1-t1*y_1; //y component of the parametric line between the point to be projected and the sensor
  return new Vector2D(x1-this.sensor.at(0),y1-this.sensor.at(1));
};

return RayTracer;
});
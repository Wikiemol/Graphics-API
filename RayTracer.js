define(["light","ply","triangle3D","vector3D","material","graphics2D","plane","sphere"], function(Light,PLY,Triangle3D,Vector3D,Material,Graphics2D,Plane,Sphere){
function RayTracer(cxt){
  this.WIDTH            = cxt.canvas.width;
  this.HEIGHT           = cxt.canvas.height;
  this.cxt              = cxt;
  this.sensor           = new Vector3D(0,0,1100);
  this.focalLength      = 600;
  this.lens             = this.sensor.at(2) - this.focalLength;
  this.lights           = [];
  this.objects          = [];  
  this.ambience         = 0;
  this.imgData          = this.cxt.getImageData(0,0,this.WIDTH,this.HEIGHT);
  this.cdata            = this.imgData.data;
  this.materialData     = [];
  this.maxIterations    = 100; //number of iterations to reflefct light
  this.backgroundColor  = [0,0,0];
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
  var scanline = 0; //keeps track of vertical scanline
  var self = this;
  var output = document.getElementById("output") //a div to hold loading text during testing
  var x = -this.WIDTH/2 + this.sensor.at(0); //the initial condition of "for" loop, which is actually recursive in order to simulate asynchronicity
  var scan = function(){ //body of loop below
    for(var y = -self.HEIGHT/2 + self.sensor.at(1); y < self.HEIGHT/2 + self.sensor.at(1); y++){
      var currentPosition = new Vector3D(x,y,self.lens); 
      var ray = {"direction": currentPosition.subtract(self.sensor), "origin": self.sensor};
      self.drawPixel(x - self.sensor.at(0),y - self.sensor.at(1),self.reflect(ray));
    }
  }
  
  setTimeout(function(){ //start loop, initialize rendering text in output div
    output.innerHTML = "rendering 0%";
    next();
  },0)
  
  function next(){ //x = -this.WIDTH/2 + this.sensor.at(0); x <= self.WIDTH/2 + self.sensor.at(0); x++
    scan();
    x++
    scanline++
    if(x <= self.WIDTH/2 + self.sensor.at(0)){
      if(scanline%20 === 0){
        setTimeout(function(){
          output.innerHTML = "rendering " + 100*scanline/self.WIDTH + "%";
          next();
        },0)
      }else{
        next();
      }
    }else{
      
      output.innerHTML = "render complete"
      
    }
    
    self.cxt.putImageData(self.imgData,0,0);
    
  }
  // }
  
  
};
RayTracer.prototype.reflect = function(ray,numberOfIterations){
    if(typeof numberOfIterations === "undefined"){
      numberOfIterations = 0;
    }
    var intersect = this.cast(ray);
    if(intersect && intersect.intersection.at(2) < this.lens){
        var illumination = this.ambience;
        var viewVector = this.sensor.subtract(intersect.intersection); //vector from the intersection to the camera
        var reflectionVector = viewVector.reflectOver(intersect.normal); //view Vector reflected
        var reflectionRay = {"direction": reflectionVector, "origin": intersect.intersection};
        var reflectTrue = this.cast(reflectionRay)
        var reflectionColor;
        var specularIllumination = 0; //this variable is only factored into the reflection. We initialize it to 1 to account for diffusion.
        //the illumination of the current point without reflection
        for(var i = 0; i < this.lights.length; i++){
          //ray from the intersection to the light position.
          var shadowRay = {"direction": this.lights[i].pos.subtract(intersect.intersection), "origin": intersect.intersection, "shadow": true};
          var cast = this.cast(shadowRay);
          if(!cast){
            var l = this.illuminate(intersect.intersection,intersect.normal,intersect.material,this.lights[i],intersect.type)
            illumination += l.total;
            specularIllumination += l.specular
          }
        }
        
        //this RGB
        var thisred   = intersect.material.c[0]*illumination;
        var thisblue  = intersect.material.c[1]*illumination;
        var thisgreen  = intersect.material.c[2]*illumination;
        //calculating reflection color
        if(numberOfIterations <= this.maxIterations && reflectTrue){  //if the reflection vector intersects something 
                                                                      //and we havent bounced more than the max, caculate color
           reflectionColor = this.reflect(reflectionRay,numberOfIterations + 1);
        }else if(!reflectTrue){ //if they didn't hit anything, reflect the background color
          reflectionColor = this.backgroundColor
        }else{ //if number of iterations exceeded, reflect an arbitrary color. 
          reflectionColor = [0,0,0];
        }
        
        var rfactor = (reflectionColor[0] + 255*specularIllumination - thisred)*intersect.material.reflectivity;
        var bfactor = (reflectionColor[1] + 255*specularIllumination - thisblue)*intersect.material.reflectivity;
        var gfactor = (reflectionColor[2] + 255*specularIllumination - thisgreen)*intersect.material.reflectivity;
        
        //full RGB
        var red = thisred + rfactor;
        var blue = thisblue + bfactor;
        var green = thisgreen + gfactor;
        return [red,blue,green]
      }else{
        return this.backgroundColor
      }
}
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
RayTracer.prototype.illuminate = function(point,normal,material,light,type){
  
  var specularLight = light.specularIntensityVector(point.at(0),point.at(1),point.at(2));
  var specularIntensity = light.intensityAt(point.at(0),point.at(1),point.at(2)).at(1);
  var diffusionIntensity = light.intensityAt(point.at(0),point.at(1),point.at(2)).at(0);
  var Lm = point.subtract(light.pos).unit();
  var lightReflection = Lm.reflectOver(normal);
  var diffuseComponent = 0;
  var specularComponent = 0;
  if(Lm.dot(normal) > 0){
    diffuseComponent += light.diffusion*(Lm.dot(normal))*diffusionIntensity;
  }
  if(lightReflection.dot(point.subtract(this.sensor)) > 0){
    specularComponent += light.specularity*Math.pow((lightReflection.dot(point.subtract(this.sensor).unit())),material.shine)*specularIntensity
  }
  var illumination = diffuseComponent + specularComponent;
  
  return {"total": illumination, "specular": specularComponent, "diffuse": diffuseComponent};
}
RayTracer.prototype.projectPoint = function(x_1,y_1,z_1){ //Takes a point in 3d space
  var t1 = (this.getLens()-this.sensor.at(2))/(this.sensor.at(2) - z_1); //the t derived from the z component of the parametric line between the point to be projected and the sensor assuming the line intersects the lens, the lens is flat, and the lens is parallel to the xy plane
  var x1 = this.sensor.at(0)+this.sensor.at(0)*t1-t1*x_1; //x component of the parametric line between the point to be projected and the sensor
  var y1 = this.sensor.at(1)+this.sensor.at(1)*t1-t1*y_1; //y component of the parametric line between the point to be projected and the sensor
  return new Vector2D(x1-this.sensor.at(0),y1-this.sensor.at(1));
};

return RayTracer;
});
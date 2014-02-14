define(["light", "ply", "triangle3D", "vector3D", "material", "graphics2D", "plane", "sphere", "graphics3D", "ray"], 
        function(Light, PLY, Triangle3D, Vector3D, Material, Graphics2D, Plane, Sphere, Graphics3D, Ray) {
          function RayTracer(cxt) { /* Extends Graphics 3D*/ 
            //see Graphics3D.js for explanation of these variables
            this.WIDTH        = cxt.canvas.width;
            this.HEIGHT       = cxt.canvas.height;
            this.cxt          = cxt;
            this.sensor       = new Vector3D(0, 0, 1100);
            this.focalLength  = 600;
            this.lens         = this.sensor.at(2) - this.focalLength;
            this.lights       = [];
            this.queue        = [];  
            this.ambience     = 0;
            this.materialData = [];
            //The graphics2D object to use for drawing
            //to the canvas.
            this.g = new Graphics2D(this.cxt);
            this.g.standard_coordinates = true;

            //An array holding the image data for frames if the scene is animated
            this.frames = [];

            //number of iterations to reflect light
            this.maxIterations   = 1;
            this.backgroundColor = [0, 0, 0];
          }

          //Extends Graphics3D
          RayTracer.prototype = Object.create(Graphics3D.prototype);

          //x, y, z is center, r is radius, m is material
          //adds a sphere.js object to the scene
          RayTracer.prototype.sphere = function(x, y, z, r, m) { 
            var s = new Sphere(x, y, z, r, m);
            this.queue.push(s);
          };

          //x, y, z is point on the plane, n is normal, m is material
          //adds a plane.js object to the scene
          RayTracer.prototype.plane = function(x, y, z, n, m) {
            var plane = new Plane(x, y, z, n, m);
            this.queue.push(plane);
          };

          //renders the scene and updates the canvas after a set number of 
          //scanlines have been added to the imgdata array
          RayTracer.prototype.render = function() {
            //Keeps track of vertical scanline.
            //Used for deciding when to update the screen 
            //while rendering.
            var scanline = 0; 
            var self = this;
            var date = new Date;
            var i = 0;
            setTimeout(loop, 0); 

            //This loop goes through every pixel in the canvas
            //and renders the correct color.
            //It must be a single loop in order to use the setTimeout method to update the screen while loading
            //If we use a nested loop, the setTimeout calls make the output somewhat unpredictable 
            //(because it creates asynchronicity between the two for loops)
          
            function loop() {

                   var row = i % self.HEIGHT;
                   var column = Math.floor(i / self.WIDTH);
                   var x = column - self.WIDTH / 2 + self.sensor.at(0);
                   var y = row - self.HEIGHT / 2 + self.sensor.at(1);

                   //Current point being rendered on the lens plane
                   var currentPosition = new Vector3D(x, y, self.lens); 

                   //The ray between the camera and the point on the plane
                   var ray = new Ray(currentPosition.subtract(self.sensor), self.sensor);
 
                   //Drawing the pixel relative to where the position of the camera. Reflect() returns a color 
                   //based on the objects in the scene.
                   self.g.drawPixel(x - self.sensor.at(0), y - self.sensor.at(1), self.reflect(ray));
 
                   self.g.draw();
                   i++; 

                   if (i < self.WIDTH * self.HEIGHT) {
                        var newDate = new Date;
                        var interval = 33;

                        //if <interval> time has passed since the last screen update
                        //  update the date when the last screen update occured
                        //  update the screen
                        //otherwise
                        //  run through the loop like normal

                        if (newDate - date > interval) {
                            date = newDate;
                            setTimeout(loop, 0);
                        } else {
                            loop();
                        }
                   } else {
                           console.log("Render Complete");
                   }

            }

          };

          //Loads img data for the frame and stores it in g
          RayTracer.prototype.loadImgData = function() {
            var x;

            //pointer to a date
            var date = [new Date];
            for (x = -this.WIDTH / 2 + this.sensor.at(0); 
              x <= this.WIDTH / 2 + this.sensor.at(0); 
              x++) {

                for (var y = -this.HEIGHT / 2 + this.sensor.at(1); 
                    y < this.HEIGHT / 2 + this.sensor.at(1); 
                    y++) {
                    this.scan(x, y, date);
                }
            }
          };
         
          RayTracer.prototype.reflect = function(ray, numberOfIterations) {
            

              //initializing the number of iterations
              if (typeof numberOfIterations === "undefined") {
                numberOfIterations = 0;
              }

              var intersect = this.cast(ray);
              
              //The cast() function returns the intersection information
              //returned based on the object's intersect function. 
              //(see intersect function in plane.js or sphere.js)

              //It is an object of the form

              /* {"intersection": A vector3D object that is the point of intersection 
                  "distance": The distance between the ray origin and the intersection point, 
                  "material": The material of the object, 
                  "normal": The normalized normal vector,
                  "t": The value that satisfies the equation t*ray = intersection,
                  "type": A string that tells the type of the object (i.e. "sphere" or "plane")}
              */

              //if the ray hit something, and what it hit was in front of the camera
              if (intersect && intersect.intersection.at(2) < this.lens) {
                  //initializing illumination, will be added to with each light
                  var illumination = 0;

                  //vector from the intersection to the camera
                  var viewVector = ray.origin.subtract(intersect.intersection); 

                  //view Vector reflected
                  var reflectionVector = viewVector.reflectOver(intersect.normal); 
                  var reflectionRay = new Ray(reflectionVector, intersect.intersection);
                  var reflectTrue = this.cast(reflectionRay);
                  var reflectionColor;

                  //This variable is only factored into the reflection. 
                  var specularIllumination = 0; 

                  //the illumination of the current point
                  for (var i = 0; i < this.lights.length; i++) {

                    //ray from the intersection to the light position.
                    var shadowRay = new Ray(this.lights[i].position.subtract(intersect.intersection), 
                                            intersect.intersection, 
                                            true);

                    var cast = this.cast(shadowRay);
                    //if there isnt a shadow
                    //  illuminate the point
                    if (!cast) {

                      var l = this.illuminate(intersect.intersection, 
                                              intersect.normal, 
                                              intersect.material, 
                                              this.lights[i], 
                                              intersect.type);
                      
                      illumination += l.total;
                      specularIllumination += l.specular;
                    }
                  }
                  
                  //The RGB illuminated without reflection
                  var thisred   = intersect.material.color[0] * illumination;
                  var thisblue  = intersect.material.color[1] * illumination;
                  var thisgreen = intersect.material.color[2] * illumination;

                  
                  //calculating the color of a pure reflection
                  //if the reflectionray hits something
                  //  reflection color is the color of what it hit
                  //if it didn't hit anything
                  //  the reflection color is the background color
                  //if the number of iterations are exceeded
                  //  reflect an arbitrary color
                  
                  if (numberOfIterations <= this.maxIterations && reflectTrue) {     
                    reflectionColor = this.reflect(reflectionRay, numberOfIterations + 1);
                  } else if (!reflectTrue) { 
                    reflectionColor = this.backgroundColor;
                  } else {
                    //return [255, 128, 0]; 
                    reflectionColor = [0, 0, 0];
                  }
                  
                  //Scattering light and averaging the color to get an ambient component
                  //var scatter = this.scatter(intersect.intersection, intersect.normal);
                  //var scatterColor = [0, 0, 0];
                  //for (var i = 0; i < scatter.length; i++) {
                  //  if (numberOfIterations < this.maxIterations) {
                  //      var scatterRay = new Ray(scatter[i].subtract(intersect.intersection), intersect.intersection);
                  //      var scatterRayColor = this.reflect(scatterRay, numberOfIterations + 1);
                  //      scatterColor[0] += scatterRayColor[0];
                  //      scatterColor[1] += scatterRayColor[1];
                  //      scatterColor[2] += scatterRayColor[2];
                  //  } else {
                  //      scatterColor = this.backgroundColor;
                  //      break;
                  //  }
                  //}
                  //if (i !== 0) {
                  //  scatterColor[0] /= i;
                  //  scatterColor[1] /= i;
                  //  scatterColor[2] /= i;
                  //}

                  //The difference between the rgb without reflection and the pure reflection rgb
                  //This is then multiplied by the reflectivity of the material to mix the color without reflection
                  //and the color with reflection
                  var rfactor = (reflectionColor[0] + 255 * specularIllumination - thisred) * intersect.material.reflectivity;
                  var bfactor = (reflectionColor[1] + 255 * specularIllumination - thisblue) * intersect.material.reflectivity;
                  var gfactor = (reflectionColor[2] + 255 * specularIllumination - thisgreen) * intersect.material.reflectivity;
                  
                  //full RGB

                  var red = thisred + rfactor;
                  var blue = thisblue + bfactor;
                  var green = thisgreen + gfactor;
                  return [red, blue, green];

                //if nothing was intersected by the view vector
                //  return the background color
                } else {
                  return this.backgroundColor;
                }
          };
          
          //returns an object with information about the point the ray intersects.

          /* {"intersection": A vector3D object that is the point of intersection 
                  "distance": The distance between the ray origin and the intersection point, 
                  "material": The material of the object, 
                  "normal": The normalized normal vector,
                  "t": The value that satisfies the equation t*ray = intersection,
                  "type": A string that tells the type of the object (i.e. "sphere" or "plane")}
          */
          RayTracer.prototype.cast = function(ray) {
            var intersect = false; 
            for (var k = 0; k < this.queue.length; k++) {
              var temp = this.queue[k].intersect(ray);
              //if ray intersects the current object in the queue and
              //(no other objects have been intersected or 
              //this intersection is the closest to origin of the ray)
              //  this intersection may be the right one
              if (temp && 
                 (!intersect || 
                 temp.distance < intersect.distance)) {

                intersect = temp;
              }
            }
            return intersect;
          };

          //Animates Camera from init (vector3D object) to end (also vector3D object) at a speed of speed/unit
          RayTracer.prototype.animateCamera = function(init, end, speed){
            var self = this;
            //Direction is the vector in the direction of movement
            var direction = end.subtract(init);
            var velocity = direction.unit().multiply(speed);
            //initialize sensor

            this.setSensor(init.at(0), init.at(1), init.at(2));

            //The number of steps between the init and end points
            var steps = (direction.magnitude()) / (velocity.magnitude());

            var i = 0;

            setTimeout(function() {
                self.cxt.fillStyle = "#AAAAFF";
                self.cxt.fillText("Loading 0%", 10, 10);
                loop();

            }, 0);

            //for i = 0; i < the number of frames; i++
            function loop() {
              
              //loads image data into graphics2D object
              self.loadImgData();

              //push frame data into frame array for playback later
              self.frames.push(copy(self.g.cdata));

              //The new sensor position is the velocity added to the sensor
              var newSensor = self.sensor.add(velocity);
              self.setSensor(newSensor.at(0), newSensor.at(1), newSensor.at(2));

              //A function that copies an array into another array and returns it
              //This is apparently the fastest way according to http://jsperf.com/new-array-vs-splice-vs-slice/19
              //Plus, imageData is a Uint8ClampedArray and has no methods like slice
              function copy(a){
                var result = [];
                for (var j = 0; j < a.length; j++) {
                  result.push(a[j]);
                }

                return result;
              }

              if (i > steps) {
                //An alert so that I can goof off while its loading
                //without worrying about missing anything.
                alert("Load Complete");

                i = 0;

                //Loops through frame array over and over again, 
                //displaying each frame on the screen.
                setInterval(function() {
                  //Put the image data on the screen
                  self.g.cdata.set(self.frames[i]);
                  self.cxt.putImageData(self.g.imageData, 0, 0);

                  //Next frame;
                  i++;

                  //If we've reached the end of the frame array
                  //  go back to the beginning.
                  if (i >= self.frames.length) {
                    i = 0;
                  }
                }, 33);
                return;

              }

              i++;
              setTimeout(function() {
                self.cxt.clearRect(0, 0, self.WIDTH, self.HEIGHT);
                self.cxt.putImageData(self.g.imageData, 0, 0);
                self.cxt.fillStyle = "#AAAAFF";

                //Rounds to two decimal places
                self.cxt.fillText("Loading " + Math.round(100 * 100 * i / steps)/100 + "%", 10, 10);
                loop();  
              }, 0);
            }

            
          };

          //returns an array of vertices to be used for light scattering. 
          RayTracer.prototype.scatter = function(center, normal) {
                  var w = 100;
                  var h = 100;
                  var y = center.at(1) + normal.at(1);
                  var vertices = [];
                  var xIncrement = w / 10;
                  var yIncrement = h / 10;
                  for (var i = 0; i < w; i += xIncrement) {
                          var x = normal.at(0) + center.at(0) + i - w / 2;
                          for (var j = 0; j < h; j += xIncrement) {
                               var z = normal.at(2) + center.at(2) + j - h / 2; 
                               vertices.push(new Vector3D(x, y, z));
                          }
                  }
                  return vertices;
          };

          return RayTracer;
});

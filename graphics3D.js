define(["light", "triangle3D", "vector3D", "vector2D", "material", "graphics2D"], function(Light, Triangle3D, Vector3D, Vector2D, Material, Graphics2D) {
    function Graphics3D(context) {
        this.cxt = context;

        //If set to true the origin will be at the center of the screen
        //and the y values will increase upward instead of downward.
        this.standard_coordinates = false;
        
        //The viewpoint position.
        this.sensor = new Vector3D(0, 0, 1100);
        
        //The distance between the lens and the sensor.
        //Set using setFocalLength.
        this.focalLength = 600;

        //The position of the lens. Set using focal length.
        //The lens is currently a flat plane.
        this.lens = this.sensor.at(2) - this.focalLength;
        
        //The render queue for the scene. Holds every
        //object that will be drawn with draw().
        this.queue = [];
        
        //Holds all lights in the scene.
        this.lights = [];

        //The current material.
        this.material = new Material("#808080", 1);

        //The type of shading to be used.
        //Curently allows for 'flat' and 'gouraud'.
        this.shading = 'gouraud';
    }

    //Returns the absolute color of a point based on lighting in the scene.
    Graphics3D.prototype.applyLight = function(point, normal, material) {

        //Gets the unit vector of the normal.
        var normal = normal.unit();
        
        //Uses Phong illumination model. Applied for each light.    
        var illumination = 0;
        for (var i = 0; i < this.lights.length; i++) {
            var light              = this.lights[i];
            var specularLight      = this.lights[i].specularIntensityVector(point.at(0), point.at(1), point.at(2));
            var specularIntensity  = light.intensityAt(point.at(0), point.at(1), point.at(2)).at(1);
            var diffusionIntensity = light.intensityAt(point.at(0), point.at(1), point.at(2)).at(0);
            var Lm                 = point.subtract(light.position).unit();
            var lightReflection    = normal.multiply(2 * (Lm.dot(normal))).subtract(Lm);
            if (Lm.dot(normal) > 0) {
                    illumination += light.diffusion * (Lm.dot(normal)) * diffusionIntensity; 
                            
            }
            if (lightReflection.dot(point.subtract(this.sensor)) > 0) {    
                illumination += light.specularity * Math.pow((lightReflection.dot(point.subtract(this.sensor).unit())), material.shine) * specularIntensity;
            }
        }
        
        //Apply illumination and return.
        var red = material.color[0] * illumination;
        var blue = material.color[1] * illumination;
        var green = material.color[2] * illumination;
        
        return [red, blue, green];
    };
    
    //Returns the distance between a point and the camera
    Graphics3D.prototype.sensorDistance = function(x, y, z) {
        var distance = Math.sqrt((x - this.sensor.at(0)) * (x - this.sensor.at(0)) + (y - this.sensor.at(1)) * (y - this.sensor.at(1)) + (z - this.sensor.at(2)) * (z - this.sensor.at(2))); 
        return distance;
    };

    //Adds a light to the scene.
    Graphics3D.prototype.addLight = function(l, visible) {
        this.lights.push(l);
        //If visible is set to true
        //  draw a triangle at the position of the light.
        if (visible) {
            this.fillTriangle(-10 + l.pos.at(0), -10 + l.pos.at(1), l.pos.at(2),
                              10 + l.pos.at(0), -10 + l.pos.at(1), l.pos.at(2),
                              l.pos.at(0), 10 + l.pos.at(1), l.pos.at(2));
        }
    };
    
    //sets the material of the scene
    Graphics3D.prototype.setMaterial = function(cl) {
        this.material = new Material({"color": cl.color,
                                "diffusion": cl.diffusion,
                                "ambience": cl.ambience,
                                "specularity": cl.specularity,
                                "shine": cl.shine,
                                "specularExponent": cl.specularExponent,
                                "specularMultiplier": cl.specularMultiplier});
    };

    //Sets the sensor position and moves the lens relative to it.
    Graphics3D.prototype.setSensor = function(x, y, z) {
        this.sensor.set(x, y, z);
        this.lens = z - this.focalLength;
    };

    //Sets the focal length and moves the lens
    Graphics3D.prototype.setFocalLength = function(p) {
        this.focalLength = p;
        if (this.focalLength <= 0) {
            this.focalLength = 1;
        }
        this.lens = this.sensor.at(2) - this.focalLength;
    };
    
    //Renders the scene
    //lights true/false, ambience true/false, ambienceOnly true/false. 
    //Pass an object i.e. {"lights": false, "ambience": false, "ambienceOnly": true}
    Graphics3D.prototype.draw = function(t) { 
        var lightIsOn = true;
        var ambienceIsOn = true;
        var ambienceOnly = false;

        //if t is not undefined
        //  set variables above accordingly
        if (typeof t !== 'undefined') {
            if (typeof t.lights !== 'undefined') {
                lightIsOn = t.lights;
            }
    
            if (typeof t.ambience !== 'undefined') {
                ambienceIsOn = t.ambience;
            }
            if (typeof t.ambienceOnly !== 'undefined') {
                ambienceOnly = t.ambienceOnly;
            }
        }

        //The 2D graphics instance we use to draw pixels
        var g = new Graphics2D(this.cxt);
        //Setting the coordinates to match these coordinates
        g.standard_coordinates = this.standard_coordinates;
        var self = this;
        
        this.queue = this.queue.sort(function(a, b) { //sorts the queue 
            return b.squareDistance - a.squareDistance;
        });
        
        //will hold the color of each vertex for gouraud shading
        var vertexColors = {}; 
        var queueLength = this.queue.length;
        //Drawing all objects in queue
        for (var i = 0; i < queueLength; i++) {
            //Triangle may also be a line, 
            //but most objects in the queue are triangles.
            var triangle = this.queue[i];

            if (triangle instanceof Triangle3D) {
                
                var triangleMaterial = triangle.getMaterial();

                //If Triangle is in front of the lens
                if (triangle.p1.at(2) < this.lens && triangle.p2.at(2) < this.lens && triangle.p3.at(2) < this.lens) { 
                    //project the points
                    var proj1 = this.projectPoint(triangle.p1.at(0), triangle.p1.at(1), triangle.p1.at(2));
                    var proj2 = this.projectPoint(triangle.p2.at(0), triangle.p2.at(1), triangle.p2.at(2));
                    var proj3 = this.projectPoint(triangle.p3.at(0), triangle.p3.at(1), triangle.p3.at(2));

                    if (lightIsOn) {
                        switch (this.shading) {
                            
                            case 'flat':

                                g.fillTriangle(proj1.at(0), proj1.at(1),
                                               proj2.at(0), proj2.at(1),
                                               proj3.at(0), proj3.at(1),
                                               this.applyLight(triangle.mid, triangle.normal(), triangleMaterial));
    
                                break;
        
                            case 'gouraud':
                                //gets the normal at each vertex.
                                //This is calculated beforehand in ply.js
                                //and should be calculated in any mathods 
                                //that create 3D objects.
                                var p1normal = triangle.normal1;
                                var p2normal = triangle.normal2;
                                var p3normal = triangle.normal3;
                                
                                //Will be the color at each vertex.
                                var color1;
                                var color2;
                                var color3;
                                
                                /***The color is calculated for each vertex***/
                                
                                //if the vertex color has not already been stored, 
                                //  run applyLight on the point.
                                //Otherwise
                                //  we don't have to run applyLight again.

                                var vertexColor1 = vertexColors[triangle.p1.at(0) + "," + triangle.p1.at(1) + "," + triangle.p1.at(2)];
                                var vertexColor2 = vertexColors[triangle.p2.at(0) + "," + triangle.p2.at(1) + "," + triangle.p2.at(2)];
                                var vertexColor3 = vertexColors[triangle.p3.at(0) + "," + triangle.p3.at(1) + "," + triangle.p3.at(2)];

                                if (typeof vertexColor1 === 'undefined') {
                                    color1 = this.applyLight(triangle.p1, p1normal, triangleMaterial);
                                    vertexColors[triangle.p1.at(0) + "," + triangle.p1.at(1) + "," + triangle.p1.at(2)] = color1;
                                } else {
                                    color1 = vertexColor1;
                                }
                                
                                if (typeof vertexColor2 === 'undefined') {
                                    color2 = this.applyLight(triangle.p2, p2normal, triangleMaterial);
                                    vertexColors[triangle.p2.at(0) + "," + triangle.p2.at(1) + "," + triangle.p2.at(2)] = color2;
                                }else {
                                    color2 = vertexColor2;
                                }

                                if (typeof vertexColor3 === 'undefined') {
                                    color3 = this.applyLight(triangle.p3, p3normal, triangleMaterial);
                                    vertexColors[triangle.p3.at(0) + "," + triangle.p3.at(1) + "," + triangle.p3.at(2)] = color3;
                                } else {
                                    color3 = vertexColor3;
                                }
                                
                                //Draw the triangle to the screen
                                g.interpolateTriangle(proj1.at(0), proj1.at(1),
                                        proj2.at(0), proj2.at(1),
                                        proj3.at(0), proj3.at(1),
                                        color1[0], color1[1], color1[2],
                                        color2[0], color2[1], color2[2],
                                        color3[0], color3[1], color3[2]);
                                break;
                                
                            default:
                                console.warn("Warning: Graphics3D.shading is set to " + this.shading + ". This shading type is not supported.");
                                break;
                        }
                    //If lightOn is set to false
                    //  we don't need to run applylight.
                    } else {
                        g.setColor(triangleMaterial.getColor());
                        g.fillTriangle(proj1.at(0), proj1.at(1), proj2.at(0), proj2.at(1), proj3.at(0), proj3.at(1));
                    }
                    
                    
                }
            //if triangle is a line
            //  and line is in front of the camera
            //      project the points onto the plane
            //      and draw the line.
            }else if (triangle instanceof Line3D) { 
                if (triangle.p1.at(2) < this.lens && triangle.p2.at(2) < this.lens) {
                    var proj1 = this.projectPoint(triangle.p1.at(0), triangle.p1.at(1), triangle.p1.at(2));
                    var proj2 = this.projectPoint(triangle.p2.at(0), triangle.p2.at(1), triangle.p2.at(2));
                    g.color = triangle.material.getColor();
                    g.drawLine(proj1.at(0), proj1.at(1), proj2.at(0), proj2.at(1));
                }
            }
        }
        //draw the 2D scene and empty the queue.
        g.draw();
        this.queue = [];

        //We also empty the lights array, assuming that the user is either 
        //calling draw() for the last time or doing animation of some kind 
        //and the lights will be added back by the user in every
        //frame.
        
        //If the user wants to add more to the scene after calling draw()
        //then they will have to manage lights manually.
        this.lights = [];
    };
    
    Graphics3D.prototype.getMaterial = function() {
        return this.material;
    };
    
    //Projects a point in 3D onto a 2D plane.
    Graphics3D.prototype.projectPoint = function(x_1, y_1, z_1) { 
        /*the t derived from the z component of the parametric line between the point to be projected and 
        the sensor assuming the line intersects the lens, 
        the lens is flat, 
        and the lens is parallel to the xy plane*/
        var t1 = (this.lens - this.sensor.at(2)) / (this.sensor.at(2) - z_1); 
        //x component of the parametric line between the point to be projected and the sensor
        var x1 = this.sensor.at(0) + this.sensor.at(0) * t1 - t1 * x_1; 
        //y component of the parametric line between the point to be projected and the sensor
        var y1 = this.sensor.at(1) + this.sensor.at(1) * t1 - t1 * y_1; 
        
        return new Vector2D(x1 - this.sensor.at(0), y1 - this.sensor.at(1));
    };
    
    //Adds a line object to the render queue.
    Graphics3D.prototype.drawLine = function(x1, y1, z1, x2, y2, z2) {
        var p1 = new Vector3D(x1, y1, z1);
        var p2 = new Vector3D(x2, y2, z2);
    
        var line = new Line3D(p1, p2, this.getMaterial());
        line.squareDistance = (line.mid.at(0) - this.sensor.at(0)) * (line.mid.at(0) - this.sensor.at(0)) + 
                              (line.mid.at(1) - this.sensor.at(1)) * (line.mid.at(1) - this.sensor.at(1)) + 
                              (line.mid.at(2) - this.sensor.at(2)) * (line.mid.at(2) - this.sensor.at(2));
        this.pushToQueue(line);
    
    };

    //n1 n2 and n3 are normals of vertices as vectors
    //Flip flips the normal of the triangle if set to true
    //Adds a triangle to the render queue
    Graphics3D.prototype.fillTriangle = function(x1, y1, z1, x2, y2, z2, x3, y3, z3, n1, n2, n3, flip) {  
        if (typeof this.getMaterial() === 'undefined') { 
            console.warn("Warning material undefined.");
        }
        var triangle = new Triangle3D(new Vector3D(x1, y1, z1), new Vector3D(x2, y2, z2), new Vector3D(x3, y3, z3), this.getMaterial());
    
        if (n1 instanceof Vector3D) {
            triangle.normal1 = n1;
        }
        if (n2 instanceof Vector3D) {
            triangle.normal2 = n2;
        }
        if (n3 instanceof Vector3D) {
            triangle.normal3 = n3;
        }
        
        //the square of the distance between the triangle and the camera
        triangle.squareDistance = (triangle.mid.at(0) - this.sensor.at(0)) * (triangle.mid.at(0) - this.sensor.at(0)) + 
                                  (triangle.mid.at(1) - this.sensor.at(1)) * (triangle.mid.at(1) - this.sensor.at(1)) + 
                                  (triangle.mid.at(2) - this.sensor.at(2)) * (triangle.mid.at(2) - this.sensor.at(2));
        triangle.flip = flip;
    
        this.pushToQueue(triangle);
    };

    //draws a simple grid onto the screen at the origin.
    Graphics3D.prototype.drawGrid = function() {
        var i;
        var temp = this.getMaterial();
        this.setMaterial(new Material({"color": [128, 128, 128]}));
        for (i = 0; i <= 10; i++) {
            this.drawLine(-300 + i * 60, 0, 300, -300 + i * 60, 0, -300);
        }
        for (i = 0; i <= 10; i++) {
            this.drawLine(-300, 0, -300 + i * 60, 300, 0, -300 + i * 60);
        }
        
        this.setMaterial(temp);
    };
    
    return Graphics3D;
});

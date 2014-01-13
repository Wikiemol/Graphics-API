define(["light","triangle3D","vector3D","vector2D","material","graphics2D"], function(Light,Triangle3D,Vector3D,Vector2D,Material,Graphics2D){
function Graphics3D(context){
    this.cxt                    = context;
    this.standard_coordinates   = false;

    this.sensor                 = new Vector3D(0,0,1100);

    this.focalLength            = 600;
    this.lens                   = this.sensor.at(2) - this.focalLength;

    this.queue                  = [];

    this.lights                 = [];
    this.material               = new Material("#808080",1);
    this.concavePolygons        = false;
    this.shading                = 'gouraud';
}
Graphics3D.prototype.applyLight = function(point,normal,material) {
    var normal = normal.unit();
    var illumination = 0;
    for(var i = 0; i < this.lights.length; i++){
        var light = this.lights[i];
        var specularLight = this.lights[i].specularIntensityVector(point.at(0),point.at(1),point.at(2));
        var specularIntensity = light.intensityAt(point.at(0),point.at(1),point.at(2)).at(1);
        var diffusionIntensity = light.intensityAt(point.at(0),point.at(1),point.at(2)).at(0);
        var Lm = point.subtract(light.pos).unit();
        var lightReflection = normal.multiply(2*(Lm.dot(normal))).subtract(Lm);
        if(Lm.dot(normal) > 0){
                illumination += light.diffusion*(Lm.dot(normal))*diffusionIntensity; 
                        
        }
        if(lightReflection.dot(point.subtract(this.sensor)) > 0){

            illumination += light.specularity*Math.pow((lightReflection.dot(point.subtract(this.sensor).unit())),material.shine)*specularIntensity;
            
        }
    }

    var red = material.c[0]*illumination;
    var blue = material.c[1]*illumination;
    var green = material.c[2]*illumination;
    
    return [red,blue,green];
};

Graphics3D.prototype.sensorDistance = function(x,y,z){
    var distance = Math.sqrt((x-this.sensor.at(0))*(x-this.sensor.at(0)) + (y-this.sensor.at(1))*(y-this.sensor.at(1)) + (z-this.sensor.at(2))*(z-this.sensor.at(2)));
    
    return distance;
};
Graphics3D.prototype.addLight = function(l,visible){
    this.lights.push(l);
    if(visible){
        this.fillTriangle(  -10 + l.pos.at(0), -10 + l.pos.at(1),l.pos.at(2),
                            10 + l.pos.at(0), -10 + l.pos.at(1), l.pos.at(2),
                            l.pos.at(0),10 + l.pos.at(1), l.pos.at(2));
    }
};

Graphics3D.prototype.setMaterial = function(cl){
    
    
    this.material = new Material({"color": cl.color,
                            "diffusion": cl.diffusion,
                            "ambience": cl.ambience,
                            "specularity": cl.specularity,
                            "shine": cl.shine,
                            "specularExponent": cl.specularExponent,
                            "specularMultiplier": cl.specularMultiplier});
};

Graphics3D.prototype.setCoordinates = function(t){
    this.standard_coordinates = t;
};
Graphics3D.prototype.getCoordinates = function(){
    return this.standard_coordinates;
};
Graphics3D.prototype.setSensor = function(x,y,z){
    this.sensor.set(x,y,z);
    this.lens = z - this.focalLength;
};
Graphics3D.prototype.getSensor = function(){
    return this.sensor;
};
Graphics3D.prototype.setFocalLength = function(p){
    this.focalLength = p;
    if(this.focalLength <= 0){
        this.focalLength = 1;
    }
    this.lens = this.sensor.at(2) - this.focalLength;
};
Graphics3D.prototype.getFocalLength = function(){
    return this.focalLength;
};
Graphics3D.prototype.getLens = function(){
    return this.lens;
};
Graphics3D.prototype.pushToQueue = function(p){
    this.queue.push(p);
};
Graphics3D.prototype.setConcavePolygons = function(t){ //Allows for concave polygons to be drawn accurately. However, setting to "true" will make all polygon drawing slower.
    this.concavePolygons = t;
};
Graphics3D.prototype.draw = function(t){ //lights true/false, ambience true/false, ambienceOnly true/false. Pass a curly brackets array i.e. {"lights": false, "ambience": false, "ambienceOnly": true}
    var lightIsOn = true;
    var ambienceIsOn = true;
    var ambienceOnly = false;
    if(typeof t !== 'undefined'){
        if(typeof t.lights !=='undefined'){
            lightIsOn = t.lights;
        }

        if(typeof t.ambience !== 'undefined'){
            ambienceIsOn = t.ambience;
        }
        if(typeof t.ambienceOnly !== 'undefined'){
            ambienceOnly = t.ambienceOnly;
        }
    }
    var g = new Graphics2D(this.cxt);
    
    g.setCoordinates(this.standard_coordinates);
    var self = this;

    this.queue = this.queue.sort(function(a,b){ //sorts the queue 
        return b.squareDistance - a.squareDistance;
    });

  var vertexColors = {}; //will hold the color of each vertex for gouraud shading
    var queueLength = this.queue.length;
    //Drawing polygons
    for(var i = 0; i < queueLength; i++){
        var triangle = this.queue[i];

        if(triangle instanceof Triangle3D){

            var triangleMaterial = triangle.getMaterial();
            if(triangle.p1.at(2) < this.lens && triangle.p2.at(2) < this.lens && triangle.p3.at(2) < this.lens){ //if it is in front of the camera
                //project the points
                var proj1 = this.projectPoint(triangle.p1.at(0),triangle.p1.at(1),triangle.p1.at(2));
                var proj2 = this.projectPoint(triangle.p2.at(0),triangle.p2.at(1),triangle.p2.at(2));
                var proj3 = this.projectPoint(triangle.p3.at(0),triangle.p3.at(1),triangle.p3.at(2));
                if(lightIsOn){
                    switch(this.shading){
                        
                        case('flat'):
                            g.fillTriangle(proj1.at(0),proj1.at(1),proj2.at(0),proj2.at(1),proj3.at(0),proj3.at(1),this.applyLight(triangle.mid,triangle.normal(),triangleMaterial));

                            break;
    
                        case('gouraud'):
                            var p1normal    = triangle.normal1;
                            var p2normal    = triangle.normal2;
                            var p3normal    = triangle.normal3;
                            
                            var color1;
                            var color2;
                            var color3;
                            
                            var vertexColor1 = vertexColors[triangle.p1.at(0) + "," + triangle.p1.at(1) + "," + triangle.p1.at(2)];
                            if(typeof vertexColor1 === 'undefined'){
                                color1 = this.applyLight(triangle.p1, p1normal, triangleMaterial);
                                vertexColors[triangle.p1.at(0) + "," + triangle.p1.at(1) + "," + triangle.p1.at(2)] = color1;
                            }else{
                                color1 = vertexColor1;
                            }

                            var vertexColor2 = vertexColors[triangle.p2.at(0) + "," + triangle.p2.at(1) + "," + triangle.p2.at(2)];
                            if(typeof vertexColor2 === 'undefined'){
                                color2 = this.applyLight(triangle.p2, p2normal, triangleMaterial);
                                vertexColors[triangle.p2.at(0) + "," + triangle.p2.at(1) + "," + triangle.p2.at(2)] = color2;
                            }else{
                                color2 = vertexColor2;
                            }
                            var vertexColor3 = vertexColors[triangle.p3.at(0) + "," + triangle.p3.at(1) + "," + triangle.p3.at(2)];
                            if(typeof vertexColor3 === 'undefined'){
                                color3 = this.applyLight(triangle.p3, p3normal, triangleMaterial);
                                vertexColors[triangle.p3.at(0) + "," + triangle.p3.at(1) + "," + triangle.p3.at(2)] = color3;
                            }else{
                                color3 = vertexColor3;
                            }

                            g.interpolateTriangle(proj1.at(0), proj1.at(1),
                                    proj2.at(0), proj2.at(1),
                                    proj3.at(0), proj3.at(1),
                                    color1[0], color1[1], color1[2],
                                    color2[0], color2[1], color2[2],
                                    color3[0], color3[1], color3[2]);
                            break;


                    }

                }else{
                    g.setColor(triangleMaterial.getColor());
                    g.fillTriangle(proj1.at(0),proj1.at(1),proj2.at(0),proj2.at(1),proj3.at(0),proj3.at(1));
                }
                
                
            }
        }else if(triangle instanceof Line3D){ //triangle is a line
            if(triangle.p1.at(2) < this.lens && triangle.p2.at(2) < this.lens){
                var proj1 = this.projectPoint(triangle.p1.at(0),triangle.p1.at(1),triangle.p1.at(2));
                var proj2 = this.projectPoint(triangle.p2.at(0),triangle.p2.at(1),triangle.p2.at(2));
                g.color = triangle.material.getColor();
                g.drawLine(proj1.at(0),proj1.at(1),proj2.at(0),proj2.at(1));
            }
        }
        
    }
    g.draw();
    this.queue = [];
    this.lights = [];
};


Graphics3D.prototype.getMaterial = function(){
    return this.material;
};

Graphics3D.prototype.projectPoint = function(x_1,y_1,z_1){ //Takes a point in 3d space
    /*the t derived from the z component of the parametric line between the point to be projected and 
    the sensor assuming the line intersects the lens, 
    the lens is flat, 
    and the lens is parallel to the xy plane*/
    var t1 = (this.getLens()-this.sensor.at(2))/(this.sensor.at(2) - z_1); 
    var x1 = this.sensor.at(0)+this.sensor.at(0)*t1-t1*x_1; //x component of the parametric line between the point to be projected and the sensor
    var y1 = this.sensor.at(1)+this.sensor.at(1)*t1-t1*y_1; //y component of the parametric line between the point to be projected and the sensor
    
    return new Vector2D(x1-this.sensor.at(0),y1-this.sensor.at(1));
};

Graphics3D.prototype.inverseProjectPoint = function(x_1,y_1,z_1){ //with a given z (z_1) value and the already projected x (x_1) and y (y_1) on the 2d plane, this finds the original x and y that were projected from 3d space onto the plane 
    var t1 = this.getLens()/(this.sensor.at(2) - z_1);
    var x1 = x_1/t1;
    var y1 = y_1/t1;
    
    return [x1,y1];
};

Graphics3D.prototype.drawLine = function(x1,y1,z1,x2,y2,z2){
    var p1 = new Vector3D(x1,y1,z1);
    var p2 = new Vector3D(x2,y2,z2);

    var line = new Line3D(p1,p2,this.getMaterial());
    line.squareDistance = (line.mid.at(0) - this.sensor.at(0))*(line.mid.at(0) - this.sensor.at(0)) + (line.mid.at(1) - this.sensor.at(1))*(line.mid.at(1) - this.sensor.at(1)) + (line.mid.at(2) - this.sensor.at(2))*(line.mid.at(2) - this.sensor.at(2));
    this.pushToQueue(line);

};

Graphics3D.prototype.drawPrism = function(x,y,z,w,h,d){
    this.drawLine(x-(w/2),y-(h/2),z-(d/2),x+(w/2),y-(h/2),z-(d/2)); //Bottom back line
    this.drawLine(x-(w/2),y-(h/2),z+(d/2),x+(w/2),y-(h/2),z+(d/2)); //Bottom front line
    this.drawLine(x-(w/2),y-(h/2),z+(d/2),x-(w/2),y-(h/2),z-(d/2)); //Bottom left line
    this.drawLine(x+(w/2),y-(h/2),z+(d/2),x+(w/2),y-(h/2),z-(d/2)); //Bottom right line

    this.drawLine(x-(w/2),y+(h/2),z-(d/2),x+(w/2),y+(h/2),z-(d/2)); //Top back line
    this.drawLine(x-(w/2),y+(h/2),z+(d/2),x+(w/2),y+(h/2),z+(d/2)); //Top front line
    this.drawLine(x-(w/2),y+(h/2),z+(d/2),x-(w/2),y+(h/2),z-(d/2)); //Top left line
    this.drawLine(x+(w/2),y+(h/2),z+(d/2),x+(w/2),y+(h/2),z-(d/2)); //Top right line

    this.drawLine(x-(w/2),y-(h/2),z-(d/2),x-(w/2),y+(h/2),z-(d/2)); //Back left line
    this.drawLine(x-(w/2),y-(h/2),z+(d/2),x-(w/2),y+(h/2),z+(d/2)); //Front left line
    
    this.drawLine(x+(w/2),y-(h/2),z-(d/2),x+(w/2),y+(h/2),z-(d/2)); //Back right line
    this.drawLine(x+(w/2),y-(h/2),z+(d/2),x+(w/2),y+(h/2),z+(d/2)); //Front right line
    
};

Graphics3D.prototype.fillTriangle = function(x1,y1,z1, x2,y2,z2, x3,y3,z3, n1,n2,n3, flip){ //n1 n2 and n3 are normals of vertices as vectors 
    if(typeof this.getMaterial() === 'undefined') console.warn("Warning material undefined.");
    var triangle = new Triangle3D(new Vector3D(x1,y1,z1),new Vector3D(x2,y2,z2),new Vector3D(x3,y3,z3),this.getMaterial());

    if(n1 instanceof Vector3D){
        triangle.normal1 = n1;
    }
    if(n2 instanceof Vector3D){
        triangle.normal2 = n2;
    }
    if(n3 instanceof Vector3D){
        triangle.normal3 = n3;
    }

    triangle.squareDistance = (triangle.mid.at(0) - this.sensor.at(0))*(triangle.mid.at(0) - this.sensor.at(0)) + (triangle.mid.at(1) - this.sensor.at(1))*(triangle.mid.at(1) - this.sensor.at(1)) + (triangle.mid.at(2) - this.sensor.at(2))*(triangle.mid.at(2) - this.sensor.at(2));
    triangle.flip = flip;

    this.pushToQueue(triangle);
};

Graphics3D.prototype.fillPolygon = function(a){ 
        if(typeof this.getMaterial() === 'undefined') console.warn("Warning material undefined."); 
        if(a.length%3 !== 0) throw "Error: Incorrect argument length in fillPolygon. Length of argument must be divisible by 3.";
        if(a.length/3 <= 2) throw "Error: Polygons must have at least 3 vertices.";
        var i;
        var polygon = [];
        var midpoint = new Vector3D(0,0,0);
        var material = this.getMaterial();
        for(i = 0; i < a.length/3; i++){
            polygon[i] = new Vector3D(a[i*3],a[i*3 + 1],a[i*3 + 2]);
            midpoint = midpoint.add(polygon[i].multiply(3/a.length));
        }
 
        for(i = 0; i < polygon.length - 1; i++){
            this.pushToQueue(new Triangle3D(polygon[i],polygon[i+1],midpoint,material));
        }
        
        this.pushToQueue(new Triangle3D(polygon[polygon.length - 1], polygon[0],midpoint,material));
};

Graphics3D.prototype.drawGrid = function() {
  var i;
    var temp = this.getMaterial();
    this.setMaterial(new Material({"color": [128,128,128]}));
    for(i = 0; i <= 10; i++){
        this.drawLine(-300+i*60,0,300,-300+i*60,0,-300);
    }
    for(i = 0; i <= 10; i++){
        this.drawLine(-300,0,-300+i*60,300,0,-300+i*60);
    }
    
    this.setMaterial(temp);
};

Graphics3D.prototype.fillPrism = function(x,y,z,w,h,d,xr,yr,zr) { //center point x y and z - width height and depth - rotation about x, y and z axis with respect to center point
    if(typeof xr === 'undefined') { xr = 0; yr = 0; zr = 0; }
    else if(typeof yr === 'undefined') {yr = 0; zr = 0;}
    else if(typeof zr === 'undefined') {zr = 0;}
    var center = new Vector(x,y,z);
    var rotationX = new Matrix('rx',xr);
    var rotationY = new Matrix('ry',yr);
    
    var rotationZ = new Matrix('rz',zr);

    var top = [rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(w/2,h/2,-d/2)))).add(center),
               rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(-w/2,h/2,-d/2)))).add(center),
               rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(-w/2,h/2,d/2)))).add(center),
               rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(w/2,h/2,d/2)))).add(center)];

    var bottom = [rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(w/2,-h/2,-d/2)))).add(center),
                  rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(-w/2,-h/2,-d/2)))).add(center),
                  rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(-w/2,-h/2,d/2)))).add(center),
                  rotationZ.multiplyVector(rotationY.multiplyVector(rotationX.multiplyVector(new Vector(w/2,-h/2,d/2)))).add(center)];

    this.fillPolygon([top[0].at(0),top[0].at(1),top[0].at(2), //Top
                      top[1].at(0),top[1].at(1),top[1].at(2),
                      top[2].at(0),top[2].at(1),top[2].at(2),
                      top[3].at(0),top[3].at(1),top[3].at(2)]);

    this.fillPolygon([bottom[3].at(0),bottom[3].at(1),bottom[3].at(2), //Bottom
                      bottom[2].at(0),bottom[2].at(1),bottom[2].at(2),
                      bottom[1].at(0),bottom[1].at(1),bottom[1].at(2),
                      bottom[0].at(0),bottom[0].at(1),bottom[0].at(2)]);

    for(var i = 0; i < 4; i++){
        this.fillPolygon([bottom[i%4].at(0),bottom[i%4].at(1),bottom[i%4].at(2),
                          bottom[(i+1)%4].at(0),bottom[(i+1)%4].at(1),bottom[(i+1)%4].at(2),
                          top[(i+1)%4].at(0),top[(i+1)%4].at(1),top[(i+1)%4].at(2),
                          top[i%4].at(0),top[i%4].at(1),top[i%4].at(2)]);
    }
};

Graphics3D.prototype.fillEllipsoid = function(x,y,z,xRadius,yRadius,zRadius,xr,yr,zr,divisions) {
    var divisions = divisions/2; //if we want n divisions, divisions must equal n/2
    var stretchX  = xRadius/100;
    var stretchY  = yRadius/100;
    var stretchZ  = zRadius/100;
    var rx = new Matrix('rx',xr);
    var ry = new Matrix('ry',yr);
    var rz = new Matrix('rz',zr);
    
    for(var i = 0; i <= divisions; i++){
        // no stretch is a sphere with a radius of 100
        var z1 = (i)*100/divisions;
        var z2 = (i+1)*100/divisions;
        // x^2 + y^2 = 100 - z^2
        for(var j = 0; j <= 2*divisions; j++){
            var a = j*2*Math.PI/(2*divisions);
            var b = (j+1)*2*Math.PI/(2*divisions);
            var c = (j)*2*Math.PI/(2*divisions);
            var z1sqrt = Math.sqrt(100*100-z1*z1);
            var z2sqrt = Math.sqrt(100*100-z2*z2);
            var p1 = new Vector3D(stretchX*z1sqrt*Math.cos(a),   
                                 stretchY*z1sqrt*Math.sin(a),            
                                  stretchZ*z1);
            
            var p2 = new Vector3D(stretchX*z1sqrt*Math.cos(b),
                                  stretchY*z1sqrt*Math.sin(b),        
                                  stretchZ*z1);
            
            var p3 = new Vector3D(stretchX*z2sqrt*Math.cos(b),  
                                  stretchY*z2sqrt*Math.sin(b),    
                                  stretchZ*z2);

            var p4 = new Vector3D(stretchX*z2sqrt*Math.cos(c),  
                                  stretchY*z2sqrt*Math.sin(c),    
                                  stretchZ*z2);

            var p5 = new Vector3D(-stretchX*z1sqrt*Math.cos(a),  
                                  stretchY*z1sqrt*Math.sin(a),    
                                  -stretchZ*z1);
            
            var p6 = new Vector3D(-stretchX*z1sqrt*Math.cos(b), 
                                  stretchY*z1sqrt*Math.sin(b),    
                                  -stretchZ*z1);
            
            var p7 = new Vector3D(-stretchX*z2sqrt*Math.cos(b), 
                                  stretchY*z2sqrt*Math.sin(b),    
                                  -stretchZ*z2);

            var p8 = new Vector3D(-stretchX*z2sqrt*Math.cos(c), 
                                  stretchY*z2sqrt*Math.sin(c), 
                                  -stretchZ*z2);
            //***Rotation transforms***//

            var rp1 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p1)));
            var rp2 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p2)));
            var rp3 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p3)));
            var rp4 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p4)));

            var rp5 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p5)));
            var rp6 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p6)));
            var rp7 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p7)));
            var rp8 = rz.multiplyVector(ry.multiplyVector(rx.multiplyVector(p8)));

            this.fillPolygon([rp1.at(0) + x,rp1.at(1) + y,rp1.at(2) + z,
                              rp2.at(0) + x,rp2.at(1) + y,rp2.at(2) + z,
                              rp3.at(0) + x,rp3.at(1) + y,rp3.at(2) + z,
                              rp4.at(0) + x,rp4.at(1) + y,rp4.at(2) + z]);

            this.fillPolygon([rp5.at(0) + x,rp5.at(1) + y,rp5.at(2) + z,
                              rp6.at(0) + x,rp6.at(1) + y,rp6.at(2) + z,
                              rp7.at(0) + x,rp7.at(1) + y,rp7.at(2) + z,
                              rp8.at(0) + x,rp8.at(1) + y,rp8.at(2) + z]);
        }
    }

};

return Graphics3D;
});
3d Graphics Library
===================

A simple 3d graphics library for html5 canvas I'm making for the sake of learning. The library itself is not very practical for others to use, but I decided to make a bit of documentation so that I remember how to use everything and so that I remember what needs to be done.

~~Strikethrough~~ indicates a feature that is yet to be implemented or completed. 

To Run Examples
---------------

1. In terminal, cd to the directory where the folder was downloaded.
2. Type the following command into terminal:

    $ ./RUN
 
Images
------

*Rasterized Teapot using Graphics3D.js*

!["The image could not be displayed."](https://raw.github.com/Wikiemol/Graphics-API/master/images/teapot.gif "Rasterized Teapot")

*Raytraced spheres using RayTracer.js*

!["The image could not be displayed."](https://raw.github.com/Wikiemol/Graphics-API/master/images/raytracer.png "Raytraced Spheres")


Constructors
------------

1. **Graphics3D(context)** Handles rasterized 3d graphics
    - *Context*: canvas context that will be drawn to.
2. **Light(l)** When used with the new keyword it creates a new light. Takes object i.e. {"type": "point", "diffusion": 1, "specularity": 1}
    - *l["type"]*: Type of light. Can be "point" "directional" or ~~"spot"~~
    - *l["diffusion"]*: The diffusion component for the light, a value from 0 to 1
    - *l["specularity"]*: The specular component for the light, a value from 0 to 1
3. **Material(m)** When used with the new keyword it creates a new Material. Takes object i.e. {"color": "#808080", "diffusion:" 1, ... etc.}
    - *m["color"]*: color of material
    - *m["diffusion"]*: diffusion component of material, a value from 0 to 1
    - *m["specularity"]*: specular component of material, a value from 0 to 1
    - *m["shine"]*: shine component of material
4. **Graphics2D(context)** Handles 2d graphics
5. **RayTracer(context)** Handles RayTraced 3D graphics.

Methods 
-------

**• Graphics3D**

1. **addLight(l)** Adds a light to the scene.
2. **setMaterial(m)** Takes a Material (see above Constructors, 3) object only.
3. **getMaterial()**
4. **setCoordinates(t)** A value of true centers the origin and makes positive y values go towards the top of the canvas.
5. **getCoordinates()**
6. **setSensor(x,y,z)** Sets the position of the "light sensor" of the camera.
7. **getSensor()** Returns a vector as the position of the sensor.
8. **setFocalLength()** The distance of the camera lens from the light sensor.
9. **getFocalLength()** Returns the focal length.
10. ~~**rotateCamera(xr,yr,zr)** Rotates the camera.~~
    - ~~*xr* rotation about x axis~~
    - ~~*yr* rotation about y axis~~
    - ~~*zr* rotation about z axis~~
11. **getLens()** As of now the lens can only be a flat plane horizontal to the xy plane, returns z component of lens position.
12. **setConcavePolygons(t)** If set to true, concave polygons can be drawn in space.
13. **draw(t)** As of now, the painter's algorithm is being used. As a result, this method must be called before anything is actually drawn to the canvas.
    - *t["lights"]*: Boolean that turns lights on or off.
    - *t["ambience"]*: Boolean that turns ambient lighting on or off.
    - *t["ambienceOnly"]*: Boolean, setting to true will show only the ambient lighting.
14. **sortQueue()** Sorts the render queue of polygons from furthest away from the camera to closest to the camera.
15. **projectPoint(x,y,z)** Projects a point in 3d space onto the lens. Returns 2d vector with the x y value of the new point on the canvas. 
17. **drawLine(x1,y1,z1,x2,y2,z2)** Adds a line to the render queue.
    - *x1,y1,z1*: First point of the line
    - *x2,y2,z2*: Second point of the line
18. **drawPrism(x,y,z,w,h,d)** Adds the wireframe of a prism to the render queue.
    - *x,y,z*: The center point of the prism (not the corner)
    - *w*: width
    - *h*: height
    - *d*: depth
19. **fillTriangle(x1,y1,z1,x2,y2,z2,x3,y3,z3)** Adds a triangle to the render queue.
    - *x1,y1,z1* First vertex of the triangle
    - *x2,y2,z2* Second vertex of the triangle
    - *x3,y3,z3* Third vertex of the triangle
21. **drawGrid()** Adds a 600x600 grid centered at the origin and parallel to the xz plane to the render queue.

**• RayTracer**

1. **sphere(x, y, z, r, m)** Adds a sphere at point (x y z) with radius r and material m.
2. **plane(x, y, z, n, m)** Adds a plane passing through the point (x y z) with a normal vector n and material m.
3. **render()** Renders the scene.


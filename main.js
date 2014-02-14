require(["graphics3D", "light", "ply", "triangle3D", "vector3D", "material", "graphics2D", "RayTracer"], 
function(Graphics3D, Light, PLY, Triangle3D, Vector3D, Material, Graphics2D, RayTracer) {

    var canvas = null;
    var cxt = null;
    var g;
    
    var ply = new PLY("/ply/teapot.ply");
    ply.load(50);
    
    var ply2 = new PLY("/ply/cow.ply");
    ply2.load(30);
    
    var x = 0;
    var sx = 0;
    
    var t = 7 * Math.PI / 6;
    var light1 = new Light({"diffusion": 1, "specularity": 1, "type": "point"});
    var light2 = new Light({"diffusion": 100, "specularity": 0, "type": "point"});
    
    init();
    function init() {
        
        canvas = window.document.getElementById("can");
        cxt = canvas.getContext('2d');
        g = new Graphics3D(cxt);
        g.standard_coordinates = true;
        //setInterval(rasterizerDemo, 33);
        //rasterizerDemo();
        rayTracerDemo();
       //  animateRayTrace();        
    }
                
    var lastFrame = new Date;
    function rasterizerDemo() {
        cxt.clearRect(0, 0, 500, 500);
        cxt.fillStyle = "#000000";
        cxt.fillRect(0, 0, 500, 500);
        cxt.fillStyle = "#FFFFFF";
        var thisFrame = new Date;
        cxt.fillText("FPS: " + Math.round(1000 / (thisFrame - lastFrame)), 10, 20);
        lastFrame = thisFrame;
        g.setSensor(0, 100, 1300);
        g.setFocalLength(500);
        light1.position = new Vector3D(200 * Math.cos(10 * sx), 100, 400);
        g.addLight(light1, false);
        g.shading = 'gouraud';
        // g.drawGrid();
        g.setMaterial({"color": [255, 255, 1], "specularExponent": 3, "specularMultiplier": 2, "diffusion": 1});
        // sx = Math.PI/6 + 0.27;
         ply.addTo(g, sx, sx, sx, 0, 0, 0, false);

        //g.drawHemisphere(new Vector3D(0, 0, 0), 100, 10);
        g.draw({"lights": true, "ambience": false});

        x += 10;
        sx += 0.03;
    }
    
    function rayTracerDemo() {
        light1.position = new Vector3D(-100, 50, 300);
        light1.specularity = 1;
        light2.position = new Vector3D(200, 50, 0);
        var r = new RayTracer(cxt);
        r.ambience = 0.1;
        r.sensor = new Vector3D(0, 150, 1100);
        r.plane(0, -100, 0, new Vector3D(0, 1, 0), new Material({"color": [100, 100, 100], "reflectivity": 0.5}));
        r.plane(0, 0, -500, new Vector3D(0, 0, 1), new Material({"color": [255, 255, 255], "reflectivity": 0}));
        /*red*/r.sphere(0, -100, 0, 100, new Material({"color": [128, 1, 1], "shine": 100, "reflectivity": 0.5}));
        /*white*/r.sphere(200, 0, 100, 100, new Material({"color": [250, 250, 250], "shine": 100, "reflectivity": 0.5, "specularity": 0}));
        /*green*/r.sphere(-200, 0, -200, 100, new Material({"color": [0, 128, 0], "shine": 100, "reflectivity": 1}));
        r.lights.push(light1);
        r.backgroundColor = [20, 20, 20];   

        r.render();
        
    }

    function animateRayTrace() {
        light1.position = new Vector3D(-100, 50, 300);
        light1.specularity = 1;

        var r = new RayTracer(cxt);
        r.ambience = 0.1;
        r.sensor = new Vector3D(-1000, 150, 1100);

        r.plane(0, -100, 0, new Vector3D(0, 1, 0), new Material({"color": [100, 100, 100], "reflectivity": 0.5}));
        r.plane(0, 0, -500, new Vector3D(0, 0, 1), new Material({"color": [255, 255, 255], "reflectivity": 0}));
        /*red*/r.sphere(0, -100, 0, 100, new Material({"color": [128, 1, 1], "shine": 100, "reflectivity": 0.5}));
        /*white*/r.sphere(200, 0, 100, 100, new Material({"color": [250, 250, 250], "shine": 100, "reflectivity": 0.5, "specularity": 0}));
        /*green*/r.sphere(-200, 0, -200, 100, new Material({"color": [0, 128, 0], "shine": 100, "reflectivity": 1}));
        r.lights.push(light1);
        r.backgroundColor = [20, 20, 20];   
        r.animateCamera(r.sensor, r.sensor.add(new Vector3D(1400,0,0)), 10);
    }
});

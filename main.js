require(["graphics3D","light","ply","triangle3D","vector3D","material","graphics2D","RayTracer"], function(Graphics3D,Light,PLY,Triangle3D,Vector3D,Material,Graphics2D,RayTracer){
var canvas = null;
var cxt = null;
var g;
var ply = new PLY("teapot.ply");
ply.load(50);
var ply2 = new PLY("cow.ply");
ply2.load(30);
var x = 0;
var y = 0;
var x1 = 0;
var z = 0;
var sx = 0;
var sy = 0;
var sz = 0;
var p = -495;

var t = 7*Math.PI/6;
var light1 = new Light({"diffusion":1,"specularity":1,"type": "point"});
var light2 = new Light({"diffusion":100,"specularity":0,"type":"point"});
// window.addEventListener('load', onLoad);
init();
function init(){
	// window.removeEventListener('load', onLoad);
	canvas = window.document.getElementById("can");
	cxt = canvas.getContext('2d');
	g = new Graphics3D(cxt);
	g.setCoordinates(true);
	
	// var g = new Graphics2D(cxt);
	// g.setColor("red");
	// g.setCoordinates(true);
	/*var cx = 0;
	var cy = 0;
	for (var t= 0; t < 2*Math.PI; t += 0.1) {
 					g.drawLine(cx, cy, cx + Math.cos(t)*50, cy + Math.sin(t)*50);
	}*/
		
	// g.fillTriangle(-100,-100,0,100,100,0);
					
					
	
	// setInterval(draw,33);
	// draw();
	// setInterval(draw2,33)
	// draw2();
	// setInterval(draw3,33);
	// draw3();
	// setInterval(draw4,33);
	// setInterval(rayTracer,33);
	rayTracer();
	// draw4();
}
function draw(){
	cxt.clearRect(0,0,500,500);
	cxt.fillStyle = "#000000"
	cxt.fillRect(0,0,500,500);
	light1.setPosition(1000*Math.cos(t/2),0,300);
	light1.setGelBySaturation({"r":0.7,"g":0.3});
	light2.setPosition(0,200,300);
	
	g.addLight(light1,true);
	g.addLight(light2);
	g.setSensor(0,200 + sy,1100);
	g.setFocalLength(500);
	
	g.setMaterial({"color": "#8080FF", "shine": 0}); //Blue middle
	g.fillPrism(0,0,0,300,100,100,t,0,t);
	g.setMaterial({"color": "#80FF80"}); //Green left
	g.fillPrism(-300,0,0,100,100,100,t,t,0);
	g.setMaterial({"color": "#FF8080"}); //Red Right
	g.fillPrism(300,0,0,100,100,100,0,t,t);
	g.draw({"lights":true, "ambience": false});
	t += 0.03;
	// sy-=5;
	
}
			
function draw2(){
	cxt.clearRect(0,0,500,500);
	cxt.fillStyle = "#000000"
	cxt.fillRect(0,0,500,500);
	cxt.fillStyle = "#FFFFFF"
	var thisFrame = new Date;
	cxt.fillText("FPS: " + Math.round(1000/(thisFrame - lastFrame)),10,20);
	lastFrame = thisFrame;
	g.setSensor(0,200 + sy,1100);
	g.setFocalLength(500);
	light1.setPosition(100,100,400);
	
	// g.drawGrid();
	g.addLight(light1,true);
	g.setMaterial({"color": [255,128,128], "specularExponent": 6, "specularMultiplier": 2});
	g.fillEllipsoid(0,0,0,100,100,50,sx,0,sx,8);
	g.draw({"lights":true,"ambience":false});
	sx+=0.03 
}
var lastFrame = new Date;
function draw3(){
	cxt.clearRect(0,0,500,500);
	cxt.fillStyle = "#000000"
	cxt.fillRect(0,0,500,500);
	cxt.fillStyle = "#FFFFFF"
	var thisFrame = new Date;
	cxt.fillText("FPS: " + Math.round(1000/(thisFrame - lastFrame)),10,20);
	lastFrame = thisFrame;
	g.setSensor(0,100,1300);
	g.setFocalLength(500);
	light1.setPosition(200*Math.cos(10*sx),100,400);
	g.addLight(light1,false);
	g.shading = 'gouraud';
	// g.drawGrid();
	g.setMaterial({"color": [255,255,1], "specularExponent": 3, "specularMultiplier": 2, "diffusion": 1})
	// sx = Math.PI/6 + 0.27;
	ply.addTo(g,sx,sx,sx,0,0,0,false);
	g.setMaterial({"color": [245,245,245], "specularExponent": 10, "specularMultiplier": 2, "diffusion": 1})
	// ply2.addTo(g,-sx,sx,sx,-200,0,0,false);
	g.draw({"lights":true,"ambience":false});
	x += 10;
	sx += 0.03;
}

function draw4(){
	cxt.clearRect(0,0,500,500);
	var g = new Graphics2D(cxt);
	g.setCoordinates(true);
	g.setColor([255,0,0]);
	// g.interpolateTriangle(-200 + sx,0, 100,0, 0,100, 0,0,255, 255,0,0, 0,255,0)
	// g.interpolateTriangle(10*Math.cos(sx/10),0, 0,100*Math.sin(sx/10), 100*Math.sin(sx/10),0, 0,0,255, 255,0,0, 0,255,0)
	// g.fillTriangle(-200 + sx,0, 100,0, 0,100);
	g.draw();
	sx++;
}

function rayTracer(){
	cxt.fillRect(0,0,canvas.width,canvas.height)
	light1.setPosition(-200,50,300);
	light1.specularity = 1
	light2.setPosition(200,50,0)
	var r = new RayTracer(cxt);
	r.ambience = 0.1;
	r.sensor = new Vector3D(0,0,1100);
	r.plane(0,-100,0,new Vector3D(0,1,0),new Material({"color": [128,128,128]}));
	r.sphere(0,0,0,100,new Material({"color": [128,1,1],"shine":10, "diffusion": 1}));
	r.sphere(200,0,-200,100,new Material({"color": [1,128,1],"shine":10,"diffusion": 1}))
	r.sphere(-200,0,-200,100,new Material({"color": [1,1,128],"shine":10,"diffusion": 1}))				
	r.lights.push(light1);
	// r.lights.push(light2);
	r.trace();
	x += 10
}

});
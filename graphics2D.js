define(["Vector2D"], function(Vector2D) {
    function Graphics2D(context, c) {
        this.cxt = context;
        
        //current color
        this.color = [0, 0, 0];

        //if set to true, origin will be at the center of the canvas.
        this.standard_coordinates = false; 

        //width and height of the canvas
        this.WIDTH  = context.canvas.width; 
        this.HEIGHT = context.canvas.height;

        //holds the image data from draw pixel
        this.imageData = context.getImageData(0, 0, this.WIDTH, this.HEIGHT); 
        this.cdata     = this.imageData.data;
        
        //if c is undefined this.color is automatically set to black above
        //otherwise it is set to the value of c
        if (typeof c !== "undefined") {
            this.color = [c[0], c[1], c[2]];
        }
    
    }

    //draws a pixel to the screen at x1 y1 
    Graphics2D.prototype.drawPixel = function(x1, y1, color) {
        var x;
        var y;

        //if standard coordinates is true, 
        //  adjust x and y so that the origin is at the
        //  center of the screen
        //otherwise
        //  keep x and y the way they were passed in

        if (this.standard_coordinates) {
            x = x1 + this.WIDTH / 2;
            y = -y1 + this.HEIGHT / 2;
        } else {
            x = x1;
            y = y1;
        }
        
        //if the pixel is within the boundaries of the canvas
        //  add it to the imagedata array this.cdata
        if (x < this.WIDTH && x >= 0 && y < this.HEIGHT && y >= 0) {
            var point = (x + y * this.WIDTH) * 4;
    
            this.cdata[point + 0] = color[0]; //r
            this.cdata[point + 1] = color[1]; //g
            this.cdata[point + 2] = color[2]; //b
            this.cdata[point + 3] = 255; //a
        }
    };

    //draws the image data to the canvas
    Graphics2D.prototype.draw = function() {
        this.cxt.putImageData(this.imageData, 0, 0);
    };
    
    Graphics2D.prototype.drawLine = function(x_1, y_1, x_2, y_2) {

        //counter used in for loops
        var i;

        //point 1 of the line
        var x1 = x_1;
        var y1 = y_1;

        //point 2 of the line
        var x2 = x_2;
        var y2 = y_2;

        //if point1 is closer to the right than point2
        //  switch point1 and point2
        if (x1 > x2) {
            x1 = x_2;
            y1 = y_2;
            x2 = x_1;
            y2 = y_1;
        }

        //change in x and y
        //used to calculate slope
        var dx = x2 - x1;
        var dy = y2 - y1;
        
        //if the two points are the same
        //  the line is actually a point, 
        //  we are done
        if (dx === 0 && dy === 0) {
            this.drawPixel(x1, y1, this.color);
            return;
        }
        
        //if the change in y is greater than the change in x
        //  draw line using dx/dy as slope
        //otherwise 
        //  draw line using dy/dx as slope
        var slope;
        if (Math.abs(dy) > Math.abs(dx)) {
            slope = Math.round(dx / dy);
            var sign = 1;
    
            if (slope < 0) {
                sign = -1;
            }
    
            for (i = 0;i < Math.abs(dy); i++) {
                this.drawPixel(x1 + sign * i * slope, y1 + i * sign, this.color);
            }
    
        } else { 
    
            slope = dy / dx;
    
            for (i = 0; i < Math.abs(dx); i++) {
    
                this.drawPixel(x1 + i, y1 + i * slope, this.color);
    
            }
    
        }
    };
    //fills a triangle with points <x1,y1><x2,y2><x3,y3> and a color of color
    Graphics2D.prototype.fillTriangle = function(x_1, y_1, x_2, y_2, x_3, y_3, color) {
        var x1 = Math.round(x_1);
        var y1 = Math.round(y_1);
        var x2 = Math.round(x_2);
        var y2 = Math.round(y_2);
        var x3 = Math.round(x_3);
        var y3 = Math.round(y_3);
        
        //finds the bounds of the triangle
        var minX = Math.min(Math.min(x1, x2), x3);
        var minY = Math.min(Math.min(y1, y2), y3);
        var maxX = Math.max(Math.max(x1, x2), x3);
        var maxY = Math.max(Math.max(y1, y2), y3);
        
        //the area of the triangle and 
        var area = getArea(x1, y1, x2, y2, x3, y3);

        //the width and height of the bounding box around the triangle
        var width = Math.abs(maxX - minX);
        var height = Math.abs(maxY - minY);

        //goes through each pixel within the bounding box and determines
        //wether the sum of the area of the current pixel and the three points of
        //the triangle is equal to the area of the triangle.
        //if it is
        //  draw the pixel 
        for (var i = 0; i < width; i++) {
            
            for (var j = 0; j < height; j++) {
                
                if (area === getArea(minX + i, minY + j, x1, y1, x2, y2) + getArea(minX + i, minY + j, x2, y2, x3, y3) + getArea(minX + i, minY + j, x3, y3, x1, y1)) {
                        this.drawPixel(minX + i, minY + j, color);
                }
            }
        }
        
        //a function for finding the area of the triangle
        function getArea(x_1, y_1, x_2, y_2, x_3, y_3) {  
            return Math.abs((x_1 * (y_2 - y_3) + x_2 * (y_3 - y_1) + x_3 * (y_1 - y_2)) / 2);
        }
    };
    
    //fills a triangle with an interpolated color gradient
    //x1,y1 x2,y2 x3,y3 are the three points of the triangle
    //
    //rgb1 rgb2 rgb3 are the colors at the respective points 
    //of the triangle
    Graphics2D.prototype.interpolateTriangle = function(x_1, y_1, x_2, y_2, x_3, y_3, r1, g1, b1, r2, g2, b2, r3, g3, b3) {
        
        //This function treats each color component (r g and b respectively) 
        //as a third dimension. Thus we can find three
        //equations of planes (one for r one for g and one for b) 
        //where the color component is the "z" axis. The color at each pixel 
        //is calculated by figuring out what the
        //"z" component would be at the point and and treating that as the color.

        //Holds the value of the current color so that
        //the user's color can be returned to normal once 
        //the function is finished.
        var tempColor = this.color;
    
        var x1 = x_1;
        var y1 = y_1;
        
        var x2 = x_2;
        var y2 = y_2;
    
        var x3 = x_3;
        var y3 = y_3;
    
        //if the triangle is a line we don't need to do anything
        if (x1 == x2 && y1 == y2 || x1 == x3 && y1 == y3 || x2 == x3 && y2 == y3) { 
            this.fillTriangle(x1, y1, x2, y2, x3, y3, [r1, g1, b1]);
            return;
        }
        
        //These values will be used a lot in normals so we define them here.
        var y12 = y1 - y2;
        var x12 = x1 - x2;
        var y32 = y3 - y2;
        var x32 = x3 - x2;
    
        /*****variables for triangle check****/
        var aboveX = (x1 + x2 + x3) / 3;
        var aboveY = (y1 + y2 + y3) / 3;
        
        //assuming z of the point above the plane is 1 and z of the plane is 0
        
        //normals for checking if pixel is in triangle. 
        //Allows us to check if the pixel would be under the plane or over the plane.
        var normal1 = [y12,
                     -x12,
                     x12 * (aboveY - y2) - y12 * (aboveX - x2)]; //p1, p2, above
        var normal2 = [y32,
                       -x32,
                       x32 * (aboveY - y2) - y32 * (aboveX - x2)]; //p2, p3, above
        var normal3 = [(y3 - y1),
                       -(x3 - x1),
                       (x3 - x1) * (aboveY - y1) - (y3 - y1) * (aboveX - x1)]; //p3, p1, above
    
        //avoiding divide by 0 errors
        if (normal1[2] === 0 || normal2[2] === 0 || normal3[2] === 0) { 
            this.fillTriangle(x1, y1, x2, y2, x3, y3, [r1, g1, b1]);
            return;
        }
    
        var A1 = -normal1[0] / normal1[2];
        var B1 = -normal1[1] / normal1[2];
    
        var A2 = -normal2[0] / normal2[2];
        var B2 = -normal2[1] / normal2[2];
    
        var A3 = -normal3[0] / normal3[2];
        var B3 = -normal3[1] / normal3[2];
        /*------end variables for triangle check---------*/

        var rnormal = [y12 * (r3 - r2) - (r1 - r2) * y32,
                     (r1 - r2) * x32 - x12 * (r3 - r2),
                     x12 * y32 - y12 * x32];
    
        var gnormal = [y12 * (g3 - g2) - (g1 - g2) * y32,
                    (g1 - g2) * x32 - x12 * (g3 - g2),
                    x12 * y32 - y12 * x32];
    
        var bnormal = [y12 * (b3 - b2) - (b1 - b2) * y32,
                    (b1 - b2) * x32 - x12 * (b3 - b2),
                    x12 * y32 - y12 * x32];

        //avoids more divide by 0 errors
        if (rnormal[2] === 0 || gnormal[2] === 0 || bnormal[2] === 0) { 
            this.fillTriangle(x1, y1, x2, y2, x3, y3, [r1, g1, b1]);
            return;
        }
        //Coefficients of the plan equations for each color respectively
        //i.e. A*x + B*y + C = 0;
        var Ar = -rnormal[0] / rnormal[2];
        var Br = -rnormal[1] / rnormal[2];
        var Cr = -Ar * x1 - Br * y1 + r1;
    
        var Ag = -gnormal[0] / gnormal[2];
        var Bg = -gnormal[1] / gnormal[2];
        var Cg = -Ag * x1 - Bg * y1 + g1;
        
        var Ab = -bnormal[0] / bnormal[2];
        var Bb = -bnormal[1] / bnormal[2];
        var Cb = -Ab * x1 - Bb * y1 + b1;
        
        //Bounds of triangle
        var minX = Math.floor(Math.min(Math.min(x1, x2), x3));
        var minY = Math.floor(Math.min(Math.min(y1, y2), y3));
        var maxX = Math.ceil(Math.max(Math.max(x1, x2), x3));
        var maxY = Math.ceil(Math.max(Math.max(y1, y2), y3));
        
        //width and height of bounding box of triangle
        var width = Math.abs(maxX - minX);
        var height = Math.abs(maxY - minY);
        
        for (var i = 0; i < height; i++) {
            var y = minY + i;
            var outr = Br * y + Cr;
            var outg = Bg * y + Cg;
            var outb = Bb * y + Cb;
            var yy1 = (y - y1) * B1;
            var yy2 = (y - y2) * B2;
            var yy3 = (y - y3) * B3;
    
            for (var j = 0; j < width; j++) {
                var x = minX + j;
                var isInTriangle = true;
                
                //if the point is outside of the triangle
                //  the point is not in the triangle
                if ((x - x1) * A1 + yy1 < 0 || A2 * (x - x2) + yy2 < 0 || A3 * ( x - x3) + yy3 < 0) {
                    isInTriangle = false;
                }
                
                //if the point is in the triangle
                //  draw the pixel
                if (isInTriangle) {
                        var color = [Ar * x + outr, Ag * x + outg, Ab * x + outb];
                        this.drawPixel(x, y, color);
                }
            }
        }
        //set color back to what it was originally
        this.color = tempColor; 
    };

    return Graphics2D;
});

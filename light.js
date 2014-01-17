define(["vector3D", "vector2D"], function(Vector3D, Vector2D) {

    //type, diffusion, specularity, pass an object with these parameters 
    //i.e. {"type": "point", "diffusion": 1, "specularity": 1}
    function Light(l) { 
            this.diffusion   = 1;
            this.specularity = 1;

            //Can be "point", or "directional"
            this.type = "point"; 

            //if type is "directional", this will determine the direction.
            this.direction = new Vector3D(-10, -10, 0);

            //if type is "point", this will determine the position
            this.position = new Vector3D();

            //This is a multiplier to determine how far the light goes
            this.reach = 1;

            //The color of the light
            this.color = {"r": 255, "g": 255, "b": 255};

            //How far away the light is if it is directional
            this.directionalDistance = 400;

            //defining variables that are common among all types
            if (typeof l !== 'undefined') {
                   
                if (typeof l.diffusion !== 'undefined') {
                    this.diffusion = l.diffusion;
                }
    
                if (typeof l.specularity !== 'undefined') {
                    this.specularity = l.specularity;
                }
    
                if (typeof l.type !== 'undefined') {
                    this.type = l.type;
                }
    
            }
            
    }
    
    Light.prototype.setColor = function(r,g,b) {
        this.color.r = r;
        this.color.g = g;
        this.color.b = b;

    };

    //R G and B values are given as the saturation of the given component, represented
    //by percentages of the total color. 
    //R + G + B = 1 is a statement that must always be true. Will fill in empty values.
    //Pass in an object with r b and g i.e. {"r": 0.5, "g": 0.25, "b": 0.25}

    //This is useful because the color of light is perceived based on the ratio between the colors
    //since we want the intensity of the light to be based on the specular and diffuse variables as 
    //opposed to the color of the light. 
    //Thus, if the color of the light is 255,255,255 then this will be perceived as the same as
    //128,128,128. So it becomes easier to talk about color in terms of ratio between the colors.

    Light.prototype.setColorByRatio = function(c) { 
        //The percentage of each color component of the total color
        var redPerc   = c.r;
        var greenPerc = c.g;
        var bluePerc  = c.b;

        //Fills in the empty color components not provided by the user
        //so that redperc + greenperc + blueperc = 1.
        //Will distribute the remaining space to the undefined components
        //evenly. 

        //For example, if r is defined as 0.5 and g and b are undefined, 
        //  then g and b will automatically be defined as 0.25 
        if (typeof redPerc === 'undefined') {
            if (typeof greenPerc === 'undefined') {
                redPerc   = (1 - bluePerc) / 2;
                greenPerc = (1 - bluePerc) / 2; 
            } else if (typeof bluePerc === 'undefined') {
                redPerc  = (1 - greenPerc) / 2;
                bluePerc = (1 - greenPerc) / 2;
            } else {
                redPerc = 1 - (greenPerc + bluePerc);
            }
        } else if (typeof greenPerc === 'undefined') {
            if (typeof bluePerc === 'undefined') {
                greenPerc = (1 - redPerc) / 2;
                bluePerc  = (1 - redPerc) / 2;
            } else {
                greenPerc = 1 - (redPerc + bluePerc);
            }
        } else if (typeof bluePerc === 'undefined') {
            bluePerc = 1 - (redPerc + greenPerc);
        }

        if (greenPerc < 0) {
            greenPerc = 0;
        }
        if (redPerc < 0) {
            redPerc = 0;
        }
        if (bluePerc < 0) {
            bluePerc = 0;
        }

        //If the user has entered values that don't add up to one
        //  throw an error
        if (redPerc + bluePerc + greenPerc != 1) { 
            throw "Error: R + G + B must be equal to 1";
        }

        var maxPercent = Math.max(Math.max(redPerc, greenPerc), bluePerc);
        var red;
        var green;
        var blue;

        //Uses 255 as the highest ratio to get the full range of colors.
        //Sets the colors to the right ratio. 
        if (redPerc == maxPercent) {
            red = 255;
            green = 255 * greenPerc / redPerc;
            blue = 255 * bluePerc / redPerc;
        } else if (greenPerc == maxPercent) {
            green = 255;
            red = 255 * redPerc / greenPerc;
            blue = 255 * bluePerc / greenPerc;
        } else if (bluePerc == maxPercent) {
            blue = 255;
            red = 255 * redPerc / bluePerc;
            green = 255 * greenPerc / bluePerc;
        }
        
        this.color = {"r": red, "g": green, "b": blue};
    };

    //Returns vector with the diffusion intensity .at(0) and the specular intensity .at(1)
    //based on the position in the scene.
    Light.prototype.intensityAt = function(x, y, z) { 
        var diffusion;
        var specularity;

        switch (this.type) {

            case "point":

                var distance = this.distanceSquared(x, y, z);
                diffusion = this.reach * 100000 * this.diffusion / distance;
                specularity = 100000 * this.specularity / distance;
                break;

            case "directional":

                diffusion = this.getDiffusion();
                specularity = this.getSpecularity();
                break;

        }

        return new Vector2D(diffusion, specularity);
    };

    //Returns unit vector in direction that the light is shining.
    Light.prototype.directionAt = function(x, y, z) { 
        var point = new Vector3D(x, y, z);
        var direction;

        switch (this.type) {

            case "point":

                direction = point.subtract(this.position).unit();
                break;

            case "directional":

                direction = this.direction.unit();
                break;

        }

        return direction;
    };

    //Returns directional unit vector multiplied by the specular component
    Light.prototype.specularIntensityVector = function(x, y, z) { 
        return this.directionAt(x, y, z).multiply(this.intensityAt(x, y, z).at(1));
    };

    //Returns directional unit vector multiplied by the diffusion component
    Light.prototype.diffusionIntensityVector = function(x, y, z) { 
        return this.directionAt(x, y, z).multiply(this.intensityAt(x, y, z).at(0));
    
    };
    
    //Distance between point passed as argument and the light
    Light.prototype.distance = function(x, y, z) {
        var point = new Vector3D(x, y, z);
        var distance;
        if (this.type == 'point') {
            distance = this.position.subtract(point).magnitude();
        } else if (this.type == 'directional') {
            distance = this.directionalDistance;
        }
        return distance;
    
    };
    
    //Distance squared between point passed as argument and the light
    Light.prototype.distanceSquared = function(x, y, z) {
        var distance; //squared
        if (this.type == 'point') {
            distance = (x - this.position.at(0)) * (x - this.position.at(0)) + (y - this.position.at(1)) * (y - this.position.at(1)) + (z - this.position.at(2)) * (z - this.position.at(2));
        } else if (this.type == 'directional') {
            distance = this.directionalDistance * this.directionalDistance;
        }
        return distance;
    };
    return Light;
});

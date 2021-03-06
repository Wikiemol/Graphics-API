define(function(){
    //color - RGB array [r, g, b], specularity 0 - 1, specularMultiplier 0 - 15, specularExponent 0 - infinity, diffusion 0 - 1, ambience 0 - 1, shine unsigned int, reflectivity 
    //set by passing in an object eg. {"color":"#808080", "diffusion":0.5 ... etc.}
    function Material(m) { 
        this.color              = [128, 128, 128];
        this.specularity        = 1;
        this.diffusion          = 1;
        this.ambience           = 1;
        this.shine              = 100;
        this.specularMultiplier = 5;
        this.specularExponent   = 3;
        this.reflectivity       = 0;
        
        if (typeof m !== 'undefined'){
            
            if (typeof m.color !== 'undefined'){
                this.color = m.color;
            }
            if (typeof m.specularity !== 'undefined'){
                this.specularity = m.specularity;
            }
    
            if (typeof m.diffusion !== 'undefined'){
                this.diffusion = m.diffusion;
            }
    
            if (typeof m.ambience !== 'undefined'){
                this.ambience = m.ambience;
            }
    
            if (typeof m.shine !== 'undefined'){
                this.shine = m.shine;
            }
    
            if (typeof m.specularMultiplier !== 'undefined'){
                this.specularMultiplier = m.specularMultiplier;
            }
    
            if (typeof m.specularExponent !== 'undefined'){
                this.specularExponent = m.specularExponent;
            }
            
            if (typeof m.reflectivity !== "undefined"){
              
              this.reflectivity = m.reflectivity;
            }
        }
    
      
    }
    return Material;
});

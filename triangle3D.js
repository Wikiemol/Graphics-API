define(["vector3D", "material"], function(Vector3D, Material){
    function Triangle3D(p1, p2, p3, m){ //position vectors as first three parameters and material
        if (typeof p1 === "undefined") {
                throw "Triangle3D: Undefined Vertex";
        }

        if (typeof p2 === "undefined") {
                throw "Triangle3D: Undefined Vertex";
        }

        if (typeof p3 === "undefined") {
                throw "Triangle3D: Undefined Vertex";
        }

        this.p1       = p1;
        this.p2       = p2;
        this.p3       = p3;
        this.material = m;
        this.norm     = this.normal();
        this.normal1  = this.normal(); //normal for vertex 1
        this.normal2  = this.normal(); //normal for vertex 2
        this.normal3  = this.normal(); //normal for vertex 3
        this.flip     = false;
        this.mid      = this.p1.add(this.p2).add(this.p3).multiply(1 / 3);
        this.squareDistance;
    }
    
    Triangle3D.prototype.midPoint = function() {
        var midPoint = this.p1.add(this.p2).add(this.p3).multiply(1 / 3);
        return midPoint;
    };
    
    Triangle3D.prototype.normal = function(){
        var v1 = this.p1.subtract(this.p2);
        var v2 = this.p3.subtract(this.p2);
        if (this.flip){
            return v1.cross(v2).multiply(-1);
        } else {
            return v1.cross(v2);
        }
        
    };
    
    Triangle3D.prototype.getMaterial = function() {
        return this.material;
    };

    //takes a function as an argument
    //transforms all the points on the triangle by the function (which should take a
    //vector3D object as its argument
    Triangle3D.prototype.transform = function(transformation) {

        this.p1 = transformation(this.p1);
        this.p2 = transformation(this.p2);
        this.p3 = transformation(this.p3);
        
        this.norm = transformation(this.norm);
        this.normal1 = transformation(this.normal1);
        this.normal2 = transformation(this.normal2);
        this.normal3 = transformation(this.normal3);
        this.mid = transformation(this.mid);
    };
    
    return Triangle3D;

});

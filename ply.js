define(["graphics3D", "triangle3D", "line3D", "vector3D", "matrix3D"], function(Graphics3D, Triangle3D, Line3D, Vector3D, Matrix3D) {

    //s is a string that is a path to a file in the current directory.
    //Must be running from a server to use.
    function PLY(s) {
        this.file = s;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", s, false);
        xmlhttp.send(null);
    
        this.ply = xmlhttp.responseText;

        //an array of triangle3D.js objects
        this.faces = []; 

        //an object that will assign a normal to a vertex
        this.normals = {}; 
    }
    //reads and adds to graphics object (g)
    PLY.prototype.load = function(s, flip) { 
        var scale = s;
        var l = this.ply.length;
        //what should be considered a new line character
        var LF = "\n"; 
        if (typeof flip === 'undefined') { 
            flip = 1;
        }
        //stores each line as string
        var lineArray = []; 

        //temp for store each line as string
        var s = '';

        //line pointer 
        var line             = 0; 
        var numberOfVertices = 0;
        var numberOfFaces    = 0;

        //the array that will hold all of the vertices
        var vertices = []; 

        //holds each word that is on the line
        var wordArray = []; 

        //word pointer, relative to line
        var word = 0; 

        //the current element, used for determing what the property keyword will do.
        var element = ""; 

        // holds format, not taking into account versions
        var format = "ascii"; 

        //the line that ends the header
        var endHeader = 0; 

        //the index of the letter that ends the header
        var endHeaderb = 0;
        var vertexFaces = {};

        /**store each line of header as string**/

        for (var i = 0; i < l; i++) {
            s += this.ply.charAt(i);
            if (this.ply.charAt(i) == "\n") {
                lineArray[line] = s;
                //if we have reached the end of the header
                //  end loop
                if (s.substr(0, 10) == "end_header") {
                    break;
                }
                s = ''; //Resets line string
                line++; //increment line;
            }
            endHeaderb = i;
        }
        endHeader = line;
    
        var lineArrayLength = lineArray.length;

        //Check header to see if carriage returns should be used with new line
        for (var i = 0; i < lineArrayLength; i++) { 
            if (lineArray[i].substr(0, 10) == "end_header") {
                break;
            }
            if (this.ply.charAt(i) == '\r') {
                LF = "\r\n";
                break;
            }
        }
    
        /****************************DEFINING WORDS***********************************/
        var keywords = {"comment": (function() {word = wordArray.length;}), /*skips comment by putting word pointer at the end of the line*/
                        "element": (function() {elements[wordArray[1]](); word = wordArray.length;}), 
                        "property": (function() {word = wordArray.length;}), /*will skip properties for now, assuming faces are regular lists and that there are no color properties*/
                        "format": (function() {format = wordArray[1]; word = wordArray.length;}),  
                        "ply": (function() {word = wordArray.length;})};  /*skips ply, we handle it seperately*/
    
        var elements = {"vertex": (function() {numberOfVertices = parseInt(wordArray[2]); element = "vertex";}), //assuming float
                        "face":  (function() {numberOfFaces = parseInt(wordArray[2]); element = "face";})};
    
        /***************************************************************/
    
        
        /**check if file begins with "ply"**/
        if (lineArray[0] != "ply" + LF) {
            console.warn("Warning: " + this.file + " may be corrupted or may not be a ply file.");
        }
    
        /****READ HEADER*****/
        for (line = 0; lineArray[line] != "end_header" + LF; line++) {
    
            /********BEGIN READING LINE*********/
            fillWordArray();
            for (word = 0; word < wordArray.length; word++) {
                if (keywords[wordArray[word]]) {
                    keywords[wordArray[word]]();
                } else {
                    console.warn("Unrecognized keyword '" + wordArray[word] + "' in " + this.file + ".   Line: " + (line + 1));
                    break;
                }
            }
            wordArray = [];
            word = 0;
            /*------END READ LINE-------*/
    
        }
        /*----END READ HEADER-----*/
    
        line++;
        /******READ BODY******/
        switch (format) {
    
            case "ascii":
                /**load the rest of the document into linearray***/
                line = 0;
                for (var i = 0; i < l; i++) {
                    s += this.ply.charAt(i);
                    if (this.ply.charAt(i) == "\n") {
                        lineArray[line] = s;
                        s = ''; //Resets line string
                        line++; //increment line;
                    }
                }
                /*---------------------------------------------*/
                line = endHeader + 1;
                /********READ VERTICES********/
                var verticesEnd = numberOfVertices + line;
                while (line < verticesEnd) {
                    fillWordArray();
                    vertices.push(new Vector3D(parseFloat(wordArray[0]), parseFloat(wordArray[1]), parseFloat(wordArray[2])));
                    wordArray = [];
                    word = 0;
                    line++;
                }
                /*------END READ VERTICES----------*/
    
                /********ADD FACES TO FACE ARRAY*******/
                var facesEnd = numberOfFaces + line;
            
                while (line < facesEnd) {
                    fillWordArray();
                    if (wordArray[0] == 3) {
                        var index1 = parseInt(wordArray[1]); //index of vertex1 in vertices array
                        var index2 = parseInt(wordArray[2]); //...............2..................
                        var index3 = parseInt(wordArray[3]); //...............3..................
                        
                        var v1 = vertices[index1].multiply(scale);
                        var v2 = vertices[index2].multiply(scale);
                        var v3 = vertices[index3].multiply(scale);
    
                        var triangle = new Triangle3D(v1, v2, v3);

                        var v1string = v1.at(0) + ", " + v1.at(1) + ", " + v1.at(2);
                        var v2string = v2.at(0) + ", " + v2.at(1) + ", " + v2.at(2);
                        var v3string = v3.at(0) + ", " + v3.at(1) + ", " + v3.at(2);
    
                        if (vertexFaces[v1string]) {
                            vertexFaces[v1string].push(triangle);
                        } else {
                            vertexFaces[v1string] = [triangle];
                        }
    
                        if (vertexFaces[v2string]) {
                            vertexFaces[v2string].push(triangle);
                        } else {
                            vertexFaces[v2string] = [triangle];
                        }
    
                        if (vertexFaces[v3string]) {
                            vertexFaces[v3string].push(triangle);
                        } else {
                            vertexFaces[v3string] = [triangle];
                        }
    
                        this.faces.push(triangle);
                    }
                    
                    wordArray = [];
                    word = 0;
                    line++;
                }
                /*---------------END ADD FACES----------------*/
    
                /********FIND NORMALS************/
                for (var i = 0; i < vertices.length; i++) {
                    var vertex = vertices[i].multiply(scale);
                    var vertexNormal = new Vector3D(0, 0, 0);
                    
                    var facesArray = vertexFaces[vertex.at(0) + ", " + vertex.at(1) + ", " + vertex.at(2)];
                    
                    for (var j = 0; j < facesArray.length; j++) {
                        vertexNormal = vertexNormal.add(facesArray[0].normal().unit());
                    }
    
                    vertexNormal = vertexNormal.multiply(1 / facesArray.length);
    
                    this.normals[vertex.at(0) + ", " + vertex.at(1) + ", " + vertex.at(2)] = vertexNormal.multiply(flip);
                }
    
                break;
    
            case "binary_big_endian":
                console.log("binary_big_endian");
                break;
    
            case "binary_little_endian":
    
                break;
        }

        //fills word array with words from the current line
        function fillWordArray() { 
            var lineLength = lineArray[line].length;
            for (var letter = 0; letter < lineLength; letter++) {
                var thisLetter = lineArray[line].charAt(letter);

                //if there is a space or CR or LF increment word and skip
                if (thisLetter == ' ' || thisLetter == '\r' || thisLetter == '\n') { 
                    word++;
                } else {

                    //in order to not have strings like "undefinedply", replace undefined with first char of word
                    if (typeof wordArray[word] === 'undefined') { 
                        wordArray[word] = thisLetter;

                    //add letters to the word until a space is reached
                    } else { 
                        wordArray[word] += thisLetter;
                    }
                }
            }
        }
    
    };
    
    PLY.prototype.addTo = function(g, rx, ry, rz, x, y, z, wireframe) {

        var l = this.faces.length;
        var rotx = rx;
        var roty = ry;
        var rotz = rz;
        if (typeof rx === 'undefined') {
            rotx = 0;
        }
        if (typeof ry === 'undefined') {
            roty = 0;
        }
        if (typeof rz === 'undefined') {
            rotz = 0;
        }
    
        var xrotation = new Matrix3D('rx', rotx);
        var yrotation = new Matrix3D('ry', roty);
        var zrotation = new Matrix3D('rz', rotz);
    
        var rotation = zrotation.multiplyMatrix(yrotation.multiplyMatrix(xrotation));
    
        for (var j = 0; j < l; j++) {
            
            var v1 = this.faces[j].p1;
            var v2 = this.faces[j].p2;
            var v3 = this.faces[j].p3;
            
            var n1 = this.normals[v1.at(0) + ", " + v1.at(1) + ", " + v1.at(2)];
            var n2 = this.normals[v2.at(0) + ", " + v2.at(1) + ", " + v2.at(2)];
            var n3 = this.normals[v3.at(0) + ", " + v3.at(1) + ", " + v3.at(2)];
            
                    
            if (rotx !== 0 && roty !== 0 && rotz !== 0) {
                v1 = rotation.multiplyVector(v1);
                v2 = rotation.multiplyVector(v2);
                v3 = rotation.multiplyVector(v3);
        
                n1 = rotation.multiplyVector(n1);
                n2 = rotation.multiplyVector(n2);
                n3 = rotation.multiplyVector(n3);
                
            }
            var sensor = g.sensor;
            var triangle = new Triangle3D(v1, v2, v3, g.material);
            var sensorv = triangle.mid.subtract(sensor);
            var notBackFace = sensorv.dot(triangle.norm) > 0;
            var center = new Vector3D(x, y, z);
            if (wireframe && notBackFace) {
                
                var m = new Material({"color": [0, 128, 0]});
                var line1 = new Line3D(v1.add(center), v2.add(center), m);
                var line2 = new Line3D(v2.add(center), v3.add(center), m);
                var line3 = new Line3D(v3.add(center), v1.add(center), m);
    
                line1.squareDistance = (line1.mid.at(0) - sensor.at(0)) * (line1.mid.at(0) - sensor.at(0)) + 
                                        (line1.mid.at(1) - sensor.at(1)) * (line1.mid.at(1) - sensor.at(1)) + 
                                        (line1.mid.at(2) - sensor.at(2)) * (line1.mid.at(2) - sensor.at(2));
    
                line2.squareDistance = (line2.mid.at(0) - sensor.at(0)) * (line2.mid.at(0) - sensor.at(0)) + 
                                        (line2.mid.at(1) - sensor.at(1)) * (line2.mid.at(1) - sensor.at(1)) + 
                                        (line2.mid.at(2) - sensor.at(2)) * (line2.mid.at(2) - sensor.at(2));
    
                line3.squareDistance = (line3.mid.at(0) - sensor.at(0)) * (line3.mid.at(0) - sensor.at(0)) + 
                                        (line3.mid.at(1) - sensor.at(1)) * (line3.mid.at(1) - sensor.at(1)) + 
                                        (line3.mid.at(2) - sensor.at(2)) * (line3.mid.at(2) - sensor.at(2));
        
                g.pushToQueue(line1);
                g.pushToQueue(line2);
                g.pushToQueue(line3);
            }
    
            if (notBackFace && !wireframe) {
                triangle.p1 = triangle.p1.add(center);
                triangle.p2 = triangle.p2.add(center);
                triangle.p3 = triangle.p3.add(center);
    
                triangle.mid = triangle.mid.add(center);
                triangle.normal1 = n1;
                triangle.normal2 = n2;
                triangle.normal3 = n3;
                triangle.squareDistance = (triangle.mid.at(0) - sensor.at(0)) * (triangle.mid.at(0) - sensor.at(0)) + (triangle.mid.at(1) - sensor.at(1)) * (triangle.mid.at(1) - sensor.at(1)) + (triangle.mid.at(2) - sensor.at(2)) * (triangle.mid.at(2) - sensor.at(2));
                g.queue.push(triangle);
            }
        }
    };
    return PLY;
});

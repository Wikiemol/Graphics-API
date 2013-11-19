function PLY(s){
	this.file = s;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET",s,false);
	xmlhttp.send(null);

	this.ply 		= xmlhttp.responseText;
	this.faces 		= []; //an array of triangle objects
	this.normals    = {}; //an object that will assign a normal to a vertex
}

PLY.prototype.load = function(s,flip) { //reads and adds to graphics object (g)
	var scale = s;
	var l = this.ply.length;
	var LF = "\n"; //what should be considered a new line character
	if(typeof flip === 'undefined') flip = 1;
	var lineArray 			= []; //stores each line as string
	var s 					= ''; //temp for store each line as string
	var line 				= 0; //line pointer
	var numberOfVertices 	= 0;
	var numberOfFaces		= 0;
	var vertices 			= []; //the array that will hold all of the vertices
	

	var wordArray 			= []; //holds each word that is on the line
	var word 				= 0; //word pointer, relative to line
	var element 			= ""; //the current element, used for determing what the property keyword will do.
	var format 				= "ascii"; // holds format, not taking into account versions
	var endHeader 			= 0; //the line that ends the header
	var endHeaderb			= 0; //the letter that ends the header
	var vertexFaces			= {};
	/**store each line of header as string**/

	for(var i = 0; i < l; i++){
		s += this.ply.charAt(i);
		if(this.ply.charAt(i) == "\n"){
			lineArray[line] = s;
			if(s.substr(0,10) == "end_header"){
				break;
			}
			s = ''; //Resets line string
			line++; //increment line;
		}
		endHeaderb = i;
	}
	endHeader = line;

	var lineArrayLength = lineArray.length;
	for(var i = 0; i < lineArrayLength; i++){ //check header to see if carriage returns should be used with new line
		if(lineArray[i].substr(0,10) == "end_header") break;
		if(this.ply.charAt(i) == '\r'){
			LF = "\r\n";
			break;
		}
	}

	/****************************DEFINING WORDS***********************************/
	var keywords = {"comment": (function(){word = wordArray.length}), /*skips comment by putting word pointer at the end of the line*/
					"element": (function(){elements[wordArray[1]](); word = wordArray.length;}), 
					"property": (function(){word = wordArray.length}), /*will skip properties for now, assuming faces are regular lists and that there are no color properties*/
					"format": (function(){format = wordArray[1]; word = wordArray.length}),  
					"ply": (function(){word = wordArray.length})}  /*skips ply, we handle it seperately*/

	var elements = {"vertex": (function(){numberOfVertices = parseInt(wordArray[2]); element = "vertex"}), //assuming float
					"face":  (function(){numberOfFaces = parseInt(wordArray[2]); element = "face"})}

	/***************************************************************/

	
	/**check if file begins with "ply"**/
	if(lineArray[0] != "ply" + LF) console.warn("Warning: " + this.file + " may be corrupted or may not be a ply file.");

	/****READ HEADER*****/
	for(line = 0; lineArray[line] != "end_header" + LF; line++){

		/********BEGIN READING LINE*********/
		fillWordArray();
		for(word = 0; word < wordArray.length; word++){
			if(keywords[wordArray[word]]){
				keywords[wordArray[word]]();
			}else{
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
	switch(format){

		case "ascii":
			/**load the rest of the document into linearray***/
			line = 0;
			for(var i = 0; i < l; i++){
				s += this.ply.charAt(i);
				if(this.ply.charAt(i) == "\n"){
					lineArray[line] = s;
					s = ''; //Resets line string
					line++; //increment line;
				}
			}
			/*---------------------------------------------*/
			line = endHeader + 1;
			/********READ VERTICES********/
			var verticesEnd = numberOfVertices + line;
			while(line < verticesEnd){
				fillWordArray();
				vertices.push(new Vector(parseFloat(wordArray[0]),parseFloat(wordArray[1]),parseFloat(wordArray[2])));
				wordArray = [];
				word = 0;
				line++;
			}
			/*------END READ VERTICES----------*/


			/********ADD FACES TO FACE ARRAY*******/
			var facesEnd = numberOfFaces + line;
		
			while(line < facesEnd){
				fillWordArray();
				if(wordArray[0] == 3){
					var index1 = parseInt(wordArray[1]); //index of vertex1 in vertices array
					var index2 = parseInt(wordArray[2]); //...............2..................
					var index3 = parseInt(wordArray[3]); //...............3..................
					
					var v1 = vertices[index1].multiply(scale);
					var v2 = vertices[index2].multiply(scale);
					var v3 = vertices[index3].multiply(scale);

					var triangle = new Triangle3D(v1,v2,v3);

					var v1string = v1.at(0) + "," + v1.at(1) + "," + v1.at(2);
					var v2string = v2.at(0) + "," + v2.at(1) + "," + v2.at(2);
					var v3string = v3.at(0) + "," + v3.at(1) + "," + v3.at(2);

					if(vertexFaces[v1string]){
						vertexFaces[v1string].push(triangle);
					}else{
						vertexFaces[v1string] = [triangle];
					}

					if(vertexFaces[v2string]){
						vertexFaces[v2string].push(triangle);
					}else{
						vertexFaces[v2string] = [triangle];
					}

					if(vertexFaces[v3string]){
						vertexFaces[v3string].push(triangle);
					}else{
						vertexFaces[v3string] = [triangle];
					}

					this.faces.push(triangle);
				}
				
				wordArray = [];
				word = 0;
				line++;
			}
			/*---------------END ADD FACES----------------*/
			console.log(vertices.length)

			/********FIND NORMALS************/
			for(var i = 0; i < vertices.length; i++){
				var vertex = vertices[i].multiply(scale);
				var vertexNormal = new Vector(0,0,0);
				
				var facesArray = vertexFaces[vertex.at(0) + "," + vertex.at(1) + "," + vertex.at(2)]
				
				for(var j = 0; j < facesArray.length; j++){
					vertexNormal = vertexNormal.add(facesArray[0].normal().unit());
				}

				vertexNormal = vertexNormal.multiply(1/facesArray.length);

				this.normals[vertex.at(0) + "," + vertex.at(1) + "," + vertex.at(2)] = vertexNormal.multiply(flip);
			}

			break;

		case "binary_big_endian":
			console.log("binary_big_endian");
			break;

		case "binary_little_endian":

			break;
	}
	



	function fillWordArray(){ //fills word array with words from the current line
		var lineLength = lineArray[line].length;
		for(var letter = 0; letter < lineLength; letter++){
			var thisLetter = lineArray[line].charAt(letter);
			if(thisLetter == ' ' || thisLetter == '\r' || thisLetter == '\n'){ //if there is a space or CR or LF increment word and skip
				word++;
			}else{
				if(typeof wordArray[word] === 'undefined') { //in order to not have strings like "undefinedply", replace undefined with first char of word
					wordArray[word] = thisLetter;
				}else{ //add letters to the word until a space is reached
					wordArray[word] += thisLetter;
				}
			}
		}
	}

};

PLY.prototype.addTo = function(g,rx,ry,rz) {
	var l = this.faces.length;
	var rotx = rx;
	var roty = ry;
	var rotz = rz;

	if(typeof rx === 'undefined'){
		rotx = 0;
	}
	if(typeof ry === 'undefined'){
		roty = 0;
	}
	if(typeof rz === 'undefined'){
		rotz = 0;
	}

	var xrotation = new Matrix('rx',rotx);
	var yrotation = new Matrix('ry',roty);
	var zrotation = new Matrix('rz',rotz);

	for(var i = 0; i < l; i++){
		var v1 = this.faces[i].p1;
		var v2 = this.faces[i].p2;
		var v3 = this.faces[i].p3;

		var n1 = this.normals[v1.at(0)+","+v1.at(1)+","+v1.at(2)];
		var n2 = this.normals[v2.at(0)+","+v2.at(1)+","+v2.at(2)];
		var n3 = this.normals[v3.at(0)+","+v3.at(1)+","+v3.at(2)];
		
		if(rotx != 0 && roty != 0 && rotz != 0){
			v1 = zrotation.multiplyVector(yrotation.multiplyVector(xrotation.multiplyVector(v1)));
			v2 = zrotation.multiplyVector(yrotation.multiplyVector(xrotation.multiplyVector(v2)));
			v3 = zrotation.multiplyVector(yrotation.multiplyVector(xrotation.multiplyVector(v3)));

			n1 = zrotation.multiplyVector(yrotation.multiplyVector(xrotation.multiplyVector(n1)));
			n2 = zrotation.multiplyVector(yrotation.multiplyVector(xrotation.multiplyVector(n2)));
			n3 = zrotation.multiplyVector(yrotation.multiplyVector(xrotation.multiplyVector(n3)));
		}
		

		g.fillTriangle( v1.at(0),v1.at(1),v1.at(2),
						v2.at(0),v2.at(1),v2.at(2),
						v3.at(0),v3.at(1),v3.at(2),
						n1,n2,n3);
	}
};

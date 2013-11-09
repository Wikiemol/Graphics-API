function PLY(s){
	this.file = s;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET",s,false);
	xmlhttp.send(null);
	this.ply = xmlhttp.responseText;
	this.vertices = [];

}

PLY.prototype.load = function() { //reads and adds to graphics object (g)
	var l = this.ply.length;
	var LF = "\n"; //what should be considered a new line character
	
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
			
			/********READ AND ADD FACES*******/
			var facesEnd = numberOfFaces + line;
		
			while(line < facesEnd){
				fillWordArray();
				if(wordArray[0] == 3){
					var index1 = parseInt(wordArray[1]);
					var index2 = parseInt(wordArray[2]);
					var index3 = parseInt(wordArray[3]);
		
					var v1 = vertices[index1].multiply(50);
					var v2 = vertices[index2].multiply(50);
					var v3 = vertices[index3].multiply(50);
					this.vertices.push(v1);
					this.vertices.push(v2);
					this.vertices.push(v3);
					
				}
				
				wordArray = [];
				word = 0;
				line++;
			}
			break;

		case "binary_big_endian":
			console.log("binary_big_endian");
			break;

		case "binary_little_endian":

			break;
	}
	



	function fillWordArray(){ //fills word array with words from the current line
		console.log( lineArray[line]);
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

PLY.prototype.addTo = function(g) {
	var l = this.vertices.length;
	for(var i = 0; i < l; i += 3){
		var v1 = this.vertices[i];
		var v2 = this.vertices[i + 1];
		var v3 = this.vertices[i + 2];
		g.fillTriangle(v1.at(0),v1.at(1),v1.at(2),
						v2.at(0),v2.at(1),v2.at(2),
						v3.at(0),v3.at(1),v3.at(2));
	}
};

function PLY(s){
	this.file = s;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET",s,false);
	xmlhttp.send(null);

	this.ply = xmlhttp.responseText;

}

PLY.prototype.readTo = function(g) { //reads and adds to graphics object (g)
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
	var element 			= null;

	/**store each line as string**/

	for(var i = 0; i < l; i++){
		s += this.ply.charAt(i);
		if(this.ply.charAt(i) == "\n"){
			lineArray[line] = s;
			s = ''; //Resets line string
			line++; //increment line;
		}
	}

	for(var i = 0; i < lineArray.length; i++){ //check header to see if carriage returns should be used with new line
		if(lineArray[i].substr(0,10) == "end_header") break;
		if(this.ply.charAt(i) == '\r'){
			LF = "\r\n";
			break;
		}
	}



	/****************************DEFINING WORDS***********************************/
	var keywords = {"comment": (function(){word = wordArray.length}), /*skips comment by putting word pointer at the end of the line*/
					"element": (function(){elements[wordArray[1]](); word = wordArray.length;}), /*runs code for specific element*/
					"property": (function(){word = wordArray.length}), /*will skip properties for now, assuming faces are regular lists and that there are no color properties*/
					"format": (function(){word = wordArray.length}), /*skipping format for now, assuming its ascii 1.0*/
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
			keywords[wordArray[word]]();
		}
		wordArray = [];
		word = 0;
		/*------END READ LINE-------*/

	}
	/*----END READ HEADER-----*/

	line++;

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

			g.fillTriangle(v1.at(0),v1.at(1),v1.at(2),
						   v2.at(0),v2.at(1),v2.at(2),
						   v3.at(0),v3.at(1),v3.at(2));
		}
		
		wordArray = [];
		word = 0;
		line++;
	}

	function fillWordArray(){ //fills word array with words from the current line
		for(var letter = 0; letter < lineArray[line].length; letter++){
			if(lineArray[line].charCodeAt(letter) == 32 || lineArray[line].charAt(letter) == '\r' || lineArray[line].charAt(letter) == '\n'){ //if there is a space or CR or LF increment word and skip
				word++;
			}else{
				if(typeof wordArray[word] === 'undefined') { //in order to not have strings like "undefinedply", replace undefined with first char of word
					wordArray[word] = lineArray[line].charAt(letter);
				}else{ //add letters to the word until a space is reached
					wordArray[word] += lineArray[line].charAt(letter);
				}
			}
		}
	}

	
	
	

	
};
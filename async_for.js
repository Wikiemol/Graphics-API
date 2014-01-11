function async_for(/*string*/ varName, /*int*/ initial, /*int*/ end, /*string*/ operation,/*function*/ inner,
                  /*string*/ setTimeoutCondition, /*unsigned int*/ duration, /*function*/ onSetTimeout){
                    
  var variable = {};
  variable[varName] = initial;
  next();
  var next = function(){
    inner();
    switch(operation){ //only ++ and -- for now
      "++":
        variable[varName]++;
      "--":
        variable[varName]--;
    }
    if((variable[varName] < end && operation == "++") || (variable[varName] > end && operation == "--")){
      if(eval(setTimeoutCondition)){
        onSetTimeout();
        setTimeout(next(),duration)
      }else{
        next();
      }
    }
  }
  
}
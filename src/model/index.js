const fs = require('fs');

function readFile(path) {
  return new Promise(function(resolve, reject){
      fs.readFile(path,"utf8",function read(err, data){
          if (err) return reject(err);
          resolve(data);
      });
  })
}

module.exports = {
    "getApogeeDuplex" : function(){
        return readFile("./src/model/tpl/ApogeeJdfV9_model_Simplex.jdf");
    },
    "getApogeeSimplex" : function(){
        return readFile("./src/model/tpl/ApogeeJdfV9_model.jdf");
    },
  };
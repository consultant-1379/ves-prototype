var probableCauseMap = new Map();
const fs = require('fs');
const path = require('path');
const re = /([\w|\d]*)\s*\((\d*)\)/
initializeProbableCauseMap(probableCauseMap);



function getProbableCause(eriProbableCauseInNum) {
    if (probableCauseMap.size === 0) {
        initializeProbableCauseMap(probableCauseMap);
    }
    return probableCauseMap.get(eriProbableCauseInNum);
}

function initializeProbableCauseMap(probableCauseMap) {
    console.log("Initialize the probable cause map");
    mibContentInLines = loadProbableCauseMib();
    for (var i = 0; i < mibContentInLines.length; ++i) {
        // Do not process the comment
        if (mibContentInLines[i].indexOf("--") === -1) {

            if ((result = re.exec(mibContentInLines[i])) !== null) {
                // eg. m3100AirConditioningFailure(102) in map is 
                // "102", "m3100AirConditioningFailure"
                probableCauseMap.set(result[2].trim(), result[1].trim());
            }
        }
    }

    console.log("the value of 102 is" + probableCauseMap.get("102"));
}

function loadProbableCauseMib() {
    var probableCauseMibPath = path.join(__dirname, '../..', 'mibsForMapping', 'probableCauseMib');
    console.log("The ProbableCauseMib path is:" + probableCauseMibPath);
    var mibContent = fs.readFileSync(probableCauseMibPath, 'utf-8', 'r');
    return mibContent.split('\n');
}





module.exports = {
    getProbableCause: getProbableCause,
}; 
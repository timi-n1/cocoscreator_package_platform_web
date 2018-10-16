var fs= require('fs');
var path = require('path');
var crypto = require('crypto');

module.exports = function(buildPath, cb){
    const indexFile = path.resolve(buildPath, './index.html');
    Editor.warn('index file path : ', indexFile);
    
    fs.readFile(indexFile, function(err, data) {
        if (err) return;
        var md5Value= crypto.createHash('md5').update(data, 'utf8').digest('hex').slice(0, 16);
        Editor.warn('index file md5 : ', md5Value);
        var newPath = path.resolve(buildPath, `./index.${md5Value}.html`);
        fs.renameSync(
            indexFile,
            newPath
        );
        cb(`index.${md5Value}.html`);
    });

}
function computePackageSize(buildPath){
    const glob = require("glob");
    const fs = require('fs-extra');

    let sizeTotal = 0;

    glob(`${buildPath}/**/*.*`, {}, function (er, files) {
        files.forEach((file) => {
            sizeTotal += fs.statSync(file).size;
        });
        Editor.success(`[全部完成]初始包体共${files.length}个文件，总大小${(sizeTotal/1024).toFixed(0)}KB!`);
    })
}

module.exports = function (buildPath, allDone) {
    Editor.success('[h5版本]开始自动处理资源到cdn');
    const cwd = buildPath;
    const path = require('path');
    const fs = require('fs-extra');
    const glob = require("glob");
    //const request = require('request');
    const crypto = require('crypto');
    const async = require('async');
    var exec = require('child_process').exec;
    //const Curl = require('node-libcurl').Curl;
    
    const packagePath = path.resolve(Editor.projectInfo.path, `./package.json`);
    const packageJson = JSON.parse( fs.readFileSync(packagePath).toString() );

    let upLoadUrl = packageJson.cdnUploadAPI;
    let remotePath = packageJson.h5Path;

    // const removePathList = [
    //     './res/raw-assets/resources/dynamic',
    //     './res/raw-internal'
    // ];
    // //在import目录寻找较大的文件，加入到removePathList
    // const list = glob.sync(path.resolve(cwd, `./res/import/**/*.json`), {});
    // list.forEach((file)=>{
    //     const size = (fs.statSync(file).size/1024).toFixed(0);
    //     if( size > 25 ){
    //         // Editor.log(path.relative(cwd, file)+' = '+size+'kb');
    //         removePathList.push(path.relative(cwd, file));
    //     }
    // });
    

    // let fileLen = fs.statSync(filePath).size;
    let successCount = 0;
    let failedCount = 0;

    Editor.log(`远程目录：${remotePath}`);
    //const h5Path = path.resolve(buildPath, '../');
    glob(`${buildPath}/**/*.*`, {}, function (er, files) {
        //逐个资源处理
        async.eachOfSeries(files, (file, key, cb) => {
            let filePath = file;
            let subPath = filePath.slice(buildPath.length+1);
            Editor.log(`上传${subPath}`);
            let dateGMTstr = new Date().toGMTString();
            let fileData = fs.readFileSync(filePath);
            let sha1= crypto.createHash('sha1').update(fileData, 'utf8').digest('hex');
    
            const cmdStr = `curl -i -H "access-token: ${packageJson.access_token}" \
            -H "access-path: ${packageJson.access_path}" \
            -H "file-md5: ${sha1}" \
            -H "Content-Type: application/octet-stream" \
            -H "Last-Modifed: ${dateGMTstr}" \
            -X POST --upload-file "${filePath}" ${upLoadUrl}/${remotePath}/${subPath}`;
            //Editor.log(cmdStr);
            exec(cmdStr, function(err,stdout,stderr){
                if(err) {
                    Editor.log('uploadErr:'+stderr);
                } else {
                    // Editor.log('输出：');
                    // Editor.log(stdout);
                    if(stdout.search('200 OK') >= 0){
                        Editor.success('ok');
                        successCount ++;
                    }else{
                        Editor.error('failed');
                        failedCount ++;
                    }
                }
                cb();
            });
        }, ()=>{
            Editor.success(`执行上传文件总数：${files.length}，成功上传数：${successCount}，失败上传数：${failedCount}`);
            // removePathList.forEach((removePath)=>{
            //     fs.removeSync( path.resolve(cwd, removePath) );
            // });
            // // fs.removeSync(resPath);
            // Editor.log('包体res目录清理成功!');
            Editor.success('[h5版本]资源处理到cdn完毕!');
            computePackageSize(buildPath);
            allDone(remotePath);
        });
    })

}
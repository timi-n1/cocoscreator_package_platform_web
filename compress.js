const glob = require("glob");
const os = require('os');
const async = require('async');
const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');
const compressFunc = {};
let cwd = path.resolve(__dirname, '../../build/web-mobile');

module.exports = function (buildPath, allDone) {
    cwd = buildPath;
    //删除.DS_Store文件
    const dsstorefile = path.resolve(buildPath, './.DS_Store');
    if( fs.existsSync(dsstorefile) ){
        fs.unlinkSync( dsstorefile );
    }
    Editor.log('开始压缩资源');
    //资源类型检查
    const extCache = {};
    let sizeTotal = 0;
    glob(`${cwd}/**/*.*`, {}, function (er, files) {
        files.forEach((file) => {
            const ext = path.extname(file);
            if (!extCache[ext]) {
                extCache[ext] = true;
            }
        });
        //逐个资源处理
        async.eachOfSeries(extCache, (value, key, cb) => {
            if (compressFunc[key]) {
                compressFunc[key](()=>{
                    cb();
                });
            }
            else {
                Editor.warn(`缺少压缩处理函数[${key}]`);
                cb();
            }
        }, ()=>{
            files.forEach((file) => {
                sizeTotal += fs.statSync(file).size;
            });
            Editor.success(`[压缩概况]共${files.length}个文件，压缩后总大小${(sizeTotal/1024/1024).toFixed(1)}MB!`);
            allDone();
        });
    })
};

compressFunc['.png'] = function (done) {
    Editor.log('正在处理.png类型文件....');
    let sizeTotal = 0;
    let sizeCompress = 0;

    const ignoreList = [
        'alphaPremul',
        'extend/cats_alive/texture',
        'extend/cats_category/textures/temp/',
        'res/atlas/loading',
        'atlas/shop/storehouse',
        'atlas/splash/splash',
        'atlas/catsCategory/catsCategory',
        'extend/guest_spine',
    ];

    glob(`${cwd}/**/*.png`, {}, function (er, files) {
        files.forEach((file) => {
            const stat = fs.statSync(file);
            sizeTotal += stat.size;
        });
        //逐个资源处理
        async.eachOfSeries(files, (file, key, cb) => {
            
            let file0 = path.relative(cwd, file);
            let isignore = false;
            ignoreList.forEach((p)=>{
                if( file.indexOf(p) > 0 ){
                    isignore = true;
                }
            });
            if( isignore ){
                Editor.warn(`[跳过]${file0}`);
                cb();
                return;
            }

            Editor.log(`[处理]${file0}`);
            const sizeBefore = fs.statSync(file).size;
            // Editor.log(`压缩前=${(sizeBefore/1024).toFixed(0)}KB`);
            const pngquant = path.resolve(__dirname, `pngquant/${os.platform()}/pngquant`);
            const cmd = `${pngquant} 256 --skip-if-larger --force --ext .png "${file}"`;
            exec(cmd, (err, stdout, stderr) => {
                const sizeAfter = fs.statSync(file).size;
                sizeCompress += sizeAfter;
                if (sizeAfter > sizeBefore) {
                    Editor.error('变大了' + file);
                }
                cb();
            });
        }, () => {
            Editor.success(`[PNG压缩]共${files.length}个文件，压缩前总大小${(sizeTotal / 1024).toFixed(0)}KB，压缩后总大小${(sizeCompress / 1024).toFixed(0)}KB`);
            done();
        });
    })
};


compressFunc['.jpg'] = function(done){
    Editor.log('正在处理.jpg类型文件....');
    let sizeTotal = 0;
    let sizeCompress = 0;
    glob(`${cwd}/**/*.jpg`, {}, function (er, files) {
        files.forEach((file)=>{
            const stat = fs.statSync(file);
            sizeTotal += stat.size;
        });
        Editor.success(`[JPEG压缩]共${files.length}个文件，压缩前总大小${(sizeTotal/1024).toFixed(0)}KB, 跳过压缩`);
        //逐个资源处理
        // async.eachOfSeries(files, (file, key, cb)=>{
        //     // Editor.log(file);
        //     let jsonStr = fs.readJsonSync(file);
        //     fs.writeFileSync(file, JSON.stringify(jsonStr));
        //     const stat = fs.statSync(file);
        //     sizeCompress += stat.size;
        //     cb();
        // }, ()=>{
        //     Editor.log(`压缩后，总大小${(sizeCompress/1024).toFixed(0)}KB`);
        // });
        done();
    })
};

compressFunc['.mp3'] = function(done){
   done();
};

compressFunc['.atlas'] = function(done){
    done();
 };

compressFunc['.wav'] = function(done){
    done();
 };
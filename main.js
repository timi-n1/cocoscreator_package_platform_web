'use strict';

let h5BuildPath = null;
let indexFileName = null;

module.exports = {
    load() {
        // 当 package 被正确加载的时候执行
    },

    unload() {
        // 当 package 被正确卸载的时候执行
    },

    messages: {
        'run-test'() {
            if (!h5BuildPath) {
                Editor.error('请先至少执行一次Web Mobile构建!');
                return;
            }

            // Editor.Panel.open('webgame-cdn');

            require('./index-rename')(h5BuildPath, (indexFile)=>{
                indexFileName = indexFile;
                Editor.warn('index file rename done', indexFile);

                require('./compress')(h5BuildPath, () => {
                    Editor.Ipc.sendToPanel('webgame-cdn', 'update-status', '准备上传资源');
                    require('./cdn_upload')(h5BuildPath, (remotePath)=>{
                        Editor.Ipc.sendToPanel('webgame-cdn', 'update-status', '资源上传成功，准备生成二维码');
                        const indexPath = `https://h5game.qq.com/${remotePath}/${indexFileName}?business=game&hidetitlebar=1&hidestatusbar=1&backconfirm=1`;
                        Editor.success('测试访问地址:', indexPath);
    
                        // var QRCode = require('qrcode')
                        // var path = require('path');
                        // const qrcodePath = path.resolve(h5BuildPath, '../h5_qrcode.png');
                        // QRCode.toFile(qrcodePath, indexPath, {
                        //     color: {
                        //       dark: '#000',  // Blue dots
                        //       light: '#0000' // Transparent background
                        //     }
                        //   }, function (err) {
                        //     if (err) throw err
                            
                        //     Editor.Ipc.sendToPanel('webgame-cdn', 'update-status', '完成', qrcodePath);
                        // });
                        h5BuildPath = null;
                        
                    });
                });
            })

        },
        'run-online'() {
            if (!h5BuildPath) {
                Editor.error('请先至少执行一次Web Mobile构建!');
                return;
            }

            // Editor.Panel.open('webgame-cdn');

            require('./compress')(h5BuildPath, () => {
                Editor.Ipc.sendToPanel('webgame-cdn', 'update-status', '准备上传资源');
                require('./cdn_upload')(h5BuildPath, (remotePath)=>{
                    Editor.Ipc.sendToPanel('webgame-cdn', 'update-status', '资源上传成功，准备生成二维码');
                    const indexPath = `https://h5game.qq.com/${remotePath}/index.html?business=game&hidetitlebar=1&hidestatusbar=1&backconfirm=1`;
                    Editor.success('正式访问地址:', indexPath);

                    // var QRCode = require('qrcode')
                    // var path = require('path');
                    // const qrcodePath = path.resolve(h5BuildPath, '../h5_qrcode.png');
                    // QRCode.toFile(qrcodePath, indexPath, {
                    //     color: {
                    //       dark: '#000',  // Blue dots
                    //       light: '#0000' // Transparent background
                    //     }
                    //   }, function (err) {
                    //     if (err) throw err
                        
                    //     Editor.Ipc.sendToPanel('webgame-cdn', 'update-status', '完成', qrcodePath);
                    // });
                    h5BuildPath = null;
                    
                });
            });
        },
        'editor:build-start'(evt, data) {
            //Editor.warn('editor build start', evt, data);
            if('web-mobile' == data.platform){
                h5BuildPath = data.dest;
                Editor.warn('webgame build path: ', h5BuildPath);
            }
        },
        // 'editor:build-finished'(evt, data){
        //     //Editor.warn('editor build finished', evt, data);
        //     if('web-mobile' == data.platform){
        //         require('./index-rename')(data.dest, (indexFile)=>{
        //             indexFileName = indexFile;
        //             Editor.warn('index file rename done', indexFile);
        //         })
        //     }
        // }
    },
};
Editor.Panel.extend({
    style: `
        .center{
            margin-left: auto;
            margin-right: auto;
        }
        #box{
            background-color: white;
            width: 200px;
            height: 200px;
        }
        #qrcode{
            width: 200px;
            height: 200px;
        }
        #status{
            color: gray;
        }
    `,
    template: `
        <h3 class="center" width="200px" align="center" >扫描二维码预览</h3>
        <ui-box-container id="box" class="center" >
            <ui-loader id="loader"><p id="status">正在压缩资源</p></ui-loader>
            <img id="qrcode" class="center">
        </ui-box-container>

    `,

    $:{
        loader: '#loader',
        qrcode: '#qrcode',
        status: '#status'
    },

    messages: {
        'update-status': function (event, loadingText, imgUrl) {
            //do some work
            this.$status.innerText = loadingText;
            if(imgUrl){
                this.$loader.style.visibility = "hidden";
                this.$qrcode.src = imgUrl;
            }
        }
    }

});
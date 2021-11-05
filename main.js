// ==UserScript==
// @name         为风车动漫添加弹幕功能
// @namespace    https://github.com/innnky
// @version      0.1
// @description  本脚本为风车动漫网站添加了弹幕功能，你可以发送弹幕并和所有人互动。本插件目前非常不完善，为一个菜鸡程序员随便写着玩玩的，弹幕服务器是廉价天翼云服务器1核2G 5M,并且采用flask做后端,性能比较垃圾。如果发弹幕的人多的话我会把弹幕数据上传到github作备份，所以不用担心数据丢失
// @author       innnky
// @match        https://www.dm530p.net/play/*
// @grant        GM_xmlhttpRequest
// @require      https://code.jquery.com/jquery-1.12.4.min.js
// @connect api.innky.xyz
// @license     GPL License


// ==/UserScript==
(function() {
    'use strict';

    var f_final = function()
    {



//·····················································································
//·····················初始化 将元素添加到网页中·························
        // var box_html = "<div style='display:block;z-index:999;position:absolute; right:10px;top:80%; width:360px; height:40px;line-height:30px; background-color:#f50;color:#fff;text-align:center;font-size:16px;font-family:\"Microsoft YaHei\",\"微软雅黑\",STXihei,\"华文细黑\",Georgia,\"Times New Roman\",Arial,sans-serif;font-weight:bold'>请输入弹幕<input type=\"text\" id=\"danmu_text\" /><input id=\"send_danmu\" type=\"submit\" value=\"发送\" /></div>"

        var xxx=[' <div id=\'function_box\' style=\'display:block;z-index:999;position:absolute; right:10px;top:10PX; width:400px; height:40px;line-height:30px; text-align:center;font-size:16px;font-family:"Microsoft YaHei","微软雅黑",STXihei,"华文细黑",Georgia,"Times New Roman",Arial,sans-serif;font-weight:bold\'>',
        '        <div class="alert alert-primary" role="alert">',
        '            <div class="col-sm-12">',
        '                <div class="form-group row">',
        '                    <div class="col-sm-9">',
        '                    <input type="text" class="form-control" id="danmu_text" placeholder="请输入弹幕">',
        '                    </div>',
        '                    <button id="send_danmu" type="button" class="col-sm-3 btn btn-dark">发送</button>',
        '                    ',
        '                </div>',
        '            </div>',
        '            <div align="left" class="col-sm-12">',
        '                <h6 id="info">提示信息：未能成功获取弹幕，请刷新或反馈bug</h6>',
        '            </div>',
        '        </div>',
        '    </div>'].join("");
        $('head').append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css" integrity="sha384-zCbKRCUGaJDkqS1kPbPd7TveP5iyJE0EjAuZQTgFLD2ylzuqKfdKlfG/eSrtxUkn" crossorigin="anonymous">')
        $("body").append(xxx)
        $("body").append('<div id=\'hide\' style=\'display:block;z-index:999;position:absolute; left:10px;top:10PX; width:100; line-height:30px; text-align:center;font-size:16px;\'><button type="button" class="btn btn-info">Hide</button></div>')
        $('#hide').click( function() {
            if($("#function_box").css("display") == 'none'){
                $("#function_box").show()
            }else{
                $("#function_box").hide()

            }
        });
        var set_info = function(c){
            $("#info").text("提示信息："+c);
        }
        // $('body').append(box_html);
        var canvas = document.createElement("canvas");
        var container = document.createElement("div");
        //两个待解决的问题：1.页面缩放，显示区域问题
        //                2.跳转播放时弹幕显示方式。
        // bd = document.getElementById("i_cecream");
        //var bd= document.getElementsByTagName("body")[0];
        //var bdd =document.getElementsByClassName("area")[0];

        let ifg = document.getElementById("fc_playfram").contentWindow.document
        var bdd = ifg.querySelector("[class^=\"ckplayer\"]")

        bdd.appendChild(container);

        container.appendChild(canvas);
        container.setAttribute("style","width: inherit;height: 50%;position: absolute;top: 0px;z-index: 99999;")
        canvas.setAttribute("id","danmu_canvas");
        canvas.setAttribute("style","width: inherit;height: 100%;")
//·····················································································
//·····················获取和设置画布·························
        var context = canvas.getContext("2d");
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        var dwidth = canvas.width;
        var dheight = canvas.height;

//·····················································································
//·····················定义函数和对象·························

        var get_time = function(){
            let play_time = ifg.querySelector("[class^=\"timetext\"]");
            var tstr = play_time.innerText;
            var min = parseInt(tstr.substr(0,2));
            var sec = parseInt(tstr.substr(3,2));
            var t = min*60+sec;
            return t;
        }
        var is_pausing = function(){

            let is_playing_tag = ifg.querySelector("[data-title=\"点击播放\"]");
            let temp = is_playing_tag.getAttribute("style")
            return temp.slice(-3,-1)=='ck'
        }

        var Barrage = function (obj) {
            this.x = dwidth;
            this.y = dheight*Math.random()*0.9+24;
            this.moveX = -1;
            this.content = obj.content;
            this.time = obj.time;
            this.visable = false;
            this.draw = function () {
                if(this.visable){
                    // console.log("1111111")
                    context.font = "24px bold 黑体";
                    context.fillStyle = 'rgba(255,255,255,1)';
                    context.fillText(this.content, this.x, this.y);
                    // context.strokeStyle = "black";
                    // context.strokeText(this.content, this.x, this.y)
                }
            };
            this.update = function () {
                if(last_playtime <=this.time && precise_play_time >this.time){
                    this.visable = true;
                    //
                }
                let tt = precise_play_time-this.time;
                if(tt<0 || tt>26){
                    this.visable = false;

                }
                if(this.visable && is_playing){
                    this.x+=this.moveX;
                }

            };
            this.reset = function(){
                this.x = dwidth;
                this.visable = false;
            }
        };

//·····················································································
//·····················定义渲染函数·························
        function draw(){
            // canvas.width = canvas.clientWidth;
            // canvas.height = canvas.clientHeight;
            // console.log(precise_play_time+"  "+last_playtime);
            // console.log(x);

            store.forEach(element => {
                element.update();
                element.draw();
            });

            last_playtime = precise_play_time;
        }
        var render = function () {
            context.clearRect(0, 0, canvas.width, canvas.height);
            draw();
            requestAnimationFrame(render);
        };


//·····················································································
//·····················定义监听函数·························
        var precise_play_time = 0.0;
        var is_playing;
        var time_handler = function(t){
            precise_play_time = t;
            // console.log();
            is_playing = true;
        }
        var pause_handler = function(){
            is_playing = false;
        }
        var seekHandler = function (state,name){
            store.forEach(element => {
                element.reset();
            });
            console.log('时间跳转状态：'+state,name);
        }
        var resize_handler = function(){
            // console.log("1111111111111")
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            dwidth = canvas.width;
            dheight = canvas.height;
            store.forEach(element => {
                element.reset();
            });
        }
        document.getElementById("fc_playfram").contentWindow.player.addListener("time",time_handler);
        document.getElementById("fc_playfram").contentWindow.player.addListener("pause",pause_handler);
        document.getElementById("fc_playfram").contentWindow.player.addListener("seek",seekHandler);
        document.getElementById("fc_playfram").contentWindow.addEventListener('resize',resize_handler);



//·····················································································
//·····················使用假数据初始化弹幕列表·························
        var danmu_data = [{content:"0s",time:0},{content:"2s",time:2},{content:"5s",time:5},{content:"8s",time:8},{content:"11s",time:11},{content:"14s",time:14}];
        var last_playtime = 0;
        var store = [];
        var globale_danmu_data;
        var urlstr = window.location.pathname;
        var ss1 = urlstr.split("-");
        var aid = ss1[0].split('/')[2];
        var ep = ss1[2].split(".")[0];
        var source = ss1[1];
        var start_danmu = function(){
            globale_danmu_data.forEach(element => {
                store.push(new Barrage(element))
            });
            render()
        }
        var a="";
        var x,y,z;
        GM_xmlhttpRequest({
            method: "get",
            // url: "http://127.0.0.1:5000/getdanmu?aid="+aid+"&ep="+ep+"&source="+source,
            url: "http://api.innky.xyz:5000/getdanmu?aid="+aid+"&ep="+ep+"&source="+source,
            responseType:'json',
            onload: function(res){
                if(res.response.status!=0){
                    set_info("请更新版本后使用或报告bug");
                    null.append(null);
                }
                globale_danmu_data=res.response.data;

                var meta_info = res.response.meta_info;
                var meta_str=''
                meta_info.forEach(element =>{
                    let temp = "列表"+(element.source+1)+"···"+element.counts+"条 "

                    meta_str+=temp;

                })
                set_info("获取弹幕成功,因不同播放源视频弹幕无法匹配，故各弹幕分开计算。本番剧本集不同播放列表及对应弹幕数量如下(未显示说明当前无弹幕):"+meta_str);
                start_danmu()
            },
            onerror : function(err){
                console.log('error')
                set_info("获取弹幕失败！")

            }
        });
        let send = document.getElementById("send_danmu");

        send.onclick = function() {

            GM_xmlhttpRequest({
                method: "get",
                // url: "http://127.0.0.1:5000/senddanmu?time="+precise_play_time+"&content="+$("#danmu_text").val()+"&aid="+aid+"&ep="+ep+"&source="+source,
                url: "http://api.innky.xyz:5000/senddanmu?time="+precise_play_time+"&content="+$("#danmu_text").val()+"&aid="+aid+"&ep="+ep+"&source="+source,
                responseType:'json',
                onload: function(res){
                    let newb = new Barrage({content:$("#danmu_text").val(),time:precise_play_time});
                    newb.visable = true;
                    store.push(newb);
                    $("#danmu_text").val("")
                    set_info("发送弹幕成功！")

                },
                onerror : function(err){
                    console.log('error')
                    $("#danmu_text").val("")
                    set_info("发送弹幕失败！")

                }
            });

        };
        $("#danmu_text").keydown(function(event){ //给input绑定一个键盘点击事件
            event=event ||window.event;
            if(event.keyCode==13){ //判断点的是否是回车键
                 $("#send_danmu").click(); //程序式点击了搜索按钮
            }

        });
    }

    document.getElementById("fc_playfram").onload=f_final;


})();




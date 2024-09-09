// 注意：live2d_path 参数应使用绝对路径
const live2d_path = "../live2d/";
//const live2d_path = "/live2d-widget/";

// 封装异步加载资源的方法
function loadExternalResource(url, type) {
    return new Promise((resolve, reject) => {
        let tag;

        if (type === "css") {
            tag = document.createElement("link");
            tag.rel = "stylesheet";
            tag.href = url;
        }
        else if (type === "js") {
            tag = document.createElement("script");
            tag.src = url;
        }
        if (tag) {
            tag.onload = () => resolve(url);
            tag.onerror = () => reject(url);
            document.head.appendChild(tag);
        }
    });
}

//加载背景特效canvas-nest
function initBackgroundEffects() {
    let tag = document.createElement("script");
    tag.src = live2d_path + "js/canvas-nest.min.js";
    tag.type = "text/javascript";
    tag.setAttribute("color", "0,205,205");
    tag.setAttribute("opacity", "0.9");
    tag.setAttribute("zIndex", "-2");
    tag.setAttribute("count", "150");
    document.body.appendChild(tag);
}

//加载鼠标特效
function initMouseEffects() {
    /* 鼠标特效 */
    var a_idx = 0;
    jQuery(document).ready(
        function($) {
            $("body").click(
                function(e) {
                    var a = new Array("💗","富强","💗","民主","💗","文明","💗","和谐","💗","自由","💗","平等","💗","公正","💗","法治","💗","爱国","💗","敬业","💗","诚信","💗","友善");
                    var $i = $("<span />").text(a[a_idx]); a_idx = (a_idx + 1) % a.length;
                    var x = e.pageX, y = e.pageY;
                    $i.css({ "z-index": 999999999999999999999999999999999999999999999999999999999999999999999,
                        "top": y - 20, "left": x, "position": "absolute", "font-weight": "bold", "color": "rgb("+~~(255*Math.random())+","+~~(255*Math.random())+","+~~(255*Math.random())+")"});
                    $("body").append($i); $i.animate({ "top": y - 180, "opacity": 0 }, 1500, function() { $i.remove(); }); }); });
}

// 加载 waifu.css live2d.js waifu-tips.js
//768
if (screen.width >= 50) {
    Promise.all([
        loadExternalResource(live2d_path + "css/waifu.css", "css"),
        loadExternalResource(live2d_path + "css/live2d.css", "css"),
        loadExternalResource(live2d_path + "js/jquery.min.js", "js"),
        loadExternalResource(live2d_path + "js/live2d.js", "js"),
        loadExternalResource(live2d_path + "js/waifu-tips.js", "js")
    ]).then(() => {
        initWidget({
            waifuPath: live2d_path + "waifu.json",
            cdnPath: live2d_path
        });
        initMouseEffects();
        initBackgroundEffects();
    });
}
// initWidget 第一个参数为 waifu-tips.json 的路径，第二个参数为 API 地址
// 初始化看板娘会自动加载指定目录下的 waifu-tips.json

function load_custom_script() {
    wp_enqueue_script(
        'autoloadLive2d', // 注册的脚本名称
        get_template_directory_uri() . '/js/autoload.js', // 公共 JS 文件的路径
        array(), // 依赖项数组
        '1.0', // 版本号
        true // 是否在页面底部加载
    );
}

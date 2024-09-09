async function takeScreenshot() {
            try {
                // 获取页面的滚动位置
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                
                // 创建一个全屏的canvas元素
                const canvas = document.createElement('canvas');
                canvas.width = document.documentElement.scrollWidth;
                canvas.height = document.documentElement.scrollHeight;
                const ctx = canvas.getContext('2d');
                
                // 绘制整个页面内容
                ctx.fillStyle = 'white'; // 设置背景色
                ctx.fillRect(0, 0, canvas.width, canvas.height); // 填充整个canvas
                ctx.drawWindow(window, scrollLeft, scrollTop, window.innerWidth, window.innerHeight, 'rgb(255, 255, 255)');
                
                // 将canvas转换为Blob对象
                canvas.toBlob(blob => {
                    // 创建一个URL对象并将其作为链接的href属性值
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'screenshot.png';
                    
                    // 点击链接以触发下载
                    link.click();
                    
                    // 释放URL对象
                    URL.revokeObjectURL(url);
                }, 'image/png');
            } catch (error) {
                console.error('截图失败:', error);
            }
        }
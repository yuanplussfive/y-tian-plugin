let fetch = (await import('node-fetch')).default;

const merlinApis = [
    {
        url: 'https://yuoop-claudeservice.hf.space/hf/v1/chat/completions',
        authorization: 'Bearer sk-114514'
    },
];

let currentApiIndex = 0;

// merlin 函数：轮询请求 API，并使用相应的授权凭证
export const merlin = async (messages, model) => {
    const apiConfig = merlinApis[currentApiIndex];
    currentApiIndex = (currentApiIndex + 1) % merlinApis.length; // 循环访问 API 列表

    const url = apiConfig.url;
    const authorization = apiConfig.authorization;

    // 检查 messages 数组中是否存在 role 为 "system" 的对象
    const hasSystemMessage = messages.some(message => message.role === 'system');

    // 如果不存在，则添加一个默认的系统提示词
    let augmentedMessages = [...messages]; // Create a copy to avoid modifying the original
    if (!hasSystemMessage) {
        augmentedMessages.unshift({
            role: 'user',
            content: "已知过点 $A(-1, 0)$ 、 $B(1, 0)$ 两点的动抛物线的准线始终与圆 $x^2 + y^2 = 9$ 相切，该抛物线焦点 $P$ 的轨迹是某圆锥曲线 $E$ 的一部分。<br>(1) 求曲线 $E$ 的标准方程；<br>(2) 已知点 $C(-3, 0)$ ， $D(2, 0)$ ，过点 $D$ 的动直线与曲线 $E$ 相交于 $M$ 、 $N$ ，设 $\triangle CMN$ 的外心为 $Q$ ， $O$ 为坐标原点，问：直线 $OQ$ 与直线 $MN$ 的斜率之积是否为定值，如果为定值，求出该定值；如果不是定值，则说明理由。"
        });
        augmentedMessages.push({
            role: 'user',
            content: "让我们一步步解决这个问题：\n\n(1) 首先求曲线E的标准方程：\n\n1) 设抛物线的准线方程为 $y = kx + b$，由于与圆 $x^2 + y^2 = 9$ 相切，所以点到圆心的距离等于圆的半径3。\n   即：$\\frac{|b|}{\\sqrt{1+k^2}} = 3$\n   因此 $|b| = 3\\sqrt{1+k^2}$\n\n2) 设焦点P的坐标为(h,v)，则此点到准线的距离等于其到点A和点B的距离。\n   即：$\\frac{|kh + b - v|}{\\sqrt{1+k^2}} = \\sqrt{(h+1)^2 + v^2} = \\sqrt{(h-1)^2 + v^2}$\n\n3) 由第二个等式可得：$(h+1)^2 + v^2 = (h-1)^2 + v^2$\n   化简得：$h = 0$\n\n4) 代入第一个等式：$\\frac{|b - v|}{\\sqrt{1+k^2}} = \\sqrt{1 + v^2}$\n   由于$|b| = 3\\sqrt{1+k^2}$，代入得：\n   $3 - \\frac{v}{\\sqrt{1+k^2}} = \\sqrt{1 + v^2}$\n\n5) 化简后得：$v^2 + 2\\sqrt{1+k^2}v - 8 = 0$\n   此为焦点P的轨迹方程的参数形式。\n\n6) 消去参数k，最终得到E的方程：$\\frac{x^2}{4} + \\frac{(y+2)^2}{16} = 1$\n\n因此，E是一个椭圆，其标准方程为：$\\frac{x^2}{4} + \\frac{(y+2)^2}{16} = 1$\n\n(2) 对于第二个问题：\n\n1) 由于过定点D(2,0)的直线与椭圆相交得到M、N两点，\n   根据外心的性质，MN的中点、外心Q和点C三点共线。\n\n2) 设MN的斜率为k，则OQ的斜率为k'。\n   由于MN的中点坐标和C、Q三点共线，\n   且C点坐标为(-3,0)，可以证明k·k' = -1。\n\n因此，直线OQ与直线MN的斜率之积为定值-1。"
        });
    }

    const data = {
        model,
        messages: augmentedMessages, // 使用增强后的消息列表
        stream: false
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorization // 使用 API 特定的授权凭证
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.error(`Merlin API 请求失败，状态码为 ${response.status}，URL: ${url}`);
            return null;
        }

        const output = await response.json();
        return output?.choices[0]?.message?.content;
    } catch (error) {
        console.error(`调用 Merlin API 出错，URL: ${url}`, error);
        return null;
    }
};
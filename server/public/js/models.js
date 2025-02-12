document.addEventListener('DOMContentLoaded', async () => {
    const modelListContainer = document.getElementById('model-list');

    try {
        const apiKey = process.env.DEFAULT_API_KEY || 'sk-123456';
        const response = await fetch('/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`API 请求失败，状态码：${response.status}`);
        }

        const modelData = await response.json(); // 获取原始的 JSON 数据

        // 遍历模型数据，为每个模型创建一个包含所有提供商的卡片
        for (const modelName in modelData) {
            if (modelData.hasOwnProperty(modelName)) {
                const providers = modelData[modelName];
                const card = createModelCard({ name: modelName, providers: providers }); // 将提供商数组传递给 createModelCard
                modelListContainer.appendChild(card);
            }
        }

    } catch (error) {
        console.error('Error fetching models:', error);
        modelListContainer.innerHTML = `<p class="error">加载模型时发生错误：${error.message}</p>`;
    }
});

// 修改 createModelCard 函数，使其能够处理包含提供商数组的模型对象
function createModelCard(model) {
    const card = document.createElement('div');
    card.classList.add('model-card');

    const modelName = document.createElement('h2');
    modelName.textContent = model.name;
    card.appendChild(modelName);

    const providersLabel = document.createElement('p');
    providersLabel.textContent = 'Providers:';
    card.appendChild(providersLabel);

    const providersList = document.createElement('ul');
    model.providers.forEach(provider => {
        const providerItem = document.createElement('li');
        providerItem.textContent = provider;
        providersList.appendChild(providerItem);
    });
    card.appendChild(providersList);

    return card;
}


// Function to get the Chinese description for each model
function getModelDescription(modelName) {
    // Add your Chinese descriptions here based on the model name
    switch (modelName) {
        case 'gpt-4o-mini':
            return '一个快速且经济高效的通用AI模型，适用于各种任务，包括文本生成、翻译和问答。';
        case 'gemini-2.0-flash-exp-free':
            return '谷歌开发的先进AI模型，擅长图像识别、自然语言处理和复杂推理。';
        default:
            return '此模型的功能和用途尚未详细描述。';
    }
}
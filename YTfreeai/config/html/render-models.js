function renderModels(models, tableBody) {
  const lastTenModels = models.slice(-10);
  lastTenModels.forEach(item => {
    let features = '';
    if (item.features.includes('internet')) {
      features += ' <i class="fas fa-globe"></i>';
    }
    if (item.features.includes('drawing')) {
      features += ' <i class="fas fa-paint-brush"></i>';
    }
    if (item.features.includes('code')) {
      features += ' <i class="fas fa-code"></i>';
    }
    if (item.features.includes('image_recognition')) {
      features += ' <i class="fas fa-image"></i>';
    }
    if (item.features.includes('conversation')) {
      features += ' <i class="fas fa-comments"></i>';
    }
    if (item.features.includes('file')) {
      features += ' <i class="fas fa-file-alt"></i>';
    }
    if (item.features.includes('music')) {
      features += ' <i class="fas fa-music"></i>';
    }
    if (item.features.includes('video')) {
      features += ' <i class="fas fa-video"></i>';
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.model}${features}</td>
      <td>${item.points}</td>
      <td>${item.token}</td>
      <td>${item.quota}</td>
    `;
    tableBody.appendChild(row);
  });
}

// 使用通过window传递的数据
const tableBody = document.getElementById('model-table-body');
renderModels(window.modelsData, tableBody);

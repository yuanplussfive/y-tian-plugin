let fileUrl = null

const conversationSelect = document.getElementById('conversationSelect');

const createConversationButton = document.getElementById('createConversationButton');

createConversationButton.addEventListener('click', createConversation);

document.getElementById('userInput').addEventListener('keydown', function (event) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile && event.keyCode === 13) {
    sendMessage();
    event.preventDefault();
  } else if (!isMobile && event.shiftKey && event.keyCode === 13) {
    sendMessage();
    event.preventDefault();
  }
});

document.getElementById('settingsButton').addEventListener('click', toggleSettingsPanel);

document.addEventListener('DOMContentLoaded', () => {
  initialize();
  SelectFirstConversation();
});

document.getElementById('saveSettings').addEventListener('click', saveSettings);

document.getElementById('clearHistory').addEventListener('click', clearHistory);

document.getElementById('conversationSelect').addEventListener('change', updateChatBox);

function initialize() {
  loadMessages();
  loadSettings();
  updateChatBox()
  updateConversationSelect()
}

function showNotification(message) {
  notification.textContent = message;
  notification.style.display = "block";
  notification.style.backgroundColor = "#f0f0f0";
  notification.style.color = "#fff";
  notification.style.textShadow = "1px 1px 1px #000";
  notification.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)";
  notification.style.borderRadius = "5px";
  notification.style.transition = "background-color 0.3s ease";

  setTimeout(function () {
    notification.style.display = "none";
  }, 2000);
}

function loadMessages() {
  let storedMessages = localStorage.getItem('messages');
  messages = storedMessages ? JSON.parse(storedMessages) : {};
}

function SelectFirstConversation() {
  updateConversationSelect();
  const firstConversationOption = document.querySelector('#conversationSelect option:first-child');
  if (firstConversationOption) {
    firstConversationOption.selected = true;
    updateChatBox();
  }
}

function loadSettings() {
  apikey = localStorage.getItem('apikey') || '';
  systemPrompt = localStorage.getItem('systemPrompt') || '';
  useSearch = localStorage.getItem('useNetwork') === 'true';
  useTTS = localStorage.getItem('useVideo') === 'true';
  model = localStorage.getItem('model') || 'gpt-3.5-turbo';
  document.getElementById('modelSelect').value = model;
  document.getElementById('systemPrompt').value = systemPrompt;
  document.getElementById('useNetwork').checked = useSearch;
  document.getElementById('useVideo').checked = useTTS;
}

function saveSettings() {
  apikey = "";
  systemPrompt = document.getElementById('systemPrompt').value.trim();
  useSearch = document.getElementById('useNetwork').checked;
  useTTS = document.getElementById('useVideo').checked;
  model = document.getElementById('modelSelect').value;
  localStorage.setItem('model', model);
  localStorage.setItem('apikey', apikey);
  localStorage.setItem('systemPrompt', systemPrompt);
  localStorage.setItem('useVideo', useTTS);
  localStorage.setItem('useNetwork', useSearch);
  hideSettingsPanel();
}

function deleteConversation(conversationName) {
  if (messages[conversationName]) {
    delete messages[conversationName];
    localStorage.setItem('messages', JSON.stringify(messages));
    updateConversationSelect()
  }
  updateChatBox();
}

document.getElementById('deleteConversation').addEventListener('click', function () {
  var activeConversation = document.getElementById('conversationSelect').value;
  deleteConversation(activeConversation);
  showNotification("当前对话已清空！");
});

function deleteAllConversations() {
  messages = {};
  localStorage.removeItem('messages');
  updateChatBox();
  updateConversationSelect()
}

function showConfirmDialog(message, confirmCallback, cancelCallback) {
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');
  document.body.appendChild(overlay);

  const dialog = document.createElement('div');
  dialog.classList.add('confirm-dialog');
  overlay.appendChild(dialog);

  const messageEl = document.createElement('p');
  messageEl.textContent = message;
  dialog.appendChild(messageEl);

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  dialog.appendChild(buttonContainer);

  const confirmButton = document.createElement('button');
  confirmButton.textContent = '确定';
  confirmButton.classList.add('confirm-button');
  buttonContainer.appendChild(confirmButton);

  const cancelButton = document.createElement('button');
  cancelButton.textContent = '取消';
  cancelButton.classList.add('cancel-button');
  buttonContainer.appendChild(cancelButton);

  confirmButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
    confirmCallback();
  });

  cancelButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
    cancelCallback && cancelCallback();
  });
}

document.getElementById('deleteAllConversations').addEventListener('click', function () {
  showConfirmDialog('您确定要删除所有对话吗?', deleteAllConversations, () => {

  });
});

function clearConversationHistory(conversationName) {
  if (messages[conversationName]) {
    messages[conversationName] = [];
    localStorage.setItem('messages', JSON.stringify(messages));
    updateChatBox();
  }
}

document.getElementById('clearHistory').addEventListener('click', function () {
  var activeConversation = document.getElementById('conversationSelect').value;
  clearConversationHistory(activeConversation);
});

function createNewConversation() {
  let newConversationName = prompt('为此对话命个名吧:');
  if (newConversationName && !messages[newConversationName]) {
    messages[newConversationName] = [];
    updateConversationSelect();
    localStorage.setItem('messages', JSON.stringify(messages));
  }
}

function updateConversationSelect() {
  let conversationSelect = document.getElementById('conversationSelect');
  conversationSelect.innerHTML = '';
  let conversationExists = false;
  Object.keys(messages).forEach((conversation) => {
    let option = document.createElement('option');
    option.value = conversation;
    option.textContent = conversation;
    conversationSelect.appendChild(option);
    if (conversation === "common") {
      conversationExists = true;
    }
  });
  if (!conversationExists) {
    messages["common"] = [];
    let option = document.createElement('option');
    option.value = "common";
    option.textContent = "common";
    conversationSelect.appendChild(option);
    localStorage.setItem('messages', JSON.stringify(messages));
    updateChatBox();
  }
}

function createConversation() {
  const primaryColor = '#7fb9c1';
  const secondaryColor = '#5c5757';
  const backgroundColor = '#1c1c1c';

  function applyStyle(element, styles) {
    for (const [key, value] of Object.entries(styles)) {
      element.style[key] = value;
    }
  }

  const backgroundContainer = document.createElement('div');
  applyStyle(backgroundContainer, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: backgroundColor,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  });

  const inputContainer = document.createElement('div');
  applyStyle(inputContainer, {
    backgroundColor: secondaryColor,
    padding: '30px',
    borderRadius: '10px',
    boxShadow: `0 0 20px ${primaryColor}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  });

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = '请输入标题名称...';
  applyStyle(input, {
    backgroundColor: secondaryColor,
    color: primaryColor,
    border: 'none',
    padding: '15px',
    borderRadius: '10px',
    fontFamily: 'Consolas, monospace',
    boxShadow: `0 0 10px ${primaryColor}`,
    outline: 'none',
    animation: 'inputGlow 1s infinite alternate',
    marginBottom: '20px',
    width: '300px',
    textAlign: 'center'
  });

  const buttonContainer = document.createElement('div');
  applyStyle(buttonContainer, {
    display: 'flex',
    justifyContent: 'center'
  });

  const button = document.createElement('button');
  button.textContent = '确定';
  applyStyle(button, {
    backgroundColor: secondaryColor,
    color: primaryColor,
    border: 'none',
    padding: '15px 25px',
    marginRight: '15px',
    borderRadius: '10px',
    fontFamily: 'Consolas, monospace',
    boxShadow: `0 0 20px ${primaryColor}`,
    textShadow: `0 0 5px ${primaryColor}`,
    transition: 'all 0.3s ease',
    animation: 'buttonGlow 1s infinite alternate'
  });

  const cancelButton = document.createElement('button');
  cancelButton.textContent = '取消';
  applyStyle(cancelButton, {
    backgroundColor: secondaryColor,
    color: primaryColor,
    border: 'none',
    padding: '15px 25px',
    marginLeft: '15px',
    borderRadius: '10px',
    fontFamily: 'Consolas, monospace',
    boxShadow: `0 0 20px ${primaryColor}`,
    textShadow: `0 0 5px ${primaryColor}`,
    transition: 'all 0.3s ease',
    animation: 'buttonGlow 1s infinite alternate'
  });

  button.addEventListener('mouseover', () => {
    applyStyle(button, {
      boxShadow: `0 0 30px ${primaryColor}`,
      transform: 'translateY(-3px)'
    });
  });

  button.addEventListener('mouseout', () => {
    applyStyle(button, {
      boxShadow: `0 0 20px ${primaryColor}`,
      transform: 'translateY(0)'
    });
  });

  cancelButton.addEventListener('mouseover', () => {
    applyStyle(cancelButton, {
      boxShadow: `0 0 30px ${primaryColor}`,
      transform: 'translateY(-3px)'
    });
  });

  cancelButton.addEventListener('mouseout', () => {
    applyStyle(cancelButton, {
      boxShadow: `0 0 20px ${primaryColor}`,
      transform: 'translateY(0)'
    });
  });

  const style = document.createElement('style');
  style.innerHTML = `
  @keyframes inputGlow {
    from { box-shadow: 0 0 10px ${primaryColor}; }
    to { box-shadow: 0 0 20px ${primaryColor}; }
  }
  @keyframes buttonGlow {
    from { box-shadow: 0 0 20px ${primaryColor}; }
    to { box-shadow: 0 0 30px ${primaryColor}; }
  }
`;
  document.head.appendChild(style);

  buttonContainer.appendChild(button);
  buttonContainer.appendChild(cancelButton);
  inputContainer.appendChild(input);
  inputContainer.appendChild(buttonContainer);
  backgroundContainer.appendChild(inputContainer);
  document.body.appendChild(backgroundContainer);
  button.addEventListener('click', function () {
    let newConversationName = input.value;

    if (newConversationName) {
      if (!messages[newConversationName]) {
        messages[newConversationName] = [];
        updateConversationSelect();
        localStorage.setItem('messages', JSON.stringify(messages));

        document.getElementById('conversationSelect').value = newConversationName;
        updateChatBox();
      } else {
        console.error("Conversation already exists.");
      }
    }

    backgroundContainer.removeChild(inputContainer);
    document.body.removeChild(backgroundContainer);
  });

  cancelButton.addEventListener('click', function () {
    backgroundContainer.removeChild(inputContainer);
    document.body.removeChild(backgroundContainer);
  });
}


function toggleSettingsPanel() {
  var panel = document.getElementById('settingsPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function hideSettingsPanel() {
  document.getElementById('settingsPanel').style.display = 'none';
}

async function sendMessage() {
  if (document.getElementById('loadingSpinner').style.display === 'block') {
    return;
  }

  var input = document.getElementById("userInput");
  document.getElementById('loadingSpinner').style.display = 'block';
  var message = input.value.trim();

  var activeConversation = document.getElementById('conversationSelect').value;
  console.log(activeConversation)
  if (message) {
    const currentModel = model.replace('-free', '');
    appendMessage(activeConversation, 'user', message);
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const formattedDate = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    var systemMessageContent = `You are ChatGPT, a large language model trained by OpenAI. If you need to provide relevant links or other requests, please use the markup format
        Knowledge cutoff: 2021-09
        Current model: ${currentModel}
        Current time: ${formattedDate}
        Latex inline: x^2
        Latex block: e=mc^2`;

    if (messages[activeConversation] && messages[activeConversation].length > 0 && messages[activeConversation][0].role === 'system') {
      systemMessageContent = messages[activeConversation][0].content;
    } else if (systemPrompt) {
      systemMessageContent = systemPrompt;
    }

    if (messages[activeConversation]) {
      const systemMessageIndex = messages[activeConversation].findIndex(m => m.role === 'system');
      if (systemMessageIndex !== -1) {
        messages[activeConversation][systemMessageIndex].content = systemMessageContent;
      } else if (systemMessageIndex == -1 && model.includes("gpt")) {
        messages[activeConversation].unshift({ role: 'system', content: systemMessageContent });
      }
    }

    localStorage.setItem('messages', JSON.stringify(messages));

    let msg = message
    if (fileUrl && model !== "glm-4v") {
      msg = fileUrl + " " + message
    }
    const imgUrl = fileUrl

    messages[activeConversation].push({ role: 'user', content: msg });

    const Messages = messages[activeConversation]
    const body = model.includes('search')
      ? { model, search: useSearch, messages: Messages }
      : model.includes('glm-4v')
        ? { messages: Messages, imgUrl }
        : { model, messages: Messages };
    fileInput.value = "";
    fileUrl = ""
    const modelUrls = {
      'gpt-3.5': '/api/v1/freechat35/completions',
      'gemini-pro': '/api/v1/freegemini/completions',
      'claude': '/api/v1/freeclaude/completions',
      'claude-3-haiku': '/api/v1/freeclaude/completions',
      'search': '/api/v1/freesearch/completions',
      'ernie': '/api/v1/freeernie/completions',
      'kimi': '/api/v1/freekimi/completions',
      'stable-diffusion': '/api/v1/freestablediffusion/completions',
      'dall-e-3': '/api/v1/freedalle/completions',
      'gpt-4': '/api/v1/freechat40/completions',
      'glm-4v': '/api/v1/glm4v/completions',
      'glm-4': '/api/v1/glm4/completions'
    };
    let url;
    for (const modelName of Object.keys(modelUrls)) {
      if (model.includes(modelName)) {
        url = modelUrls[modelName];
        break;
      }
    }
    try {
      let timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 120000);
      });
      let response = await Promise.race([fetch(url, {
        method: "post",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": apikey
        },
        body: JSON.stringify(body)
      }), timeoutPromise]);

      if (!response.ok) {
        appendMessage("GPT", "bot", "与服务器通讯失败，请稍后尝试！");
        messages[activeConversation].pop()
        document.getElementById('loadingSpinner').style.display = 'none';
        return false
      }

      const res = await response.text();
      if (res && res.length > 0) {
        appendMessage("GPT", "bot", res);
        messages[activeConversation].push({ role: 'assistant', content: res });
      } else {
        appendMessage("GPT", "bot", "与服务器通讯失败，请稍后尝试！");
      }

    } catch (error) {
      console.error('An error occurred:', error);
      const errorMessage = error.message.includes('HTTP error') ? "C与服务器通讯失败，请稍后尝试！" : error.message;
      appendMessage("GPT", "bot", errorMessage);
      messages[activeConversation].pop()
    }
  }
  document.getElementById('loadingSpinner').style.display = 'none';
  localStorage.setItem('messages', JSON.stringify(messages));
  input.value = "";
  input.focus();
  console.log(useSearch)
  console.log(useTTS)
  console.log(messages)
}

function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

function appendMessage(sender, senderType, message) {
  var chatBox = document.getElementById("chatBox");
  var messageDiv = document.createElement("div");
  messageDiv.classList.add('message', senderType + '-message');
  var img = document.createElement("img");
  img.src = senderType === 'user' ? 'image/loli.jpg' : 'image/gpt.jpg';
  messageDiv.appendChild(img);
  var textDiv = document.createElement("div");
  var regex = /\((.*?)\)/;
  //console.log(message)
  var match = message.match(regex);
  var escapedMessage = escapeHtml(message);
  //var processedMessage = escapedMessage.replace(/\n/g, "<br>");
  var processedMessage = message.replace(/\n/g, "<br>");
  var displayImage = (model === 'stable-diffusion' || model === 'dall-e-3' || (model === 'gpt-4' && message.includes("flow-sign-sg.ciciai.com"))) && match && match[1];
  const processedMessages = message.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (match, text, href) {
    const matchIndex = text.indexOf(')');
    if (matchIndex !== -1) {
      text = text.slice(0, matchIndex);
    }

    return `[${text}](${href})`;
  });
  if (displayImage || (senderType == "user" && fileUrl)) {
    var imageTag = document.createElement("img");
    //console.log(fileUrl)
    if (senderType == "bot") {
      imageTag.src = match[1]
    } else {
      imageTag.src = fileUrl
    }
    imageTag.alt = "绘制的图片";
    imageTag.style.width = '100%';
    imageTag.style.height = 'auto';
    imageTag.style.objectFit = 'cover';
    imageTag.style.borderRadius = '0';
    var textElement = document.createElement("p");
    textElement.textContent = processedMessages;
    textElement.style.textAlign = "left";
    textDiv.appendChild(imageTag);
    textDiv.appendChild(textElement);
  } else {
    let renderedHtml
    if (senderType !== "user") {
      const converter = new showdown.Converter();
      const markdownText = processedMessages;
      const markdownWithClass = `<div class="markdown-content">${markdownText}</div>`;
      renderedHtml = converter.makeHtml(markdownWithClass);
      //renderedHtml = marked.parse(processedMessages);
    } else {
      renderedHtml = message
    }

    function removeDelimiters(latexExpression) {
      const delimiters = [
        { left: "$$", right: "$$" },
        { left: "\\\\left\\[", right: "\\\\right\\]" },
        { left: "$", right: "$" },
        { left: "\(", right: "\)" },
        { left: "begin{equation}", right: "end{equation}" },
        { left: "begin{align*}", right: "end{align*}" },
        { left: "begin{align}", right: "end{align}" },
        { left: "begin{aligned}", right: "end{aligned}" }
      ];

      let modifiedExpression = latexExpression;

      //delimiters.forEach(delimiter => {
      // const regex = new RegExp(`${delimiter.left}(.*?)${delimiter.right}`, 'gs');
      // console.log(regex)
      // modifiedExpression = modifiedExpression.replace(regex, '$1');
      // modifiedExpression = modifiedExpression.replace("$$", '')
      //});

      return modifiedExpression;
    }

    // if (removeDelimiters(message) !== message) {
    // renderedHtml = katex.renderToString(removeDelimiters(message), {
    // throwOnError: false
    // });
    //  } 

    //const decodedLatex = processedMessages.replace(/&#[0-9]+;/g, function(entity) {
    //return String.fromCharCode(entity.slice(2, -1));
    //});
    if (senderType == "user") {
      textDiv.textContent = renderedHtml;
    } else {
      textDiv.innerHTML = renderedHtml;
    }

    var copyButton = document.createElement("button");
    copyButton.innerHTML = "<i class='fa fa-copy'></i>";
    copyButton.classList.add("copy-button");
    copyButton.style.color = "black";
    copyButton.style.display = "inline";
    copyButton.addEventListener("click", function () {
      var tempTextArea = document.createElement("textarea");
      tempTextArea.value = message;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand("copy");
      document.body.removeChild(tempTextArea);
      //alert("消息已复制到剪贴板！");

    });
    textDiv.appendChild(copyButton);
  }
  messageDiv.appendChild(textDiv);
  chatBox.appendChild(messageDiv);
  const codeBlocks = document.querySelectorAll('.markdown-content pre code');
  //console.log(codeBlocks)
  codeBlocks.forEach((codeBlock) => {
    const language = codeBlock.className;
    codeBlock.parentNode.setAttribute('data-language', language);
  });
  if (senderType == "bot") {
    function truncateString(str) {
      if (str.length > 60) {
        return str.substring(0, 60) + "...";
      } else {
        return str;
      }
    }
    function calculateTime(message) {
      const baseTime = 2500;
      const maxLength = 10;
      const extraTimePerCharacter = 100;
      let length = message.length;
      if (length > maxLength) {
        length = maxLength;
      }
      let time = baseTime + (length - 1) * extraTimePerCharacter;
      return Math.min(time, 8500);
    }
    const time = calculateTime(message);
    const forbiddenStrings = ['dall-e-3', 'dall-e-2', 'stable-diffusion'];
    function ForbiddenString(inputString) {
      return !forbiddenStrings.some(forbiddenString => inputString.includes(forbiddenString));
    }

    if (useTTS && ForbiddenString(model)) {
      showMessage(truncateString(message), time, 11)
      checkConditionAndPlayAudio(message);
    } else if (!useTTS && ForbiddenString(model)) {
      showMessage(truncateString(message), time, 11)
    }
  }
  chatBox.scrollTop = chatBox.scrollHeight;

}

function updateChatBox() {
  var chatBox = document.getElementById("chatBox");
  var activeConversation = document.getElementById('conversationSelect').value; // Get the active conversation
  if (messages[activeConversation]) {
    chatBox.innerHTML = '';
    messages[activeConversation].forEach(m => {
      if (m.role !== 'system') {
        appendMessage('', m.role === 'user' ? m.role : (m.role === 'assistant' ? 'bot' : m.role), m.content);
      }
    });
  }
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showLoading() {
  document.getElementById('loadingSpinner').style.display = 'block';
}

function hideLoading() {
  document.getElementById('loadingSpinner').style.display = 'none';
}

function showMessage(text, timeout, priority) {
  if (text && !sessionStorage.getItem("waifu-text") && sessionStorage.getItem("waifu-text") <= priority) {
    const tips = document.getElementById("waifu-tips");
    if (tips) {
      tips.innerHTML = text;
      tips.classList.add("waifu-tips-active");
      messageTimer = setTimeout(() => {
        sessionStorage.removeItem("waifu-text");
        tips.classList.remove("waifu-tips-active");
      }, timeout);
    }
  }
}

async function checkConditionAndPlayAudio(message) {
  try {
    const response = await fetch("/api/v1/tts", {
      method: "post",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({ message })
    });
    const audioUrl = await response.text()
    const audioElement = new Audio(audioUrl);
    audioElement.play()
  } catch {
    console.error(error)
  }
}

async function uploadFile(file) {
  const url = "https://api.gptgod.online/v1/file";
  const formData = new FormData();
  formData.append('file', file);
  const secret = "sk-3KRqH2VJmfFRcFlztCLL1DSGqhz6jTQC3LTeuDjnWTW3BMhh";

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`
      },
      body: formData
    });

    const responseData = await response.json();
    return responseData.data.url;
  } catch (error) {
    return null
  }
}

async function handleFileChange(event) {
  const file = event.target.files[0];
  fileUrl = await uploadFile(file)
  //console.log("Selected file:", fileUrl);
  document.getElementById('successMessage').style.display = 'block';
  setTimeout(() => {
    document.getElementById('successMessage').style.display = 'none';
  }, 3000);
}
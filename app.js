// DOM 元素
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const overlay = document.getElementById('overlay');
const newChatBtn = document.getElementById('newChatBtn');
const newChatMobile = document.getElementById('newChatMobile');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const saveSettings = document.getElementById('saveSettings');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messages');
const welcomeScreen = document.getElementById('welcomeScreen');
const chatContainer = document.getElementById('chatContainer');
const chatHistory = document.getElementById('chatHistory');
const clearCacheBtn = document.getElementById('clearCacheBtn');
const promptBtns = document.querySelectorAll('.prompt-btn');

// 状态管理
let conversations = JSON.parse(localStorage.getItem('conversations')) || [];
let currentConversationId = null;
let isLoading = false;

// 机器人配置
const botConfigs = {
    professional: {
        name: '专业问答模型',
        avatar: 'touxiang2.png',
        appCode: '5Zf8qEcq',
        theme: 'blue'
    },
    xiaomei: {
        name: '巩狗媳妇',
        avatar: 'touxiang.jpg',
        appCode: 'H8Cd00WB',
        theme: 'pink'
    }
};

// 当前机器人（默认专业问答模型）
let currentBot = localStorage.getItem('currentBot') || 'professional';

// 配置（固定值）
const config = {
    apiKey: 'Link_EyrdPJTHLBjpEhRuuYptcNA3D0m1bGVe7CtTtubN4r',
    appCode: botConfigs[currentBot].appCode,
    model: ''
};

// 初始化
function init() {
    loadSettings();
    setupBotSelector();
    applyBotTheme();
    renderChatHistory();
    setupEventListeners();
    autoResizeTextarea();
}

// 设置事件监听
function setupEventListeners() {
    // 侧边栏切换
    menuBtn.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', closeSidebar);

    // 新对话
    newChatBtn.addEventListener('click', startNewChat);
    newChatMobile.addEventListener('click', startNewChat);

    // 清除缓存
    clearCacheBtn.addEventListener('click', clearCache);

    // 设置弹窗（已禁用，使用固定配置）
    // settingsBtn.addEventListener('click', openSettings);
    // closeSettings.addEventListener('click', closeSettingsModal);
    // saveSettings.addEventListener('click', saveSettingsHandler);

    // 发送消息
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('input', handleInputChange);
    messageInput.addEventListener('keydown', handleKeyDown);

    // 快捷提示
    promptBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.dataset.prompt;
            messageInput.value = prompt;
            handleInputChange();
            sendMessage();
        });
    });
}

// 设置机器人选择器
function setupBotSelector() {
    const botOptions = document.querySelectorAll('.bot-option');
    botOptions.forEach(option => {
        option.addEventListener('click', () => {
            const botType = option.dataset.bot;
            switchBot(botType);
        });
    });
    
    // 设置当前选中的机器人
    updateBotSelector();
}

// 切换机器人
function switchBot(botType) {
    if (botType === currentBot) return;
    
    currentBot = botType;
    localStorage.setItem('currentBot', botType);
    
    // 更新配置
    config.appCode = botConfigs[botType].appCode;
    
    // 应用主题
    applyBotTheme();
    
    // 更新选择器状态
    updateBotSelector();
    
    // 更新欢迎页面
    updateWelcomeScreen();
}

// 应用机器人主题
function applyBotTheme() {
    const theme = botConfigs[currentBot].theme;
    document.body.className = `theme-${theme}`;
}

// 更新机器人选择器状态
function updateBotSelector() {
    const botOptions = document.querySelectorAll('.bot-option');
    botOptions.forEach(option => {
        if (option.dataset.bot === currentBot) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// 更新欢迎页面
function updateWelcomeScreen() {
    const bot = botConfigs[currentBot];
    const welcomeAvatar = document.getElementById('welcomeAvatar');
    const welcomeTitle = document.getElementById('welcomeTitle');
    const headerTitle = document.querySelector('.header-title');
    const logo = document.querySelector('.logo span');
    
    if (welcomeAvatar) {
        welcomeAvatar.src = bot.avatar;
    }
    if (welcomeTitle) {
        welcomeTitle.textContent = `你好，我是${bot.name}`;
    }
    if (headerTitle) {
        headerTitle.textContent = bot.name;
    }
    if (logo) {
        logo.textContent = bot.name;
    }
}

// 侧边栏操作
function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// 设置弹窗操作
function openSettings() {
    settingsModal.classList.add('active');
    document.getElementById('apiKey').value = config.apiKey;
    document.getElementById('appCode').value = config.appCode;
    document.getElementById('modelSelect').value = config.model;
}

function closeSettingsModal() {
    settingsModal.classList.remove('active');
}

function loadSettings() {
    // 使用固定配置，不从 localStorage 读取
}

function saveSettingsHandler() {
    config.apiKey = document.getElementById('apiKey').value.trim();
    config.appCode = document.getElementById('appCode').value.trim();
    config.model = document.getElementById('modelSelect').value;

    localStorage.setItem('apiKey', config.apiKey);
    localStorage.setItem('appCode', config.appCode);
    localStorage.setItem('model', config.model);

    closeSettingsModal();
    showToast('设置已保存');
}

// 对话管理
function startNewChat() {
    currentConversationId = null;
    messagesContainer.innerHTML = '';
    welcomeScreen.classList.remove('hidden');
    updateWelcomeScreen();
    closeSidebar();
    updateActiveHistory();
}

// 清除缓存
function clearCache() {
    if (confirm('确定要清除所有历史数据吗？')) {
        localStorage.clear();
        location.reload();
    }
}

function createConversation(firstMessage) {
    const id = Date.now().toString();
    const conversation = {
        id,
        title: firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : ''),
        messages: [],
        createdAt: new Date().toISOString()
    };
    conversations.unshift(conversation);
    saveConversations();
    renderChatHistory();
    return id;
}

function saveConversations() {
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

function renderChatHistory() {
    chatHistory.innerHTML = conversations.map(conv => `
        <div class="history-item ${conv.id === currentConversationId ? 'active' : ''}" 
             data-id="${conv.id}">
            ${conv.title}
        </div>
    `).join('');

    // 添加点击事件
    chatHistory.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => loadConversation(item.dataset.id));
    });
}

function loadConversation(id) {
    const conversation = conversations.find(c => c.id === id);
    if (!conversation) return;

    currentConversationId = id;
    welcomeScreen.classList.add('hidden');
    messagesContainer.innerHTML = '';

    conversation.messages.forEach(msg => {
        appendMessage(msg.role, msg.content, false);
    });

    updateActiveHistory();
    closeSidebar();
    scrollToBottom();
}

function updateActiveHistory() {
    chatHistory.querySelectorAll('.history-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === currentConversationId);
    });
}

// 消息处理
function handleInputChange() {
    const hasContent = messageInput.value.trim().length > 0;
    sendBtn.disabled = !hasContent || isLoading;
    autoResizeTextarea();
}

function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) {
            sendMessage();
        }
    }
}

function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
}

async function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || isLoading) return;

    if (!config.apiKey) {
        showToast('请先在设置中配置 API Key');
        openSettings();
        return;
    }

    // 隐藏欢迎页
    welcomeScreen.classList.add('hidden');

    // 创建或获取对话
    if (!currentConversationId) {
        currentConversationId = createConversation(content);
    }

    // 添加用户消息
    appendMessage('user', content);
    addMessageToConversation('user', content);

    // 清空输入
    messageInput.value = '';
    handleInputChange();

    // 显示加载状态
    isLoading = true;
    sendBtn.disabled = true;
    const loadingEl = showTypingIndicator();

    try {
        const response = await callLinkAI(content);
        loadingEl.remove();
        appendMessage('assistant', response.text, true, response.audioUrl);
        addMessageToConversation('assistant', response.text);
        
        // 自动播放语音
        if (response.audioUrl) {
            playAudio(response.audioUrl);
        }
    } catch (error) {
        loadingEl.remove();
        appendMessage('assistant', `抱歉，发生了错误：${error.message}`);
    } finally {
        isLoading = false;
        handleInputChange();
    }
}

function appendMessage(role, content, animate = true, audioUrl = null) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;
    
    const formattedContent = formatMessage(content);
    const bot = botConfigs[currentBot];
    const avatarHtml = role === 'user' 
        ? '<div class="avatar">我</div>' 
        : `<img class="avatar" src="${bot.avatar}" alt="助手">`;
    
    // 获取当前时间
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    
    // AI消息显示时间和播放按钮
    const messageHeader = role === 'assistant' 
        ? `<div class="message-header">
            <span class="message-time">${timeStr}</span>
            <button class="audio-btn" onclick="playAudio('${audioUrl || ''}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
            </button>
           </div>` 
        : '';

    // 用户消息直接显示，AI消息用wrapper包裹
    if (role === 'user') {
        messageEl.innerHTML = `
            ${avatarHtml}
            <div class="message-content">${formattedContent}</div>
        `;
    } else {
        messageEl.innerHTML = `
            ${avatarHtml}
            <div class="message-wrapper">
                ${messageHeader}
                <div class="message-content">${formattedContent}</div>
            </div>
        `;
    }

    if (!animate) {
        messageEl.style.animation = 'none';
    }

    messagesContainer.appendChild(messageEl);
    scrollToBottom();
}

// 播放语音
let currentAudio = null;
function playAudio(url) {
    // 停止当前播放
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    currentAudio = new Audio(url);
    currentAudio.play().catch(err => {
        console.error('播放语音失败:', err);
        showToast('语音播放失败');
    });
}

function formatMessage(content) {
    // 简单的代码块处理
    content = content.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    // 行内代码
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    // 换行
    content = content.replace(/\n/g, '<br>');
    return content;
}

function addMessageToConversation(role, content) {
    const conversation = conversations.find(c => c.id === currentConversationId);
    if (conversation) {
        conversation.messages.push({ role, content });
        saveConversations();
    }
}

function showTypingIndicator() {
    const bot = botConfigs[currentBot];
    const el = document.createElement('div');
    el.className = 'message assistant';
    el.innerHTML = `
        <img class="avatar" src="${bot.avatar}" alt="助手">
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(el);
    scrollToBottom();
    return el;
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// LinkAI API 调用
async function callLinkAI(userMessage) {
    const conversation = conversations.find(c => c.id === currentConversationId);
    const messages = conversation ? conversation.messages.map(m => ({
        role: m.role,
        content: m.content
    })) : [];
    
    // 添加当前消息
    messages.push({ role: 'user', content: userMessage });

    const body = { messages };
    
    if (config.appCode) {
        body.app_code = config.appCode;
    }
    if (config.model) {
        body.model = config.model;
    }

    const response = await fetch('https://api.link-ai.tech/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `请求失败 (${response.status})`);
    }

    const data = await response.json();
    const textContent = data.choices[0].message.content;
    
    // 检查是否有语音URL（如果LinkAI返回的话）
    const audioUrl = data.choices[0].message.audio_url || 
                     data.choices[0].audio_url || 
                     data.audio_url ||
                     (data.choices[0].message.audio && data.choices[0].message.audio.url) ||
                     null;
    
    return { text: textContent, audioUrl };
}

// Toast 提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 添加 fadeOut 动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// 启动应用
init();

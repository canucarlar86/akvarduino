// Constants and State
const state = {
    temp: 24.5,
    hum: 60,
    tds: 250,
    flow: 8.5,
    oxygen: 7.4,
    lightOn: false,
    lightMode: 'manual',
    ph: 7.0,
    co2: 25,
    ec: 500,
    floodDetected: false,
    pumpActive: true,
    filterOn: false,
    lastFilterClean: null,
    coolingMode: 'auto',
    coolingOn: false,
    airOn: false,
    activeSensorAlarms: []
};

const ADMIN_CONTENT_KEY = 'akvardinioAdminContent';
const CUSTOM_CARDS_KEY = 'akvardinioCustomCards';
const DASHBOARD_CARD_STATE_KEY = 'akvardinioDashboardCardState';

function readJsonStorage(key, fallback) {
    try {
        const parsed = JSON.parse(localStorage.getItem(key) || 'null');
        return parsed ?? fallback;
    } catch (error) {
        return fallback;
    }
}

function writeJsonStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function slugifyCardKey(value = '') {
    return String(value)
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 36);
}

function readCustomCards() {
    const cards = readJsonStorage(CUSTOM_CARDS_KEY, []);
    return Array.isArray(cards) ? cards : [];
}

function getDashboardCardState() {
    const state = readJsonStorage(DASHBOARD_CARD_STATE_KEY, {});
    return {
        hidden: Array.isArray(state.hidden) ? state.hidden : [],
        deleted: Array.isArray(state.deleted) ? state.deleted : []
    };
}

function saveDashboardCardState(state) {
    writeJsonStorage(DASHBOARD_CARD_STATE_KEY, {
        hidden: [...new Set(state.hidden || [])],
        deleted: [...new Set(state.deleted || [])]
    });
}

function getDashboardCardMeta() {
    return dashboardPermissionCards.map(card => ({
        id: card.id,
        label: card.label,
        custom: card.id.startsWith('card-') && Boolean(readCustomCards().find(item => `card-${item.key}` === card.id))
    }));
}

function isDashboardCardDeleted(cardId) {
    return getDashboardCardState().deleted.includes(cardId);
}

function applyDashboardCardState() {
    const cardState = getDashboardCardState();
    getDashboardCardMeta().forEach(card => {
        const el = document.getElementById(card.id);
        if (el) {
            const inactive = cardState.deleted.includes(card.id) || cardState.hidden.includes(card.id);
            el.classList.toggle('admin-card-hidden', inactive);
        }

        const key = card.id.replace(/^card-/, '');
        document.querySelector(`.chart-card[data-chart="${key}"]`)?.classList.toggle('admin-card-hidden', cardState.deleted.includes(card.id));
        document.getElementById(`settings-${key}`)?.classList.toggle('admin-card-hidden', cardState.deleted.includes(card.id));
    });

    if (typeof refreshDashboardMinimizedDock === 'function') {
        refreshDashboardMinimizedDock();
    }
}

const dashboardPermissionCards = [
    { id: 'card-sensor-overview', label: 'Sensör Özeti' },
    { id: 'card-sensor-overview-wide', label: 'Sensör Özeti - Geniş Plan' },
    { id: 'card-sensor-overview-strip', label: 'Sensör Özeti - Şerit Plan' },
    { id: 'card-temp', label: 'Su Isısı' },
    { id: 'card-hum', label: 'Ortam Nemi' },
    { id: 'card-flow', label: 'Su Akış Hızı' },
    { id: 'card-oxygen', label: 'Çözünmüş Oksijen' },
    { id: 'card-tds', label: 'Su Kalitesi (TDS)' },
    { id: 'card-light', label: 'Aydınlatma' },
    { id: 'card-feed-simple', label: 'Yemleme Durumu' },
    { id: 'card-ph', label: 'pH Değeri' },
    { id: 'card-co2', label: 'CO2 Seviyesi' },
    { id: 'card-ec', label: 'EC Değeri' },
    { id: 'card-alarm', label: 'Sistem Durumu' },
    { id: 'card-filter', label: 'Filtre Motoru' },
    { id: 'card-cooling', label: 'Soğutma Fanı' },
    { id: 'card-air', label: 'Hava Motoru' }
];

readCustomCards().filter(Boolean).forEach(card => {
    const id = `card-${card.key}`;
    if (card?.key && !dashboardPermissionCards.some(item => item.id === id)) {
        dashboardPermissionCards.push({ id, label: card.title || card.key });
    }
});

const defaultAdminUser = {
    username: 'can',
    password: '1234',
    isAdmin: true,
    permissions: {
        cards: dashboardPermissionCards.map(card => card.id),
        camera: true
    }
};

let currentUser = null;

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// DOM Elements
const elTime = document.getElementById('currentTime');
const elTemp = document.getElementById('val-temp');
const elHum = document.getElementById('val-hum');
const elTds = document.getElementById('val-tds');
const elFlow = document.getElementById('val-flow');
const elOxygen = document.getElementById('val-oxygen');
const elLightText = document.getElementById('val-light');
const elLightSchedule = document.getElementById('val-light-schedule');
const btnLight = document.getElementById('btn-light');
const btnLightAuto = document.getElementById('btn-light-auto');
const elPh = document.getElementById('val-ph');
const elAlarm = document.getElementById('val-alarm');
const elAlarmTrend = document.getElementById('alarm-trend');
const cardAlarm = document.getElementById('card-alarm');
const cardPh = document.getElementById('card-ph');
const elFilterText = document.getElementById('val-filter');
const btnFilter = document.getElementById('btn-filter');
const elFilterClean = document.getElementById('val-filter-clean');
const cardFilter = document.getElementById('card-filter');
const elCoolingText = document.getElementById('val-cooling');
const btnCooling = document.getElementById('btn-cooling');
const cardCooling = document.getElementById('card-cooling');
const elAirText = document.getElementById('val-air');
const btnAir = document.getElementById('btn-air');
const cardAir = document.getElementById('card-air');
const loginOverlay = document.getElementById('loginOverlay');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('login-error');
const loginRemember = document.getElementById('login-remember');
const activeUserLabel = document.getElementById('active-user-label');
const btnLogout = document.getElementById('btn-logout');

// Alarm Loglama Sistemi
let alarmLogs = [];
try {
    const saved = localStorage.getItem('akvardinioLogs');
    if (saved && saved !== 'undefined') {
        alarmLogs = JSON.parse(saved);
    }
} catch(e) {
    console.warn('Geçmiş loglar okunamadı, temizleniyor...');
    localStorage.removeItem('akvardinioLogs');
}
if (!Array.isArray(alarmLogs)) alarmLogs = [];

const lastSensorStates = {};
const whatsappNotificationCooldown = {};
const telegramNotificationCooldown = {};

function getWhatsAppSettings() {
    try {
        return JSON.parse(localStorage.getItem('akvardinioWhatsAppSettings') || '{}');
    } catch (error) {
        return {};
    }
}

function saveWhatsAppSettings() {
    const settings = {
        enabled: Boolean(document.getElementById('set-whatsapp-enabled')?.checked),
        phone: document.getElementById('set-whatsapp-phone')?.value.trim() || '',
        webhook: document.getElementById('set-whatsapp-webhook')?.value.trim() || ''
    };
    localStorage.setItem('akvardinioWhatsAppSettings', JSON.stringify(settings));
    return settings;
}

function loadWhatsAppSettings() {
    const settings = getWhatsAppSettings();
    const enabledInput = document.getElementById('set-whatsapp-enabled');
    const phoneInput = document.getElementById('set-whatsapp-phone');
    const webhookInput = document.getElementById('set-whatsapp-webhook');
    if (enabledInput) enabledInput.checked = Boolean(settings.enabled);
    if (phoneInput) phoneInput.value = settings.phone || '';
    if (webhookInput) webhookInput.value = settings.webhook || '';
}

function initWhatsAppTestButton() {
    const testBtn = document.getElementById('btn-test-whatsapp');
    if (!testBtn) return;

    testBtn.addEventListener('click', async () => {
        const settings = saveWhatsAppSettings();
        if (!settings.enabled || !normalizeWhatsAppPhone(settings.phone)) {
            testBtn.textContent = 'Numara / aktiflik eksik';
            testBtn.style.background = 'var(--accent-red)';
            testBtn.style.color = '#fff';
            setTimeout(() => {
                testBtn.textContent = 'Test Alarmı Gönder';
                testBtn.style.background = '';
                testBtn.style.color = '';
            }, 1800);
            return;
        }

        addLogEntry('WhatsApp Test Alarmı', 'Test Bildirimi', 'warning', 'Test');
        testBtn.textContent = 'Test Alarmı Oluşturuldu';
        testBtn.style.background = '#10b981';
        testBtn.style.color = '#fff';
        setTimeout(() => {
            testBtn.textContent = 'Test Alarmı Gönder';
            testBtn.style.background = '';
            testBtn.style.color = '';
        }, 1800);
    });
}

function initTelegramTestButton() {
    const testBtn = document.getElementById('btn-test-telegram');
    if (!testBtn) return;

    testBtn.addEventListener('click', async () => {
        const settings = saveTelegramSettings();
        if (!settings.enabled || !settings.token || !settings.chatId) {
            testBtn.textContent = 'Token / Chat ID eksik';
            testBtn.style.background = 'var(--accent-red)';
            testBtn.style.color = '#fff';
            setTimeout(() => {
                testBtn.textContent = 'Telegram Test Alarmı Gönder';
                testBtn.style.background = '';
                testBtn.style.color = '';
            }, 1800);
            return;
        }

        testBtn.disabled = true;
        testBtn.textContent = 'Telegram deneniyor...';
        testBtn.style.background = '';
        testBtn.style.color = '';

        const log = addLogEntry('Telegram Test Alarmı', 'Test Bildirimi', 'warning', 'Test', { notify: false });
        const result = await notifyTelegramAlarm(log, { ignoreCooldown: true });

        if (result?.ok && result?.fallback) {
            testBtn.textContent = 'Yedek gönderim denendi';
            testBtn.style.background = '#f59e0b';
        } else if (result?.ok) {
            testBtn.textContent = 'Telegram gönderildi';
            testBtn.style.background = '#10b981';
        } else {
            testBtn.textContent = result?.description || 'Telegram hatası';
            testBtn.style.background = 'var(--accent-red)';
        }
        testBtn.style.color = '#fff';
        setTimeout(() => {
            testBtn.textContent = 'Telegram Test Alarmı Gönder';
            testBtn.style.background = '';
            testBtn.style.color = '';
            testBtn.disabled = false;
        }, 2600);
    });
}

function normalizeWhatsAppPhone(phone) {
    return String(phone || '').replace(/[^\d]/g, '');
}

function buildAlarmMessage(log) {
    return [
        'Akvardinio Alarm Bildirimi',
        `Sensor: ${log.sensor}`,
        `Durum: ${log.status}`,
        `Deger: ${log.value}`,
        `Tarih: ${log.date} ${log.time}`
    ].join('\n');
}

function getTelegramSettings() {
    try {
        return JSON.parse(localStorage.getItem('akvardinioTelegramSettings') || '{}');
    } catch (error) {
        return {};
    }
}

function saveTelegramSettings() {
    const settings = {
        enabled: Boolean(document.getElementById('set-telegram-enabled')?.checked),
        token: document.getElementById('set-telegram-token')?.value.trim() || '',
        chatId: document.getElementById('set-telegram-chat-id')?.value.trim() || ''
    };
    localStorage.setItem('akvardinioTelegramSettings', JSON.stringify(settings));
    return settings;
}

function loadTelegramSettings() {
    const settings = getTelegramSettings();
    const enabledInput = document.getElementById('set-telegram-enabled');
    const tokenInput = document.getElementById('set-telegram-token');
    const chatInput = document.getElementById('set-telegram-chat-id');
    if (enabledInput) enabledInput.checked = Boolean(settings.enabled);
    if (tokenInput) tokenInput.value = settings.token || '';
    if (chatInput) chatInput.value = settings.chatId || '';
}

function sendTelegramByBeacon(endpoint, body) {
    const url = `${endpoint}?${body.toString()}`;

    if (navigator.sendBeacon) {
        const sent = navigator.sendBeacon(url);
        if (sent) return Promise.resolve({ ok: true, fallback: true });
    }

    return new Promise((resolve) => {
        const image = new Image();
        const finish = () => resolve({ ok: true, fallback: true });
        image.onload = finish;
        image.onerror = finish;
        image.src = url;
        setTimeout(finish, 1200);
    });
}

async function sendTelegramMessage(settings, message) {
    const endpoint = `https://api.telegram.org/bot${settings.token}/sendMessage`;
    const body = new URLSearchParams({
        chat_id: settings.chatId,
        text: message,
        disable_web_page_preview: 'true'
    });

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.ok === false) {
            return {
                ok: false,
                description: data.description || `Telegram HTTP ${response.status}`
            };
        }

        return { ok: true };
    } catch (error) {
        console.warn('Telegram bildirimi fetch ile gönderilemedi, yedek yol deneniyor:', error);
        return sendTelegramByBeacon(endpoint, body);
    }
}

async function notifyTelegramAlarm(log, options = {}) {
    if (!['warning', 'danger'].includes(log.type)) return { ok: false, description: 'Bildirim seviyesi uygun degil' };

    const settings = getTelegramSettings();
    if (!settings.enabled || !settings.token || !settings.chatId) {
        return { ok: false, description: 'Telegram ayarlari eksik' };
    }

    const cooldownKey = `${log.sensor}-${log.status}`;
    const now = Date.now();
    if (!options.ignoreCooldown && telegramNotificationCooldown[cooldownKey] && now - telegramNotificationCooldown[cooldownKey] < 60000) {
        return { ok: false, description: 'Bildirim bekleme suresinde' };
    }
    telegramNotificationCooldown[cooldownKey] = now;

    return sendTelegramMessage(settings, buildAlarmMessage(log));
}

function showWhatsAppFallback(url) {
    let fallback = document.getElementById('whatsapp-notification-fallback');
    if (!fallback) {
        fallback = document.createElement('div');
        fallback.id = 'whatsapp-notification-fallback';
        fallback.className = 'whatsapp-notification-fallback glass-panel';
        fallback.innerHTML = `
            <span>WhatsApp bildirimi hazır.</span>
            <a id="whatsapp-notification-link" href="#" target="_blank" rel="noopener noreferrer">Gönder</a>
            <button type="button" id="whatsapp-notification-close"><i class="ph ph-x"></i></button>
        `;
        document.body.appendChild(fallback);
        fallback.querySelector('#whatsapp-notification-close').addEventListener('click', () => {
            fallback.classList.remove('active');
        });
    }
    fallback.querySelector('#whatsapp-notification-link').href = url;
    fallback.classList.add('active');
}

async function notifyAlarm(log) {
    if (!['warning', 'danger'].includes(log.type)) return;

    const settings = getWhatsAppSettings();
    if (!settings.enabled) return;

    const cooldownKey = `${log.sensor}-${log.status}`;
    const now = Date.now();
    if (whatsappNotificationCooldown[cooldownKey] && now - whatsappNotificationCooldown[cooldownKey] < 60000) {
        return;
    }
    whatsappNotificationCooldown[cooldownKey] = now;

    const message = buildAlarmMessage(log);
    const phone = normalizeWhatsAppPhone(settings.phone);

    if (settings.webhook) {
        try {
            await fetch(settings.webhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source: 'Akvardinio', message, alarm: log })
            });
        } catch (error) {
            console.warn('WhatsApp webhook bildirimi gönderilemedi:', error);
        }
    }

    if (phone) {
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        const opened = window.open(url, '_blank', 'noopener,noreferrer');
        if (!opened) showWhatsAppFallback(url);
    }
}

function renderAlarmLogs() {
    const elAlarmLogTable = document.getElementById('alarm-log-table');
    const elEmptyLogMsg = document.getElementById('empty-log-msg');
    if (!elAlarmLogTable) return;
    elAlarmLogTable.innerHTML = '';
    
    if (alarmLogs.length === 0) {
        elAlarmLogTable.parentElement.style.display = 'none';
        if (elEmptyLogMsg) elEmptyLogMsg.style.display = 'block';
        return;
    }
    
    elAlarmLogTable.parentElement.style.display = 'table';
    if (elEmptyLogMsg) elEmptyLogMsg.style.display = 'none';
    
    const reversedLogs = [...alarmLogs].reverse();
    
    reversedLogs.forEach(log => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        
        let statusHtml = '';
        if (log.type === 'danger') statusHtml = `<span style="color: var(--accent-red); font-weight: 500;"><i class="ph ph-warning-octagon"></i> ${log.status}</span>`;
        else if (log.type === 'warning') statusHtml = `<span style="color: var(--accent-yellow); font-weight: 500;"><i class="ph ph-warning"></i> ${log.status}</span>`;
        else if (log.type === 'safe') statusHtml = `<span style="color: var(--accent-green); font-weight: 500;"><i class="ph ph-check-circle"></i> ${log.status}</span>`;
        
        tr.innerHTML = `
            <td style="padding: 16px;">${log.date || '--'}</td>
            <td style="padding: 16px;">${log.time}</td>
            <td style="padding: 16px; font-weight: 500;">${log.sensor}</td>
            <td style="padding: 16px;">${statusHtml}</td>
            <td style="padding: 16px;">${log.value}</td>
        `;
        elAlarmLogTable.appendChild(tr);
    });
}

function addLogEntry(sensor, status, type, value, options = {}) {
    const now = new Date();
    const date = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const log = { date, time, sensor, status, type, value };
    alarmLogs.push(log);
    if (alarmLogs.length > 50) alarmLogs.shift(); // En fazla 50 log tut
    localStorage.setItem('akvardinioLogs', JSON.stringify(alarmLogs));
    renderAlarmLogs();
    if (options.notify !== false) {
        notifyAlarm(log);
        notifyTelegramAlarm(log);
    }
    return log;
}

function generateDummyLogs() {
    // Sadece tablo tamamen boşsa sahte logları oluştur
    if (alarmLogs.length > 0) return;
    
    alarmLogs = []; // Mevcut spam simülasyon loglarını temizle
    
    const sensors = ['Su Isısı', 'pH Seviyesi', 'Su Kalitesi', 'Ortam Nemi', 'CO2 Seviyesi'];
    const issues = ['Yüksek Seviye İkazı', 'Düşük Seviye İkazı'];
    const values = ['28.5 °C', '6.0', '410 ppm', '85 %', '45 ppm'];
    
    const now = new Date();
    
    for (let i = 10; i >= 1; i--) {
        const logsPerDay = 2;
        for (let j = 0; j < logsPerDay; j++) {
            const pastDate = new Date(now);
            pastDate.setDate(now.getDate() - i);
            pastDate.setHours(Math.floor(Math.random() * 24));
            pastDate.setMinutes(Math.floor(Math.random() * 60));
            
            const dateStr = pastDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeStr = pastDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            const sIdx = Math.floor(Math.random() * 5);
            
            alarmLogs.push({
                date: dateStr,
                time: timeStr,
                sensor: sensors[sIdx],
                status: issues[Math.floor(Math.random() * 2)], 
                type: 'warning',
                value: values[sIdx]
            });
            
            const resolvedDate = new Date(pastDate.getTime() + 30 * 60000); // 30 dk sonra düzeldi
            const rTimeStr = resolvedDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            alarmLogs.push({
                date: dateStr,
                time: rTimeStr,
                sensor: sensors[sIdx],
                status: 'Normale Döndü',
                type: 'safe',
                value: 'Normal'
            });
        }
    }
    
    // Taşkın Senaryosu (2 gün önce)
    const floodDate = new Date(now);
    floodDate.setDate(now.getDate() - 2);
    floodDate.setHours(14, 30, 0);
    alarmLogs.push({
        date: floodDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: floodDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        sensor: 'Sistem Taşkın Sensörü',
        status: 'Su Taşması Algılandı!',
        type: 'danger',
        value: 'Kritik'
    });
    
    floodDate.setMinutes(floodDate.getMinutes() + 15);
    alarmLogs.push({
        date: floodDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: floodDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        sensor: 'Sistem Taşkın Sensörü',
        status: 'Sorun Giderildi',
        type: 'safe',
        value: 'Normal'
    });
    
    localStorage.setItem('akvardinioLogs', JSON.stringify(alarmLogs));
    localStorage.setItem('dummyDataGenerated', 'true');
    renderAlarmLogs(); // Anında ekrana bas
}

// Uygulama yüklenirken sahte logları oluştur (sadece boşsa)
generateDummyLogs();

// Sayfa yüklendiğinde mevcut veya yeni oluşturulmuş logları her halükarda ekrana bas
renderAlarmLogs();

const btnClearLogs = document.getElementById('btn-clear-logs');
if (btnClearLogs) {
    btnClearLogs.addEventListener('click', () => {
        alarmLogs = [];
        localStorage.removeItem('akvardinioLogs');
        renderAlarmLogs();
    });
}

// 0. Navigation View Switching
const navItems = document.querySelectorAll('.nav-item[data-view]');
const viewSections = document.querySelectorAll('.view-section');

function getUsers() {
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('akvardinioUsers') || '[]');
    } catch (error) {
        users = [];
    }

    const adminExists = users.some(user => user.username === defaultAdminUser.username);
    if (!adminExists) {
        users.unshift(defaultAdminUser);
        saveUsers(users);
    } else {
        users = users.map(user => user.username === defaultAdminUser.username
            ? { ...user, ...defaultAdminUser }
            : user);
        saveUsers(users);
    }

    return users;
}

function saveUsers(users) {
    localStorage.setItem('akvardinioUsers', JSON.stringify(users));
}

function setSession(user) {
    currentUser = user;
    sessionStorage.setItem('akvardinioCurrentUser', user.username);
    document.body.classList.remove('auth-locked');
    if (loginOverlay) loginOverlay.classList.add('hidden');
    if (activeUserLabel) activeUserLabel.textContent = user.username;
    applyUserPermissions();
    if (typeof initDashboardCardMinimize === 'function') initDashboardCardMinimize();
}

function clearSession() {
    currentUser = null;
    sessionStorage.removeItem('akvardinioCurrentUser');
    document.body.classList.add('auth-locked');
    if (loginOverlay) loginOverlay.classList.remove('hidden');
    if (activeUserLabel) activeUserLabel.textContent = '--';
    document.getElementById('dashboard-minimized-dock')?.replaceChildren();
}

function restoreSession() {
    const username = sessionStorage.getItem('akvardinioCurrentUser');
    const user = getUsers().find(item => item.username === username);
    if (user) {
        setSession(user);
    } else {
        clearSession();
    }
}

function userCanViewCard(cardId) {
    if (!currentUser) return false;
    if (currentUser.isAdmin) return true;
    return currentUser.permissions?.cards?.includes(cardId);
}

function userCanViewCamera() {
    if (!currentUser) return false;
    if (currentUser.isAdmin) return true;
    return Boolean(currentUser.permissions?.camera);
}

function isCanUser() {
    return currentUser?.username === defaultAdminUser.username;
}

function applyUserPermissions() {
    if (!currentUser) return;

    document.querySelectorAll('.admin-only').forEach(el => {
        el.classList.toggle('permission-hidden', !currentUser.isAdmin);
    });

    document.querySelectorAll('.can-only').forEach(el => {
        el.classList.toggle('permission-hidden', !isCanUser());
    });

    dashboardPermissionCards.forEach(card => {
        const el = document.getElementById(card.id);
        if (el) el.classList.toggle('permission-hidden', !userCanViewCard(card.id));
    });

    const cameraCard = document.getElementById('card-camera');
    if (cameraCard) cameraCard.classList.toggle('camera-denied', !userCanViewCamera());

    applyDashboardCardState();

    if (!currentUser.isAdmin && document.getElementById('users-view')?.classList.contains('active')) {
        showView('dashboard-view');
    }

    if (!isCanUser() && document.getElementById('admin-panel-view')?.classList.contains('active')) {
        showView('dashboard-view');
    }
}

function showView(targetView) {
    if (targetView === 'users-view' && (!currentUser || !currentUser.isAdmin)) {
        targetView = 'dashboard-view';
    }
    if (targetView === 'admin-panel-view' && !isCanUser()) {
        targetView = 'dashboard-view';
    }

    viewSections.forEach(view => {
        if (view.id === targetView) {
            view.style.display = 'block';
            view.classList.add('active');
        } else {
            view.style.display = 'none';
            view.classList.remove('active');
        }
    });

    navItems.forEach(nav => {
        nav.classList.toggle('active', nav.getAttribute('data-view') === targetView);
    });

    const minimizedDock = document.getElementById('dashboard-minimized-dock');
    minimizedDock?.classList.toggle('dashboard-dock-hidden-by-view', targetView !== 'dashboard-view');
}

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-view');
        
        showView(targetView);
    });
});

function loadRememberedLogin() {
    try {
        const saved = JSON.parse(localStorage.getItem('akvardinioRememberLogin') || 'null');
        if (!saved) return;

        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        if (usernameInput) usernameInput.value = saved.username || '';
        if (passwordInput) passwordInput.value = saved.password || '';
        if (loginRemember) loginRemember.checked = true;
    } catch (error) {
        localStorage.removeItem('akvardinioRememberLogin');
    }
}

function saveRememberedLogin(username, password) {
    if (!loginRemember?.checked) {
        localStorage.removeItem('akvardinioRememberLogin');
        return;
    }

    localStorage.setItem('akvardinioRememberLogin', JSON.stringify({ username, password }));
}

function initAuth() {
    getUsers();
    loadRememberedLogin();

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;
            const user = getUsers().find(item => item.username === username && item.password === password);

            if (!user) {
                if (loginError) loginError.textContent = 'Kullanıcı adı veya şifre hatalı.';
                return;
            }

            if (loginError) loginError.textContent = '';
            saveRememberedLogin(username, password);
            loginForm.reset();
            loadRememberedLogin();
            setSession(user);
            showView('dashboard-view');
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            clearSession();
            loadRememberedLogin();
            showView('dashboard-view');
        });
    }

    restoreSession();
}

function renderPermissionInputs(selectedCards = [], cameraAllowed = false) {
    const grid = document.getElementById('dashboard-permissions');
    if (!grid) return;

    grid.innerHTML = dashboardPermissionCards.map(card => `
        <label class="permission-item">
            <input type="checkbox" value="${card.id}" ${selectedCards.includes(card.id) ? 'checked' : ''}>
            <span>${card.label}</span>
        </label>
    `).join('');

    const cameraInput = document.getElementById('permission-camera');
    if (cameraInput) cameraInput.checked = cameraAllowed;
}

function resetUserForm() {
    document.getElementById('user-edit-id').value = '';
    document.getElementById('user-username').value = '';
    document.getElementById('user-password').value = '';
    document.getElementById('user-is-admin').checked = false;
    renderPermissionInputs([], false);
}

function renderUsersList() {
    const list = document.getElementById('users-list');
    if (!list) return;

    const users = getUsers();
    list.innerHTML = users.map(user => {
        const cardCount = user.isAdmin ? dashboardPermissionCards.length : (user.permissions?.cards?.length || 0);
        const cameraText = user.isAdmin || user.permissions?.camera ? 'Kamera: Var' : 'Kamera: Yok';
        return `
            <div class="user-row">
                <div>
                    <strong>${user.username}</strong>
                    <span>${user.isAdmin ? 'Full yetkili' : `${cardCount} kart yetkisi`} · ${cameraText}</span>
                </div>
                <div class="user-row-actions">
                    <button type="button" data-user-edit="${user.username}" title="Düzenle"><i class="ph ph-pencil"></i></button>
                    <button type="button" data-user-delete="${user.username}" title="Sil" ${user.username === defaultAdminUser.username ? 'disabled' : ''}><i class="ph ph-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');

    list.querySelectorAll('[data-user-edit]').forEach(button => {
        button.addEventListener('click', () => editUser(button.dataset.userEdit));
    });

    list.querySelectorAll('[data-user-delete]').forEach(button => {
        button.addEventListener('click', () => deleteUser(button.dataset.userDelete));
    });
}

function editUser(username) {
    const user = getUsers().find(item => item.username === username);
    if (!user) return;

    document.getElementById('user-edit-id').value = user.username;
    document.getElementById('user-username').value = user.username;
    document.getElementById('user-password').value = user.password;
    document.getElementById('user-is-admin').checked = Boolean(user.isAdmin);
    renderPermissionInputs(user.permissions?.cards || [], Boolean(user.permissions?.camera));
}

function deleteUser(username) {
    if (username === defaultAdminUser.username) return;
    const users = getUsers().filter(user => user.username !== username);
    saveUsers(users);
    renderUsersList();
    resetUserForm();
}

function initUsersPage() {
    renderPermissionInputs([], false);
    renderUsersList();

    const saveBtn = document.getElementById('btn-save-user');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const editId = document.getElementById('user-edit-id').value;
            const username = document.getElementById('user-username').value.trim();
            const password = document.getElementById('user-password').value.trim();
            const isAdmin = document.getElementById('user-is-admin').checked;
            if (!username || !password) return;

            const selectedCards = Array.from(document.querySelectorAll('#dashboard-permissions input:checked')).map(input => input.value);
            const cameraAllowed = document.getElementById('permission-camera').checked;
            let users = getUsers();
            const existingIndex = users.findIndex(user => user.username === (editId || username));
            const newUser = {
                username,
                password,
                isAdmin,
                permissions: {
                    cards: isAdmin ? dashboardPermissionCards.map(card => card.id) : selectedCards,
                    camera: isAdmin ? true : cameraAllowed
                }
            };

            if (existingIndex >= 0) {
                users[existingIndex] = users[existingIndex].username === defaultAdminUser.username
                    ? { ...defaultAdminUser, password }
                    : newUser;
            } else {
                users.push(newUser);
            }

            saveUsers(users);
            renderUsersList();
            resetUserForm();

            if (currentUser && currentUser.username === username) {
                setSession(getUsers().find(user => user.username === username));
            }
        });
    }

    const resetBtn = document.getElementById('btn-reset-user-form');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetUserForm);
    }
}

// Navigate to feeding view from simple card
document.getElementById('card-feed-simple').addEventListener('click', () => {
    const feedNav = document.querySelector('.nav-item[data-view="feeding-view"]');
    if(feedNav) feedNav.click();
});

// Dashboard Sensor Cards -> Open Chart Modal
const sensorCardBindings = {
    'card-temp': 'temp',
    'card-hum': 'hum',
    'card-tds': 'tds',
    'card-flow': 'flow',
    'card-oxygen': 'oxygen',
    'card-co2': 'co2',
    'card-ph': 'ph',
    'card-ec': 'ec'
};

const sensorOverviewBindings = {
    temp: { valueId: 'overview-temp', statusId: 'overview-status-temp', format: value => value.toFixed(1) },
    ph: { valueId: 'overview-ph', statusId: 'overview-status-ph', format: value => value.toFixed(1) },
    ec: { valueId: 'overview-ec', statusId: 'overview-status-ec', format: value => Math.round(value) },
    tds: { valueId: 'overview-tds', statusId: 'overview-status-tds', format: value => Math.round(value) },
    hum: { valueId: 'overview-hum', statusId: 'overview-status-hum', format: value => Math.round(value) },
    co2: { valueId: 'overview-co2', statusId: 'overview-status-co2', format: value => Math.round(value) },
    flow: { valueId: 'overview-flow', statusId: 'overview-status-flow', format: value => value.toFixed(1) },
    oxygen: { valueId: 'overview-oxygen', statusId: 'overview-status-oxygen', format: value => value.toFixed(1) }
};

Object.keys(sensorCardBindings).forEach(cardId => {
    const cardEl = document.getElementById(cardId);
    if (cardEl) {
        cardEl.style.cursor = 'pointer';
        cardEl.addEventListener('click', () => {
            if (typeof openChartModal === 'function') {
                openChartModal(sensorCardBindings[cardId]);
            }
        });
    }
});

let overviewItemDragJustEnded = false;

document.querySelectorAll('[data-overview-chart]').forEach(item => {
    item.addEventListener('click', () => {
        if (overviewItemDragJustEnded) return;
        const key = item.getAttribute('data-overview-chart');
        if (key && typeof openChartModal === 'function') {
            openChartModal(key);
        }
    });
});

function updateSensorOverviewCard() {
    Object.entries(sensorOverviewBindings).forEach(([key, binding]) => {
        const valueEl = document.getElementById(binding.valueId);
        const statusEl = document.getElementById(binding.statusId);
        const itemEls = document.querySelectorAll(`[data-overview-chart="${key}"]`);
        const value = state[key];
        const cfg = chartConfig[key];

        if (valueEl && typeof value === 'number') {
            valueEl.textContent = binding.format(value);
        }

        document.querySelectorAll(`[data-overview-value="${key}"]`).forEach(el => {
            if (typeof value === 'number') {
                el.textContent = binding.format(value);
            }
        });

        if (!statusEl || !cfg || typeof value !== 'number') return;

        itemEls.forEach(itemEl => itemEl.classList.remove('warning', 'danger'));
        const statusTextEls = [
            statusEl,
            ...document.querySelectorAll(`[data-overview-status="${key}"]`)
        ];

        if (value < cfg.idealMin) {
            statusTextEls.forEach(el => { el.textContent = 'Düşük'; });
            itemEls.forEach(itemEl => itemEl.classList.add('warning'));
        } else if (value > cfg.idealMax) {
            statusTextEls.forEach(el => { el.textContent = 'Yüksek'; });
            itemEls.forEach(itemEl => itemEl.classList.add('danger'));
        } else {
            statusTextEls.forEach(el => { el.textContent = 'Normal'; });
        }
    });
}

// Ad Card Navigation
document.querySelectorAll('.ad-card').forEach(card => {
    card.addEventListener('click', (e) => {
        e.preventDefault();
        const viewSections = document.querySelectorAll('.view-section');
        viewSections.forEach(view => {
            if (view.id === 'ad-view') {
                view.style.display = 'block';
                view.classList.add('active');
            } else {
                view.style.display = 'none';
                view.classList.remove('active');
            }
        });
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    });
});

// 1. Clock & Date Update
const elDate = document.getElementById('currentDate');

function updateTime() {
    const now = new Date();
    elTime.textContent = now.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    elDate.textContent = now.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
    });
}
setInterval(updateTime, 1000);
updateTime();

// 1.5 Theme Toggle
const btnTheme = document.getElementById('btn-theme');
let isLightTheme = false;

function setTheme(light) {
    isLightTheme = light;
    if (light) {
        document.body.classList.add('light-theme');
        btnTheme.classList.add('light-active');
        btnTheme.innerHTML = '<i class="ph ph-moon"></i>';
        btnTheme.title = 'Karanlık Tema';
        // Chart.js renklerini açık temaya uyarla
        if (typeof Chart !== 'undefined') {
            Chart.defaults.color = '#64748b';
        }
    } else {
        document.body.classList.remove('light-theme');
        btnTheme.classList.remove('light-active');
        btnTheme.innerHTML = '<i class="ph ph-sun"></i>';
        btnTheme.title = 'Açık Tema';
        if (typeof Chart !== 'undefined') {
            Chart.defaults.color = '#94a3b8';
        }
    }
    // Grafikleri güncelle (eğer varlarsa)
    if (typeof chartTemp !== 'undefined') {
        [chartTemp, chartTds, chartPh, chartHum, chartCo2, chartEc, chartFlow, chartOxygen].forEach(chart => {
            if (chart) chart.update('none');
        });
    }
}

btnTheme.addEventListener('click', () => {
    setTheme(!isLightTheme);
});

const lightingPresets = {
    freshwater: {
        start: '10:00',
        end: '17:00',
        rampUp: 20,
        rampDown: 20,
        moonlight: false,
        duration: '6-7 saat',
        intensity: 'Orta',
        focus: 'Balık rengi, düşük yosun riski',
        guidance: 'Tatlı su balık akvaryumlarında 6-8 saat arası aydınlatma genelde yeterlidir. Spektrum dengesi doğal görünüm ve düşük yosun baskısı için beyaz ağırlıklı, mavi/kırmızı düşük tutulacak şekilde ayarlandı.',
        spectrum: { white: 70, blue: 20, red: 15, green: 25, violet: 0 }
    },
    'freshwater-planted': {
        start: '09:30',
        end: '17:30',
        rampUp: 30,
        rampDown: 30,
        moonlight: false,
        duration: '8 saat',
        intensity: 'Orta-yüksek',
        focus: 'Bitki gelişimi ve doğal görünüm',
        guidance: 'Tatlı su + bitki akvaryumlarında 7-8 saatlik stabil fotoperiyot çoğu kurulum için iyi başlangıçtır. Kırmızı ve mavi kanallar fotosentezi desteklerken beyaz kanal gözle görünür dengeyi korur.',
        spectrum: { white: 65, blue: 35, red: 45, green: 25, violet: 5 }
    },
    'plant-only': {
        start: '09:00',
        end: '18:00',
        rampUp: 45,
        rampDown: 45,
        moonlight: false,
        duration: '8-9 saat',
        intensity: 'Yüksek',
        focus: 'Fotosentez ve yoğun bitki büyümesi',
        guidance: 'Bitki ağırlıklı akvaryumlarda 8-10 saat üst sınır kabul edilebilir; CO2 ve gübreleme dengeli değilse süreyi 8 saatte tutmak daha güvenlidir. Kırmızı ve mavi kanallar belirgin artırıldı.',
        spectrum: { white: 75, blue: 45, red: 65, green: 30, violet: 8 }
    },
    saltwater: {
        start: '11:00',
        end: '20:00',
        rampUp: 60,
        rampDown: 60,
        moonlight: true,
        duration: '8-9 saat',
        intensity: 'Orta-yüksek',
        focus: 'Mavi/aktinik görünüm',
        guidance: 'Tuzlu su akvaryumlarında mavi ve mor/UV kanallar mercan floresansı ve deniz görünümü için öne çıkar. Beyaz kanal daha kontrollü tutuldu; uzun süre yüksek beyaz ışık yosun riskini artırabilir.',
        spectrum: { white: 35, blue: 75, red: 8, green: 10, violet: 35 }
    },
    'saltwater-planted': {
        start: '10:30',
        end: '19:30',
        rampUp: 60,
        rampDown: 60,
        moonlight: true,
        duration: '8-9 saat',
        intensity: 'Dengeli',
        focus: 'Makroalg/deniz bitkisi ve mavi deniz tonu',
        guidance: 'Tuzlu su + bitki veya makroalg kurulumlarında mavi kanal deniz canlıları için korunurken kırmızı ve beyaz kanallar bitkisel büyümeyi destekleyecek kadar yükseltilir. Dengeyi yosun artışına göre kademeli ayarlamak gerekir.',
        spectrum: { white: 50, blue: 65, red: 35, green: 18, violet: 25 }
    }
};

let currentLightingType = 'freshwater';

function applyLightingPreset(type) {
    const preset = lightingPresets[type] || lightingPresets.freshwater;
    currentLightingType = type;

    document.querySelectorAll('.lighting-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lightingType === type);
    });

    const startInput = document.getElementById('lighting-start');
    const endInput = document.getElementById('lighting-end');
    const rampUpInput = document.getElementById('lighting-ramp-up');
    const rampDownInput = document.getElementById('lighting-ramp-down');
    const moonlightInput = document.getElementById('lighting-moonlight');
    if (startInput) startInput.value = preset.start;
    if (endInput) endInput.value = preset.end;
    if (rampUpInput) rampUpInput.value = preset.rampUp;
    if (rampDownInput) rampDownInput.value = preset.rampDown;
    if (moonlightInput) moonlightInput.checked = preset.moonlight;

    Object.entries(preset.spectrum).forEach(([channel, value]) => {
        const bar = document.getElementById(`spectrum-${channel}-bar`);
        const label = document.getElementById(`spectrum-${channel}-value`);
        if (bar) bar.style.width = `${value}%`;
        if (label) label.textContent = `${value}%`;
    });

    document.getElementById('lighting-duration').textContent = preset.duration;
    document.getElementById('lighting-intensity').textContent = preset.intensity;
    document.getElementById('lighting-focus').textContent = preset.focus;
    document.getElementById('lighting-guidance').textContent = preset.guidance;
}

function initLightingAutomation() {
    const saved = localStorage.getItem('akvardinioLightingPlan');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.type && lightingPresets[parsed.type]) {
                currentLightingType = parsed.type;
            }
        } catch (error) {
            console.warn('Aydınlatma planı okunamadı:', error);
        }
    }

    applyLightingPreset(currentLightingType);

    document.querySelectorAll('.lighting-type-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLightingPreset(btn.dataset.lightingType));
    });

    const saveBtn = document.getElementById('btn-save-lighting');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const plan = {
                type: currentLightingType,
                start: document.getElementById('lighting-start').value,
                end: document.getElementById('lighting-end').value,
                rampUp: parseInt(document.getElementById('lighting-ramp-up').value, 10),
                rampDown: parseInt(document.getElementById('lighting-ramp-down').value, 10),
                moonlight: document.getElementById('lighting-moonlight').checked,
                spectrum: lightingPresets[currentLightingType].spectrum
            };
            localStorage.setItem('akvardinioLightingPlan', JSON.stringify(plan));
            updateLightDashboardUI();

            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Plan Kaydedildi!';
            saveBtn.style.background = '#10b981';
            saveBtn.style.color = '#fff';
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = '';
                saveBtn.style.color = '';
            }, 1800);
        });
    }
}

// 2. Mock Data Simulation (to mimic Arduino stream)
function simulateData() {
    applyAutomaticLightingState();

    // Random variations
    state.temp += (Math.random() - 0.5) * 0.2; // +/- 0.1
    state.hum += (Math.random() - 0.5) * 1.0;  // +/- 0.5
    state.tds += (Math.random() - 0.5) * 2.0;  // +/- 1.0
    state.flow += (Math.random() - 0.5) * 0.4; // +/- 0.2
    state.oxygen += (Math.random() - 0.5) * 0.12; // +/- 0.06
    state.ph += (Math.random() - 0.5) * 0.05;  // +/- 0.025
    state.co2 += (Math.random() - 0.5) * 1.0;  // +/- 0.5
    state.ec += (Math.random() - 0.5) * 5.0;   // +/- 2.5

    // Constrain values
    if(state.temp < 20) state.temp = 20; if(state.temp > 30) state.temp = 30;
    if(state.hum < 40) state.hum = 40; if(state.hum > 90) state.hum = 90;
    if(state.tds < 100) state.tds = 100; if(state.tds > 400) state.tds = 400;
    if(state.flow < 2) state.flow = 2; if(state.flow > 18) state.flow = 18;
    if(state.oxygen < 3) state.oxygen = 3; if(state.oxygen > 12) state.oxygen = 12;
    if(state.ph < 5.0) state.ph = 5.0; if(state.ph > 9.0) state.ph = 9.0;
    if(state.co2 < 10) state.co2 = 10; if(state.co2 > 50) state.co2 = 50;
    if(state.ec < 100) state.ec = 100; if(state.ec > 1000) state.ec = 1000;

    // Taşkın simülasyonu: %3 ihtimalle rastgele taşkın tetiklenir, sonra 10 saniyede normale döner
    if (!state.floodDetected && Math.random() < 0.003) {
        state.floodDetected = true;
        state.pumpActive = false;
        
        if (typeof addLogEntry === 'function') {
            addLogEntry('Sistem Taşkın Sensörü', 'Su Taşması Algılandı!', 'danger', 'Kritik');
        }

        // 10 saniye sonra normale dön
        setTimeout(() => {
            state.floodDetected = false;
            state.pumpActive = true;
            if (typeof addLogEntry === 'function') {
                addLogEntry('Sistem Taşkın Sensörü', 'Sorun Giderildi', 'safe', 'Normal');
            }
            updateAlarmUI();
        }, 10000);
    }

    // Update UI
    elTemp.textContent = state.temp.toFixed(1);
    elHum.textContent = Math.round(state.hum);
    elTds.textContent = Math.round(state.tds);
    if (elFlow) elFlow.textContent = state.flow.toFixed(1);
    if (elOxygen) elOxygen.textContent = state.oxygen.toFixed(1);
    
    const elCo2 = document.getElementById('val-co2');
    if (elCo2) {
        elCo2.textContent = Math.round(state.co2);
        const co2Badge = document.getElementById('co2-status-badge');
        if (co2Badge && chartConfig.co2) {
            const cfg = chartConfig.co2;
            if (state.co2 > cfg.idealMax || state.co2 < cfg.idealMin) {
                co2Badge.textContent = 'Uyarı';
                co2Badge.style.background = 'rgba(239, 68, 68, 0.15)';
                co2Badge.style.color = 'var(--accent-red)';
            } else {
                co2Badge.textContent = 'Aktif';
                co2Badge.style.background = 'rgba(16, 185, 129, 0.15)';
                co2Badge.style.color = 'var(--accent-green)';
            }
        }
    }

    // EC UI güncelleme
    const elEc = document.getElementById('val-ec');
    if (elEc) {
        elEc.textContent = Math.round(state.ec);
    }

    // pH UI güncelleme
    updatePhUI();
    updateSensorOverviewCard();
    // Alarm UI güncelleme
    updateAlarmUI();

    // Soğutma Fanı Otomatik Kontrolü
    if (state.coolingMode === 'auto') {
        const cfg = chartConfig.temp;
        if (state.temp > cfg.idealMax) {
            state.coolingOn = true;
        } else if (state.temp < cfg.idealMax - 0.2) {
            state.coolingOn = false;
        }
    }
    updateCoolingUI();
    updateCustomCardsLive();

    // Update Chart Live Data
    updateChartsLive(state.temp, state.tds, state.ph, state.hum, state.co2, state.ec, state.flow, state.oxygen);
    
    // ESP32 Ham Veri Terminali Loglama (Simülasyon)
    if (typeof logToTerminal === 'function') {
        logToTerminal({
            temp: parseFloat(state.temp.toFixed(2)),
            hum: parseFloat(state.hum.toFixed(2)),
            tds: parseFloat(state.tds.toFixed(2)),
            flow: parseFloat(state.flow.toFixed(2)),
            oxygen: parseFloat(state.oxygen.toFixed(2)),
            ph: parseFloat(state.ph.toFixed(2)),
            co2: parseFloat(state.co2.toFixed(2)),
            ec: parseFloat(state.ec.toFixed(2)),
            flood: state.floodDetected,
            pump: state.pumpActive,
            light: state.lightOn,
            filter: state.filterOn,
            cooling: state.coolingOn,
            air: state.airOn
        });
    }
}

// pH UI Güncelleme
function updatePhUI() {
    const phVal = state.ph.toFixed(1);
    elPh.textContent = phVal;

    // pH trend göstergesi
    const phTrend = cardPh.querySelector('.card-trend');
    
    if (state.ph < 6.5) {
        elPh.className = 'ph-low';
        phTrend.innerHTML = '<i class="ph ph-warning-circle"></i> <span>Asidik - Dikkat!</span>';
        phTrend.className = 'card-trend warning';
    } else if (state.ph > 7.8) {
        elPh.className = 'ph-high';
        phTrend.innerHTML = '<i class="ph ph-warning-circle"></i> <span>Bazik - Dikkat!</span>';
        phTrend.className = 'card-trend warning';
    } else {
        elPh.className = 'ph-normal';
        phTrend.innerHTML = '<i class="ph ph-check-circle"></i> <span>İdeal Seviyede</span>';
        phTrend.className = 'card-trend safe';
    }
}

// Alarm UI Güncelleme
function updateAlarmUI() {
    if (state.floodDetected) {
        cardAlarm.classList.add('alarm-active');
        elAlarm.textContent = 'TAŞKIN!';
        elAlarm.style.fontSize = '32px';
        elAlarmTrend.innerHTML = '<i class="ph ph-warning-octagon"></i> <span>Su Taşması Algılandı! Pompa KAPALI</span>';
        elAlarmTrend.className = 'card-trend danger';
    } else if (state.activeSensorAlarms && state.activeSensorAlarms.length > 0) {
        cardAlarm.classList.add('alarm-active');
        elAlarm.textContent = 'DİKKAT';
        elAlarm.style.fontSize = '24px';
        const issues = state.activeSensorAlarms.join(', ');
        elAlarmTrend.innerHTML = `<i class="ph ph-warning"></i> <span>Uyarı: ${issues}</span>`;
        elAlarmTrend.className = 'card-trend warning';
    } else {
        cardAlarm.classList.remove('alarm-active');
        elAlarm.textContent = 'Normal';
        elAlarm.style.fontSize = '';
        elAlarmTrend.innerHTML = '<i class="ph ph-shield-check"></i> <span>Sistem Sorunsuz Çalışıyor</span>';
        elAlarmTrend.className = 'card-trend safe';
    }
}

// Soğutma Fanı Kontrolü ve UI
if (btnCooling) {
    btnCooling.addEventListener('click', () => {
        if (state.coolingMode === 'auto') {
            state.coolingMode = 'manual';
            state.coolingOn = !state.coolingOn;
        } else {
            if (state.coolingOn) {
                state.coolingOn = false;
            } else {
                state.coolingMode = 'auto';
            }
        }
        updateCoolingUI();
    });
}

function updateCoolingUI() {
    if (!btnCooling || !elCoolingText) return;
    
    if (state.coolingMode === 'auto') {
        btnCooling.textContent = 'Oto: ' + (state.coolingOn ? 'Açık' : 'Kapalı');
        btnCooling.classList.remove('active');
        btnCooling.style.background = '';
        btnCooling.style.color = '';
    } else {
        btnCooling.textContent = 'Manuel: ' + (state.coolingOn ? 'Açık' : 'Kapalı');
        if (state.coolingOn) {
            btnCooling.classList.add('active');
            btnCooling.style.background = '#38bdf8';
            btnCooling.style.color = '#1e293b';
            btnCooling.style.borderColor = '#38bdf8';
        } else {
            btnCooling.classList.remove('active');
            btnCooling.style.background = '';
            btnCooling.style.color = '';
            btnCooling.style.borderColor = '';
        }
    }

    if (state.coolingOn) {
        elCoolingText.textContent = 'Çalışıyor';
        elCoolingText.style.color = '#38bdf8';
    } else {
        elCoolingText.textContent = 'Kapalı';
        elCoolingText.style.color = '';
    }
}

// Hava Motoru Kontrolü
if (btnAir) {
    btnAir.addEventListener('click', () => {
        state.airOn = !state.airOn;
        updateAirUI();
    });
}

function updateAirUI() {
    if (!btnAir || !elAirText) return;
    
    if (state.airOn) {
        btnAir.classList.add('active');
        btnAir.textContent = 'Kapat';
        btnAir.style.background = '#a78bfa';
        btnAir.style.color = '#1e293b';
        btnAir.style.borderColor = '#a78bfa';
        
        elAirText.textContent = 'Çalışıyor';
        elAirText.style.color = '#a78bfa';
    } else {
        btnAir.classList.remove('active');
        btnAir.textContent = 'Aç';
        btnAir.style.background = '';
        btnAir.style.color = '';
        btnAir.style.borderColor = '';
        
        elAirText.textContent = 'Kapalı';
        elAirText.style.color = '';
    }
}

// 3. Light Toggle Logic
const cardLight = document.getElementById('card-light');
if (cardLight) {
    cardLight.addEventListener('click', () => {
        showView('lighting-view');
    });
}

function getLightingDashboardPlan() {
    try {
        const saved = localStorage.getItem('akvardinioLightingPlan');
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                start: parsed.start || lightingPresets[currentLightingType].start,
                end: parsed.end || lightingPresets[currentLightingType].end
            };
        }
    } catch (error) {
        console.warn('Aydınlatma dashboard planı okunamadı:', error);
    }

    const preset = lightingPresets[currentLightingType] || lightingPresets.freshwater;
    return { start: preset.start, end: preset.end };
}

function isTimeInsideLightingPlan(plan) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = plan.start.split(':').map(Number);
    const [endHour, endMinute] = plan.end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes <= endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }

    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

function applyAutomaticLightingState() {
    if (state.lightMode !== 'auto') return;
    const plan = getLightingDashboardPlan();
    const shouldBeOn = isTimeInsideLightingPlan(plan);
    if (state.lightOn !== shouldBeOn) {
        state.lightOn = shouldBeOn;
        setTheme(state.lightOn);
    }
}

function updateLightDashboardUI() {
    const plan = getLightingDashboardPlan();
    if (elLightSchedule) {
        elLightSchedule.textContent = `${plan.start} / ${plan.end}`;
    }

    if (state.lightMode === 'auto') {
        if (btnLightAuto) btnLightAuto.classList.add('auto-active');
        btnLight.textContent = state.lightOn ? 'Kapat' : 'Aç';
        elLightText.textContent = state.lightOn ? 'Oto Açık' : 'Oto Kapalı';
        elLightText.style.color = state.lightOn ? 'var(--accent-yellow)' : '';
    } else {
        if (btnLightAuto) btnLightAuto.classList.remove('auto-active');
        btnLight.textContent = state.lightOn ? 'Kapat' : 'Aç';
        elLightText.textContent = state.lightOn ? 'Açık' : 'Kapalı';
        elLightText.style.color = state.lightOn ? 'var(--accent-yellow)' : '';
    }

    btnLight.classList.toggle('active', state.lightOn);
}

btnLight.addEventListener('click', (e) => {
    e.stopPropagation();
    state.lightMode = 'manual';
    state.lightOn = !state.lightOn;
    updateLightDashboardUI();
    setTheme(state.lightOn);
});

if (btnLightAuto) {
    btnLightAuto.addEventListener('click', (e) => {
    e.stopPropagation();
    state.lightMode = state.lightMode === 'auto' ? 'manual' : 'auto';
    applyAutomaticLightingState();
    updateLightDashboardUI();
});
}

// 3.5 Filter Motor Toggle Logic
btnFilter.addEventListener('click', () => {
    state.filterOn = !state.filterOn;

    if (state.filterOn) {
        btnFilter.classList.add('active');
        btnFilter.textContent = 'Durdur';
        elFilterText.textContent = 'Çalışıyor';
        elFilterText.style.color = '#f59e0b';
        cardFilter.classList.add('filter-running');
        // Son temizlik zamanını güncelle
        state.lastFilterClean = new Date();
        elFilterClean.textContent = state.lastFilterClean.toLocaleTimeString('tr-TR', {
            hour: '2-digit', minute: '2-digit'
        }) + ' - ' + state.lastFilterClean.toLocaleDateString('tr-TR', {
            day: '2-digit', month: 'short'
        });
        // ESP32: fetch('http://esp32-ip/filter?state=on')
    } else {
        btnFilter.classList.remove('active');
        btnFilter.textContent = 'Çalıştır';
        elFilterText.textContent = 'Kapalı';
        elFilterText.style.color = '';
        cardFilter.classList.remove('filter-running');
        // ESP32: fetch('http://esp32-ip/filter?state=off')
    }
});

// 4. Feed Toggle & Schedule Logic
const btnFeed = document.getElementById('btn-feed');
const elFeedTimeSimple = document.getElementById('val-feed-simple');
const elFeedTimeDetailed = document.getElementById('val-feed-detailed');
const elNextFeed = document.getElementById('val-next-feed');

const inputTime = document.getElementById('feed-time-input');
const btnAddSchedule = document.getElementById('btn-add-schedule');
const scheduleList = document.getElementById('schedule-list');

// Load schedules from localStorage
let scheduledFeedsRaw = JSON.parse(localStorage.getItem('akvardinio_schedules') || '[]');
// Eski string ('10:00') formatını yeni nesne formatına ({time: '10:00', days:[0,1,2..]}) uyarla
let scheduledFeeds = scheduledFeedsRaw.map(feed => 
    typeof feed === 'string' ? { time: feed, days: [1,2,3,4,5,6,0] } : feed
);
let lastFedMinute = ''; // Prevent multiple feeds in the same minute

let pastFeedings = JSON.parse(localStorage.getItem('akvardinioPastFeedings')) || [];

if (pastFeedings.length === 0) {
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        
        d.setHours(9, 30, 0);
        pastFeedings.push({
            date: d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            time: d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            manual: false
        });
        
        if (i === 1) {
            d.setHours(14, 15, 0);
            pastFeedings.push({
                date: d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                time: d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                manual: true
            });
        }
        
        d.setHours(19, 0, 0);
        pastFeedings.push({
            date: d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            time: d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            manual: false
        });
    }
    pastFeedings.reverse();
    localStorage.setItem('akvardinioPastFeedings', JSON.stringify(pastFeedings));
}

function renderPastFeedings() {
    const list = document.getElementById('past-feedings-list');
    if (!list) return;
    list.innerHTML = '';
    
    if (pastFeedings.length === 0) {
        list.innerHTML = '<li style="text-align: center; color: var(--text-muted); padding: 20px;">Henüz yemleme kaydı yok.</li>';
        return;
    }
    
    pastFeedings.forEach(f => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.padding = '12px';
        li.style.background = 'rgba(255,255,255,0.03)';
        li.style.borderRadius = '8px';
        li.style.borderLeft = f.manual ? '3px solid var(--accent-blue)' : '3px solid var(--accent-green)';
        li.style.marginBottom = '8px';
        
        li.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <span style="font-weight: 500; font-size: 15px;"><i class="ph ph-clock"></i> ${f.time}</span>
                <span style="font-size: 12px; color: var(--text-muted);"><i class="ph ph-calendar"></i> ${f.date}</span>
            </div>
            <div style="display: flex; align-items: center;">
                <span style="font-size: 12px; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.1); color: ${f.manual ? 'var(--accent-blue)' : 'var(--accent-green)'}; font-weight: 500;">
                    ${f.manual ? 'Manuel' : 'Otomatik'}
                </span>
            </div>
        `;
        list.appendChild(li);
    });
}
renderPastFeedings();

function saveSchedules() {
    localStorage.setItem('akvardinio_schedules', JSON.stringify(scheduledFeeds));
    renderSchedules();
}

function updateNextFeedDisplay() {
    if (scheduledFeeds.length === 0) {
        elNextFeed.textContent = 'Program Yok';
        return;
    }
    
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const currentDay = now.getDay();
    
    // Bugün için uygun olan yemlemeleri filtrele ve saatine göre sırala
    let todaysFeeds = scheduledFeeds
        .filter(f => f.days.includes(currentDay))
        .map(f => f.time)
        .sort();
        
    let nextTimeStr = todaysFeeds.length > 0 ? todaysFeeds[0] : null;
    
    for (let timeStr of todaysFeeds) {
        const parts = timeStr.split(':');
        const mins = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        if (mins > currentMins) {
            nextTimeStr = timeStr;
            break;
        }
    }
    
    if (nextTimeStr) {
        elNextFeed.textContent = `Bugün ${nextTimeStr}`;
    } else {
        elNextFeed.textContent = 'Bugün Yok';
    }
}

function renderSchedules() {
    scheduleList.innerHTML = '';
    
    const dayNames = {1:'Pzt', 2:'Sal', 3:'Çar', 4:'Per', 5:'Cum', 6:'Cmt', 0:'Paz'};
    
    scheduledFeeds.sort((a, b) => a.time.localeCompare(b.time)).forEach((feed, index) => {
        const li = document.createElement('li');
        li.className = 'schedule-item';
        li.style.flexDirection = 'column';
        li.style.alignItems = 'flex-start';
        li.style.gap = '8px';
        
        let daysHtml = feed.days.length === 7 ? '<span style="font-size: 11px; color: var(--accent-green);">Her Gün</span>' : 
            feed.days.map(d => `<span style="font-size: 11px; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">${dayNames[d]}</span>`).join(' ');

        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                <span><i class="ph ph-clock"></i> ${feed.time}</span>
                <button class="remove-btn" onclick="removeSchedule(${index})"><i class="ph ph-trash"></i></button>
            </div>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">${daysHtml}</div>
        `;
        scheduleList.appendChild(li);
    });
    updateNextFeedDisplay();
}

// Global function for the inline onclick handler
window.removeSchedule = function(index) {
    scheduledFeeds.splice(index, 1);
    saveSchedules();
};

btnAddSchedule.addEventListener('click', () => {
    const timeVal = inputTime.value;
    if (timeVal) {
        // Zaten aynı saatte kayıt var mı kontrolü
        const exists = scheduledFeeds.some(f => f.time === timeVal);
        if (exists) {
            alert('Bu saate ait zaten bir program var! Farklı bir saat seçin veya mevcut programı silin.');
            return;
        }
        
        // Seçili günleri al
        const selectedDays = Array.from(document.querySelectorAll('#feed-days-group input:checked')).map(cb => parseInt(cb.value));
        if (selectedDays.length === 0) {
            alert('Lütfen en az bir gün seçin!');
            return;
        }
        
        scheduledFeeds.push({ time: timeVal, days: selectedDays });
        saveSchedules();
        inputTime.value = '';
    }
});

function triggerFeed(isManual = false) {
    // Görsel geri bildirim
    const originalText = btnFeed.textContent;
    btnFeed.textContent = 'Yem Veriliyor...';
    btnFeed.style.pointerEvents = 'none';
    btnFeed.classList.add('active');

    // ESP32'ye istek atılacak kısım:
    // fetch('http://esp32-ip/feed').then(...)

    setTimeout(() => {
        btnFeed.textContent = 'Manuel Yem Ver';
        btnFeed.style.pointerEvents = 'auto';
        btnFeed.classList.remove('active');

        // Zamanı güncelle
        const now = new Date();
        const timeStr = now.toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        elFeedTimeSimple.textContent = timeStr;
        elFeedTimeDetailed.textContent = timeStr;
        
        // Geçmişe kaydet
        pastFeedings.unshift({ date: dateStr, time: timeStr, manual: isManual });
        if (pastFeedings.length > 50) pastFeedings.pop();
        localStorage.setItem('akvardinioPastFeedings', JSON.stringify(pastFeedings));
        renderPastFeedings();
    }, 1500); // Servo motorun dönme süresi simülasyonu
}

btnFeed.addEventListener('click', () => triggerFeed(true));

// Timer to check schedule every second
setInterval(() => {
    const now = new Date();
    const currentHHMM = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const currentDay = now.getDay();
    
    // Zamanı ve bugünü eşleşen bir program var mı?
    const shouldFeedNow = scheduledFeeds.some(f => f.time === currentHHMM && f.days.includes(currentDay));
    
    if (shouldFeedNow && lastFedMinute !== currentHHMM) {
        lastFedMinute = currentHHMM;
        triggerFeed();
    }
}, 1000);

// Initial render
renderSchedules();

// 5. Chart Initialization - 4 Ayrı Grafik (24 Saatlik Görünüm)
let chartTemp, chartTds, chartPh, chartHum, chartCo2, chartEc, chartFlow, chartOxygen;
const maxDataPoints = 288; // 24 saat × 12 nokta/saat (her 5 dakikada 1)
const CHART_INTERVAL_MS = 5 * 60 * 1000; // 5 dakika
let chartUpdateCounter = 0;
const CHART_UPDATE_EVERY = 150; // 150 × 2sn = 300sn = 5 dakika

// 24 saatlik zaman etiketlerini oluştur (HH:MM formatında)
function generateTimeLabels() {
    const now = new Date();
    return Array.from({length: maxDataPoints}, (_, i) => {
        const past = new Date(now.getTime() - (maxDataPoints - 1 - i) * CHART_INTERVAL_MS);
        return past.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    });
}
const timeLabels = generateTimeLabels();

// Gerçekçi 24 saatlik simülasyon verisi oluştur
function generateHistoricalData(baseVal, amplitude, noiseRange) {
    return Array.from({length: maxDataPoints}, (_, i) => {
        // Gün içi sinüzoidal dalgalanma (gece düşük, gündüz yüksek)
        const hourFraction = (i / maxDataPoints) * 24;
        const dailyCycle = Math.sin((hourFraction - 6) * Math.PI / 12) * amplitude;
        // Rastgele gürültü
        const noise = (Math.random() - 0.5) * noiseRange;
        return parseFloat((baseVal + dailyCycle + noise).toFixed(2));
    });
}

const tempHistory = generateHistoricalData(25.5, 1.5, 0.8);   // 24-27°C arası dalgalanma
const tdsHistory = generateHistoricalData(220, 30, 15);         // 190-250 ppm arası
const phHistory = generateHistoricalData(7.2, 0.3, 0.15);      // 6.9-7.5 arası
const humHistory = generateHistoricalData(62, 8, 4);            // 54-70% arası
const co2History = generateHistoricalData(25, 5, 2);            // 20-30 ppm arası
const ecHistory = generateHistoricalData(500, 50, 20);          // 450-550 µS/cm arası
const flowHistory = generateHistoricalData(8.5, 1.2, 0.6);      // 7.3-9.7 L/dk arası
const oxygenHistory = generateHistoricalData(7.4, 0.8, 0.3);    // 6.6-8.2 mg/L arası

const chartConfig = {
    temp: { history: tempHistory, unit: '°C', label: 'Su Isısı (°C)', icon: 'ph-thermometer', iconClass: 'temp-icon', badgeClass: 'temp-badge', color: '#ff4b4b', bg: 'rgba(255, 75, 75, 0.1)', minY: 18, maxY: 34, idealMin: 23, idealMax: 28 },
    tds:  { history: tdsHistory,  unit: 'ppm', label: 'Su Kalitesi - TDS (ppm)', icon: 'ph-flask', iconClass: 'tds-icon', badgeClass: 'tds-badge', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', minY: 50, maxY: 450, idealMin: 150, idealMax: 300 },
    ph:   { history: phHistory,   unit: '', label: 'pH Değeri', icon: 'ph-test-tube', iconClass: 'ph-icon', badgeClass: 'ph-badge', color: '#818cf8', bg: 'rgba(99, 102, 241, 0.1)', minY: 4, maxY: 10, idealMin: 6.5, idealMax: 7.8 },
    hum:  { history: humHistory,  unit: '%', label: 'Ortam Nemi (%)', icon: 'ph-drop', iconClass: 'hum-icon', badgeClass: 'hum-badge', color: '#00d2ff', bg: 'rgba(0, 210, 255, 0.1)', minY: 30, maxY: 100, idealMin: 50, idealMax: 75 },
    co2:  { history: co2History,  unit: 'ppm', label: 'CO2 Seviyesi (ppm)', icon: 'ph-wind', iconClass: 'co2-icon', badgeClass: 'co2-badge', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)', minY: 0, maxY: 60, idealMin: 15, idealMax: 35 },
    ec:   { history: ecHistory,   unit: 'µS/cm', label: 'EC Değeri (µS/cm)', icon: 'ph-lightning', iconClass: 'ec-icon', badgeClass: 'ec-badge', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', minY: 100, maxY: 1000, idealMin: 300, idealMax: 800 },
    flow: { history: flowHistory, unit: 'L/dk', label: 'Su Akış Hızı (L/dk)', icon: 'ph-gauge', iconClass: 'flow-icon', badgeClass: 'flow-badge', color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.1)', minY: 0, maxY: 20, idealMin: 5, idealMax: 12 },
    oxygen: { history: oxygenHistory, unit: 'mg/L', label: 'Çözünmüş Oksijen (mg/L)', icon: 'ph-waves', iconClass: 'oxygen-icon', badgeClass: 'oxygen-badge', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', minY: 0, maxY: 14, idealMin: 6, idealMax: 9 }
};

const customChartInstances = {};

function getCustomCards() {
    return readCustomCards().map(card => ({
        key: card.key,
        title: card.title || card.key,
        type: card.type || 'sensor',
        icon: card.icon || (card.type === 'control' ? 'ph-power' : 'ph-gauge'),
        unit: card.unit || '',
        valueLabel: card.valueLabel || '',
        base: Number.isFinite(parseFloat(card.base)) ? parseFloat(card.base) : 0,
        min: Number.isFinite(parseFloat(card.min)) ? parseFloat(card.min) : 0,
        max: Number.isFinite(parseFloat(card.max)) ? parseFloat(card.max) : 100,
        chartMin: Number.isFinite(parseFloat(card.chartMin)) ? parseFloat(card.chartMin) : 0,
        chartMax: Number.isFinite(parseFloat(card.chartMax)) ? parseFloat(card.chartMax) : 100,
        color: card.color || '#22d3ee',
        description: card.description || '',
        mode: card.mode || 'auto'
    })).filter(card => card.key);
}

function registerCustomCards() {
    getCustomCards().forEach(card => {
        const cardId = `card-${card.key}`;
        if (!dashboardPermissionCards.some(item => item.id === cardId)) {
            dashboardPermissionCards.push({ id: cardId, label: card.title });
        }

        if (card.type === 'sensor') {
            if (typeof state[card.key] !== 'number') state[card.key] = card.base;
            if (!chartConfig[card.key]) {
                const span = Math.max(Math.abs(card.max - card.min), 1);
                chartConfig[card.key] = {
                    history: generateHistoricalData(card.base, span * 0.12, span * 0.08),
                    unit: card.unit,
                    label: `${card.title}${card.unit ? ` (${card.unit})` : ''}`,
                    icon: card.icon,
                    iconClass: `custom-icon-${card.key}`,
                    badgeClass: 'custom-badge',
                    color: card.color,
                    bg: `${card.color}22`,
                    minY: card.chartMin,
                    maxY: card.chartMax,
                    idealMin: card.min,
                    idealMax: card.max
                };
            }
        } else {
            const stateKey = `${card.key}On`;
            const modeKey = `${card.key}Mode`;
            if (typeof state[stateKey] !== 'boolean') state[stateKey] = false;
            if (!state[modeKey]) state[modeKey] = card.mode || 'auto';
        }
    });
}

function renderCustomDashboardCards() {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;

    getCustomCards().forEach(card => {
        if (document.getElementById(`card-${card.key}`)) return;

        const el = document.createElement('div');
        el.className = 'sensor-card custom-dashboard-card';
        el.id = `card-${card.key}`;
        el.dataset.type = card.key;

        if (card.type === 'sensor') {
            el.innerHTML = `
                <div class="card-header">
                    <h3>${escapeHtml(card.title)}</h3>
                    <div class="icon-wrapper custom-created-icon" style="background:${card.color}22;color:${card.color};">
                        <i class="ph ${escapeHtml(card.icon)}"></i>
                    </div>
                </div>
                <div class="card-bottom">
                    <div class="card-value">
                        <span id="val-${card.key}">${Number(state[card.key] || card.base).toFixed(1)}</span><span class="unit">${escapeHtml(card.unit)}</span>
                    </div>
                    <div class="card-trend">
                        <i class="ph ph-check-circle"></i> <span>Normal Seviyede</span>
                    </div>
                </div>
            `;
            el.style.cursor = 'pointer';
            el.addEventListener('click', () => openChartModal(card.key));
        } else {
            const onKey = `${card.key}On`;
            const modeKey = `${card.key}Mode`;
            el.innerHTML = `
                <div class="card-header">
                    <h3>${escapeHtml(card.title)}</h3>
                    <div class="icon-wrapper custom-created-icon" style="background:${card.color}22;color:${card.color};">
                        <i class="ph ${escapeHtml(card.icon)}"></i>
                    </div>
                </div>
                <div class="card-bottom">
                    <div class="card-value">
                        <span id="val-${card.key}" style="font-size:24px;">Kapalı</span>
                    </div>
                    <div class="custom-control-actions">
                        <button class="toggle-btn custom-card-control" id="btn-${card.key}-toggle" type="button">Aç</button>
                        <button class="toggle-btn custom-card-auto" id="btn-${card.key}-auto" type="button">Otomatik</button>
                    </div>
                </div>
            `;
            el.querySelector(`#btn-${card.key}-toggle`)?.addEventListener('click', event => {
                event.stopPropagation();
                state[modeKey] = 'manual';
                state[onKey] = !state[onKey];
                updateCustomControlCard(card);
            });
            el.querySelector(`#btn-${card.key}-auto`)?.addEventListener('click', event => {
                event.stopPropagation();
                state[modeKey] = state[modeKey] === 'auto' ? 'manual' : 'auto';
                updateCustomControlCard(card);
            });
        }

        grid.appendChild(el);
    });
}

function renderCustomChartCards() {
    const grid = document.querySelector('#charts-view .history-grid');
    if (!grid) return;

    getCustomCards().filter(card => card.type === 'sensor').forEach(card => {
        if (document.querySelector(`.chart-card[data-chart="${card.key}"]`)) return;

        const el = document.createElement('div');
        el.className = 'chart-card glass-panel';
        el.dataset.chart = card.key;
        el.addEventListener('click', () => openChartModal(card.key));
        el.innerHTML = `
            <div class="chart-card-header">
                <div class="chart-card-title">
                    <div class="icon-wrapper custom-created-icon" style="background:${card.color}22;color:${card.color};"><i class="ph ${escapeHtml(card.icon)}"></i></div>
                    <h3>${escapeHtml(card.title)}${card.unit ? ` (${escapeHtml(card.unit)})` : ''}</h3>
                </div>
                <div class="chart-card-badges">
                    <span class="chart-minmax" id="minmax-${card.key}">↓ -- / ↑ --</span>
                    <div class="chart-card-badge custom-badge" style="background:${card.color}22;color:${card.color};">Canlı</div>
                </div>
            </div>
            <div class="chart-card-body">
                <canvas id="chart-${card.key}-history"></canvas>
            </div>
        `;
        grid.appendChild(el);
    });
}

function renderCustomSettingsCards() {
    const grid = document.querySelector('#settings-view .settings-grid');
    if (!grid) return;

    getCustomCards().filter(card => card.type === 'sensor').forEach(card => {
        if (document.getElementById(`settings-${card.key}`)) return;

        const el = document.createElement('div');
        el.className = 'sensor-card glass-panel settings-card custom-settings-card';
        el.id = `settings-${card.key}`;
        el.innerHTML = `
            <div class="card-header">
                <div class="icon-wrapper custom-created-icon" style="background:${card.color}22;color:${card.color};"><i class="ph ${escapeHtml(card.icon)}"></i></div>
                <h3>${escapeHtml(card.title)}${card.unit ? ` (${escapeHtml(card.unit)})` : ''}</h3>
            </div>
            <div class="recommended-value">
                <i class="ph ph-info"></i> Tavsiye edilen: ${card.min} - ${card.max}
            </div>
            <div class="settings-inputs">
                <div class="input-group">
                    <label>Minimum Değer</label>
                    <input type="number" id="set-${card.key}-min" class="setting-input custom-setting-min" data-custom-key="${card.key}" step="0.1">
                </div>
                <div class="input-group">
                    <label>Maksimum Değer</label>
                    <input type="number" id="set-${card.key}-max" class="setting-input custom-setting-max" data-custom-key="${card.key}" step="0.1">
                </div>
            </div>
        `;
        grid.appendChild(el);
    });
}

function syncCustomSettingsInputs() {
    getCustomCards().filter(card => card.type === 'sensor').forEach(card => {
        const cfg = chartConfig[card.key];
        const minInput = document.getElementById(`set-${card.key}-min`);
        const maxInput = document.getElementById(`set-${card.key}-max`);
        if (cfg && minInput) minInput.value = cfg.idealMin;
        if (cfg && maxInput) maxInput.value = cfg.idealMax;
    });
}

function renderCustomCards() {
    renderCustomDashboardCards();
    renderCustomChartCards();
    renderCustomSettingsCards();
    syncCustomSettingsInputs();
}

function updateCustomControlCard(card) {
    const onKey = `${card.key}On`;
    const modeKey = `${card.key}Mode`;
    const valueEl = document.getElementById(`val-${card.key}`);
    const toggleBtn = document.getElementById(`btn-${card.key}-toggle`);
    const autoBtn = document.getElementById(`btn-${card.key}-auto`);
    const isAuto = state[modeKey] === 'auto';
    const isOn = Boolean(state[onKey]);

    if (valueEl) {
        valueEl.textContent = isAuto ? (isOn ? 'Oto Açık' : 'Oto Kapalı') : (isOn ? 'Açık' : 'Kapalı');
        valueEl.style.color = isOn ? card.color : '';
    }
    if (toggleBtn) {
        toggleBtn.textContent = isOn ? 'Kapat' : 'Aç';
        toggleBtn.classList.toggle('active', isOn);
    }
    if (autoBtn) autoBtn.classList.toggle('auto-active', isAuto);
}

function updateCustomCardsLive() {
    getCustomCards().forEach(card => {
        if (card.type === 'sensor') {
            const cfg = chartConfig[card.key];
            if (!cfg) return;
            const span = Math.max(Math.abs(cfg.idealMax - cfg.idealMin), 1);
            const next = (typeof state[card.key] === 'number' ? state[card.key] : card.base) + (Math.random() - 0.5) * span * 0.08;
            state[card.key] = Math.min(cfg.maxY, Math.max(cfg.minY, next));
            const valueEl = document.getElementById(`val-${card.key}`);
            if (valueEl) valueEl.textContent = state[card.key].toFixed(1);
        } else {
            if (state[`${card.key}Mode`] === 'auto') {
                state[`${card.key}On`] = Math.random() > 0.5;
            }
            updateCustomControlCard(card);
        }
    });
}

function updateCustomChartsLive() {
    getCustomCards().filter(card => card.type === 'sensor').forEach(card => {
        const chart = customChartInstances[card.key];
        if (!chart || typeof state[card.key] !== 'number') return;
        const series = chart.data.datasets[0].data;
        series.shift();
        series.push(state[card.key]);
        if (chartConfig[card.key]?.history && chartConfig[card.key].history !== series) {
            chartConfig[card.key].history.shift();
            chartConfig[card.key].history.push(state[card.key]);
        }
        chart.update('none');
    });
}

registerCustomCards();

function loadSettings() {
    const saved = localStorage.getItem('akvardinioSettings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.keys(parsed).forEach(key => {
                if (chartConfig[key] && parsed[key]) {
                    const min = parseFloat(parsed[key].idealMin);
                    const max = parseFloat(parsed[key].idealMax);
                    if (!isNaN(min)) chartConfig[key].idealMin = min;
                    if (!isNaN(max)) chartConfig[key].idealMax = max;
                }
            });
        } catch(e) { console.error('Settings parse error', e); }
    }
    
    if (document.getElementById('set-temp-min')) {
        document.getElementById('set-temp-min').value = chartConfig.temp.idealMin;
        document.getElementById('set-temp-max').value = chartConfig.temp.idealMax;
        document.getElementById('set-tds-min').value = chartConfig.tds.idealMin;
        document.getElementById('set-tds-max').value = chartConfig.tds.idealMax;
        document.getElementById('set-ph-min').value = chartConfig.ph.idealMin;
        document.getElementById('set-ph-max').value = chartConfig.ph.idealMax;
        document.getElementById('set-hum-min').value = chartConfig.hum.idealMin;
        document.getElementById('set-hum-max').value = chartConfig.hum.idealMax;
        if(document.getElementById('set-flow-min')) {
            document.getElementById('set-flow-min').value = chartConfig.flow.idealMin;
            document.getElementById('set-flow-max').value = chartConfig.flow.idealMax;
        }
        if(document.getElementById('set-oxygen-min')) {
            document.getElementById('set-oxygen-min').value = chartConfig.oxygen.idealMin;
            document.getElementById('set-oxygen-max').value = chartConfig.oxygen.idealMax;
        }
        if(document.getElementById('set-co2-min')) {
            document.getElementById('set-co2-min').value = chartConfig.co2.idealMin;
            document.getElementById('set-co2-max').value = chartConfig.co2.idealMax;
        }
        if(document.getElementById('set-ec-min')) {
            document.getElementById('set-ec-min').value = chartConfig.ec.idealMin;
            document.getElementById('set-ec-max').value = chartConfig.ec.idealMax;
        }
        syncCustomSettingsInputs();
    }

    loadWhatsAppSettings();
    loadTelegramSettings();
}
loadSettings();

function createSingleChart(canvasId, key) {
    if (typeof Chart === 'undefined') return null;

    const cfg = chartConfig[key];
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: cfg.label,
                    data: cfg.history,
                    borderColor: cfg.color,
                    backgroundColor: cfg.bg,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: cfg.color,
                },
                {
                    label: 'Max Limit',
                    data: Array(288).fill(cfg.idealMax),
                    borderColor: 'rgba(255, 75, 75, 0.7)',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    pointRadius: 0, pointHoverRadius: 0, fill: false, tension: 0
                },
                {
                    label: 'Min Limit',
                    data: Array(288).fill(cfg.idealMin),
                    borderColor: 'rgba(0, 210, 255, 0.7)',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    pointRadius: 0, pointHoverRadius: 0, fill: false, tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { size: 13 },
                    bodyFont: { size: 12 },
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(ctx) {
                            return ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} ${cfg.unit}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: { color: 'rgba(255, 255, 255, 0.03)' },
                    ticks: {
                        font: { size: 10 },
                        maxRotation: 0,
                        minRotation: 0,
                        maxTicksLimit: 12,
                        color: '#64748b'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    min: cfg.minY,
                    max: cfg.maxY,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { font: { size: 11 } }
                }
            }
        }
    });
}

function initCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js yüklenemedi, grafikler devre dışı bırakıldı.');
        return;
    }

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Outfit', sans-serif";

    chartTemp = createSingleChart('chart-temp-history', 'temp');
    chartTds = createSingleChart('chart-tds-history', 'tds');
    chartPh = createSingleChart('chart-ph-history', 'ph');
    chartHum = createSingleChart('chart-hum-history', 'hum');
    chartCo2 = createSingleChart('chart-co2-history', 'co2');
    chartEc = createSingleChart('chart-ec-history', 'ec');
    chartFlow = createSingleChart('chart-flow-history', 'flow');
    chartOxygen = createSingleChart('chart-oxygen-history', 'oxygen');

    getCustomCards().filter(card => card.type === 'sensor').forEach(card => {
        const canvasId = `chart-${card.key}-history`;
        if (document.getElementById(canvasId)) {
            customChartInstances[card.key] = createSingleChart(canvasId, card.key);
        }
    });
}

function updateChartsLive(newTemp, newTds, newPh, newHum, newCo2, newEc, newFlow, newOxygen) {
    // Grafikleri her 5 dakikada bir güncelle (150 × 2sn çevrim)
    chartUpdateCounter++;
    if (chartUpdateCounter < CHART_UPDATE_EVERY) return;
    chartUpdateCounter = 0;

    // Yeni zaman etiketi
    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    timeLabels.shift();
    timeLabels.push(nowStr);

    // Isı
    if (chartTemp) {
        chartTemp.data.datasets[0].data.shift();
        chartTemp.data.datasets[0].data.push(newTemp);
        chartTemp.update('none');
    }
    // TDS
    if (chartTds) {
        chartTds.data.datasets[0].data.shift();
        chartTds.data.datasets[0].data.push(newTds);
        chartTds.update('none');
    }
    // pH
    if (chartPh) {
        chartPh.data.datasets[0].data.shift();
        chartPh.data.datasets[0].data.push(newPh);
        chartPh.update('none');
    }
    // Nem
    if (chartHum) {
        chartHum.data.datasets[0].data.shift();
        chartHum.data.datasets[0].data.push(newHum);
        chartHum.update('none');
    }
    // CO2
    if (chartCo2) {
        chartCo2.data.datasets[0].data.shift();
        chartCo2.data.datasets[0].data.push(newCo2);
        chartCo2.update('none');
    }
    // EC
    if (chartEc) {
        chartEc.data.datasets[0].data.shift();
        chartEc.data.datasets[0].data.push(newEc);
        chartEc.update('none');
    }
    // Akış hızı
    if (chartFlow) {
        chartFlow.data.datasets[0].data.shift();
        chartFlow.data.datasets[0].data.push(newFlow);
        chartFlow.update('none');
    }
    // Çözünmüş oksijen
    if (chartOxygen) {
        chartOxygen.data.datasets[0].data.shift();
        chartOxygen.data.datasets[0].data.push(newOxygen);
        chartOxygen.update('none');
    }

    updateCustomChartsLive();

    // Min/Max badge güncelle
    updateMinMaxBadges();
}

// Min/Max Hesaplama ve Badge Güncelleme
function updateMinMaxBadges() {
    state.activeSensorAlarms = [];

    Object.keys(chartConfig).forEach(key => {
        const data = chartConfig[key].history;
        const min = Math.min(...data).toFixed(1);
        const max = Math.max(...data).toFixed(1);
        const el = document.getElementById('minmax-' + key);
        if (el) el.textContent = `↓ ${min} / ↑ ${max}`;

        // Alarm durumunu kontrol et
        const currentVal = data[data.length - 1];
        const cfg = chartConfig[key];
        
        const chartCardEl = document.querySelector(`.chart-card[data-chart="${key}"]`);
        const dashboardCardEl = document.getElementById(`card-${key}`);
        
        const isAlarmActive = currentVal < cfg.idealMin || currentVal > cfg.idealMax;
        const cleanLabel = cfg.label.split(' (')[0].split(' - ')[0];
        
        // Loglama ve Edge Detection
        let currentStatus = 'normal';
        if (currentVal < cfg.idealMin) currentStatus = 'low';
        else if (currentVal > cfg.idealMax) currentStatus = 'high';

        if (lastSensorStates[key] !== currentStatus) {
            if (currentStatus === 'low') {
                if (typeof addLogEntry === 'function') addLogEntry(cleanLabel, 'Düşük Seviye İkazı', 'warning', `${currentVal} ${cfg.unit || ''}`);
            } else if (currentStatus === 'high') {
                if (typeof addLogEntry === 'function') addLogEntry(cleanLabel, 'Yüksek Seviye İkazı', 'warning', `${currentVal} ${cfg.unit || ''}`);
            } else if (lastSensorStates[key] && lastSensorStates[key] !== 'normal') {
                if (typeof addLogEntry === 'function') addLogEntry(cleanLabel, 'Normale Döndü', 'safe', `${currentVal} ${cfg.unit || ''}`);
            }
            lastSensorStates[key] = currentStatus;
        }

        if (isAlarmActive) {
            state.activeSensorAlarms.push(cleanLabel);
        }
        
        [chartCardEl, dashboardCardEl].forEach(el => {
            if (el) {
                if (isAlarmActive) {
                    el.classList.add('alarm-active');
                } else {
                    el.classList.remove('alarm-active');
                }
            }
        });
        
        // Ana kart trend (alt) metni güncelleme
        if (dashboardCardEl) {
            const trendEl = dashboardCardEl.querySelector('.card-trend');
            if (trendEl) {
                if (currentVal < cfg.idealMin) {
                    trendEl.innerHTML = `<i class="ph ph-warning-circle"></i> <span>Düşük Seviye İkazı</span>`;
                    trendEl.style.color = 'var(--accent-red)';
                } else if (currentVal > cfg.idealMax) {
                    trendEl.innerHTML = `<i class="ph ph-warning-circle"></i> <span>Yüksek Seviye İkazı</span>`;
                    trendEl.style.color = 'var(--accent-red)';
                } else {
                    trendEl.innerHTML = `<i class="ph ph-check-circle"></i> <span>Normal Seviyede</span>`;
                    trendEl.style.color = '';
                }
            }
        }
    });
    
    // Sistem durumunu sensör alarmlarına göre güncelle
    updateAlarmUI();
}
// İlk yükleme
updateMinMaxBadges();

// Grafik Detay Modalı ve Geçmiş Tarih Mantığı
let chartModalInstance = null;
let currentModalChartKey = null;

// Tarih değişimi için listener
document.getElementById('chartDateSelect').addEventListener('change', (e) => {
    if (currentModalChartKey) {
        openChartModal(currentModalChartKey, e.target.value);
    }
});

function getChartDataForDate(key, dateStr) {
    const today = new Date().toLocaleDateString('tr-TR').split('.').reverse().join('-'); // YYYY-MM-DD
    const cfg = chartConfig[key];
    
    // Eğer seçilen tarih bugünse gerçek "canlı" geçmişi göster
    if (dateStr === document.getElementById('chartDateSelect').max || !dateStr) {
        return cfg.history;
    }
    
    // Geçmiş tarihse, rastgele tutarlı bir veri üret (seed olarak günü baz almak gibi ama basit random)
    // Tarihten basit bir hash çıkarıp offset belirleyelim
    const dateNum = parseInt(dateStr.replace(/-/g, '')) || 0;
    const randomOffset = ((dateNum % 10) - 5) / 5; // -1 ile 1 arası
    
    const avg = cfg.history.reduce((a, b) => a + b, 0) / cfg.history.length;
    const amplitude = (cfg.maxY - cfg.minY) * 0.08;
    const noiseRange = amplitude * 0.6;
    
    let baseOffset = 0;
    if (key === 'temp') baseOffset = randomOffset * 1.5; 
    if (key === 'tds') baseOffset = randomOffset * 25;
    if (key === 'ph') baseOffset = randomOffset * 0.3;
    if (key === 'hum') baseOffset = randomOffset * 8;

    return Array.from({length: 288}, (_, i) => {
        const hourFraction = (i / 288) * 24;
        const dailyCycle = Math.sin((hourFraction - 6) * Math.PI / 12) * amplitude;
        const noise = (Math.random() - 0.5) * noiseRange;
        return parseFloat((avg + baseOffset + dailyCycle + noise).toFixed(2));
    });
}

function openChartModal(key, targetDate = null) {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js yüklenemedi, grafik modalı açılamıyor.');
        return;
    }

    currentModalChartKey = key;
    const cfg = chartConfig[key];
    
    const todayISO = new Date();
    // YYYY-MM-DD formatında timezone dikkate alarak bugün:
    todayISO.setMinutes(todayISO.getMinutes() - todayISO.getTimezoneOffset());
    const todayStr = todayISO.toISOString().split('T')[0];
    
    const selectedDate = targetDate || todayStr;
    
    const dateInput = document.getElementById('chartDateSelect');
    dateInput.max = todayStr;
    dateInput.value = selectedDate;

    const data = getChartDataForDate(key, selectedDate);
    
    // Anlık değeri, modal içindeki güncel grafik noktasıyla ve istatistikle eşitle
    if (selectedDate === todayStr && typeof state !== 'undefined' && state[key] !== undefined) {
        data[data.length - 1] = parseFloat(state[key].toFixed(2));
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const current = data[data.length - 1];

    // Header
    const iconEl = document.getElementById('chartModalIcon');
    iconEl.className = 'icon-wrapper ' + cfg.iconClass;
    iconEl.innerHTML = `<i class="ph ${cfg.icon}"></i>`;
    document.getElementById('chartModalTitle').textContent = cfg.label;
    
    const badge = document.getElementById('chartModalBadge');
    if (selectedDate === todayStr) {
        badge.textContent = 'Canlı';
        badge.className = 'chart-card-badge ' + cfg.badgeClass;
        badge.style = '';
    } else {
        badge.textContent = 'Geçmiş';
        badge.className = 'chart-card-badge';
        badge.style.background = 'rgba(255, 255, 255, 0.08)';
        badge.style.color = 'var(--text-muted)';
        badge.style.animation = 'none';
        badge.style.border = '1px solid var(--panel-border)';
    }

    // İstatistikler
    document.getElementById('stat-current').textContent = current.toFixed(1) + ' ' + cfg.unit;
    document.getElementById('stat-min').textContent = min.toFixed(1) + ' ' + cfg.unit;
    document.getElementById('stat-max').textContent = max.toFixed(1) + ' ' + cfg.unit;
    document.getElementById('stat-avg').textContent = avg.toFixed(1) + ' ' + cfg.unit;

    // Durum
    const statusEl = document.getElementById('stat-status');
    if (current >= cfg.idealMin && current <= cfg.idealMax) {
        statusEl.textContent = '✅ İdeal Aralıkta';
        statusEl.style.color = 'var(--accent-green)';
    } else {
        statusEl.textContent = '⚠️ Aralık Dışı';
        statusEl.style.color = 'var(--accent-yellow)';
    }

    // Grafik
    if (chartModalInstance) chartModalInstance.destroy();
    const ctx = document.getElementById('chartModalCanvas').getContext('2d');
    chartModalInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [...timeLabels],
            datasets: [
                {
                    label: cfg.label,
                    data: [...data],
                    borderColor: selectedDate === todayStr ? cfg.color : '#94a3b8',
                    backgroundColor: selectedDate === todayStr ? cfg.bg : 'rgba(148, 163, 184, 0.1)',
                    borderWidth: selectedDate === todayStr ? 2.5 : 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 1,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: selectedDate === todayStr ? cfg.color : '#94a3b8',
                },
                {
                    label: 'Max Limit',
                    data: Array(288).fill(cfg.idealMax),
                    borderColor: 'rgba(255, 75, 75, 0.7)',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    pointRadius: 0, pointHoverRadius: 0, fill: false, tension: 0
                },
                {
                    label: 'Min Limit',
                    data: Array(288).fill(cfg.idealMin),
                    borderColor: 'rgba(0, 210, 255, 0.7)',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    pointRadius: 0, pointHoverRadius: 0, fill: false, tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 10,
                    callbacks: {
                        label: function(ctx) {
                            return ` ${cfg.label}: ${ctx.parsed.y.toFixed(1)} ${cfg.unit}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: { color: 'rgba(255, 255, 255, 0.04)' },
                    ticks: { font: { size: 11 }, maxRotation: 0, maxTicksLimit: 16, color: '#64748b' }
                },
                y: {
                    display: true,
                    min: cfg.minY,
                    max: cfg.maxY,
                    grid: { color: 'rgba(255, 255, 255, 0.06)' },
                    ticks: { font: { size: 12 } }
                }
            }
        }
    });

    document.getElementById('chartModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeChartModal(e) {
    if (e) e.stopPropagation();
    document.getElementById('chartModal').classList.remove('active');
    document.body.style.overflow = '';
    if (chartModalInstance) { chartModalInstance.destroy(); chartModalInstance = null; }
}

// Camera Modal Fonksiyonları
function openCameraModal() {
    if (!userCanViewCamera()) return;

    const cameraVideo = document.getElementById('camera-video');
    if (cameraVideo) {
        cameraVideo.muted = true;
        cameraVideo.loop = true;
        cameraVideo.play().catch(error => {
            console.warn('Kamera videosu otomatik başlatılamadı:', error);
        });
    }

    document.getElementById('cameraModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCameraModal(e) {
    if (e) e.stopPropagation();
    document.getElementById('cameraModal').classList.remove('active');
    document.body.style.overflow = '';
    const cameraVideo = document.getElementById('camera-video');
    if (cameraVideo) {
        cameraVideo.pause();
        cameraVideo.currentTime = 0;
    }
}

function startCameraPreview() {
    const previewVideo = document.getElementById('cam-stream');
    if (!previewVideo || previewVideo.tagName !== 'VIDEO') return;

    previewVideo.muted = true;
    previewVideo.loop = true;
    previewVideo.play().catch(error => {
        console.warn('Kamera önizlemesi otomatik başlatılamadı:', error);
    });
}

const productCatalog = {
    'Premium Otomatik Yemleme Makinesi': {
        category: 'Otomatik Yemleme',
        image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=900&auto=format&fit=crop',
        description: 'Programlanabilir yemleme döngüleriyle günlük bakım rutinini sabit tutar. Tatil ve yoğun günlerde akvaryum canlılarının düzenli beslenmesine yardımcı olur.',
        specs: ['Günde çoklu yemleme planı', 'Kuru yem haznesi', 'Manuel yemleme desteği']
    },
    'Akıllı Isıtıcı 300W': {
        category: 'Isı Kontrol',
        image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?q=80&w=900&auto=format&fit=crop',
        description: 'Büyük hacimli akvaryumlarda su sıcaklığını kararlı tutmak için tasarlanmış güçlü ısıtıcıdır.',
        specs: ['300W ısıtma gücü', 'Sabit sıcaklık hedefi', 'Tatlı ve bitkili akvaryumlara uygun']
    },
    'Elektronik pH Ölçer Kalem': {
        category: 'Su Analizi',
        image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=900&auto=format&fit=crop',
        description: 'Akvaryum suyunun pH değerini hızlı kontrol etmek için pratik, taşınabilir ölçüm kalemi.',
        specs: ['Dijital ekran', 'Hızlı ölçüm', 'Periyodik bakım kontrolleri için uygun']
    },
    'CO2 Tüp Sistemi Seti': {
        category: 'Bitkili Akvaryum',
        image: 'https://images.unsplash.com/photo-1532614338840-ab30cf10ed36?q=80&w=900&auto=format&fit=crop',
        description: 'Bitkili akvaryumlarda sağlıklı büyümeyi desteklemek için kontrollü CO2 takviyesi sağlar.',
        specs: ['Basınçlı tüp sistemi', 'Hassas akış kontrolü', 'Yoğun bitkili tanklara uygun']
    },
    'Sıvı Bitki Gübresi (500ml)': {
        category: 'Bitki Bakımı',
        image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?q=80&w=900&auto=format&fit=crop',
        description: 'Akvaryum bitkilerinin renk, kök ve yaprak gelişimini destekleyen sıvı bakım desteği.',
        specs: ['500 ml şişe', 'Haftalık dozlama', 'Bitkili akvaryum rutinleri için']
    },
    'Full Spectrum LED Aydınlatma': {
        category: 'Aydınlatma',
        image: 'https://images.unsplash.com/photo-1551189014-fe516aed0e9e?q=80&w=900&auto=format&fit=crop',
        description: 'Balık renklerini ve bitki dokusunu daha canlı gösteren tam spektrumlu LED aydınlatma.',
        specs: ['Full spectrum ışık', 'Bitki gelişimi desteği', 'Düşük enerji tüketimi']
    },
    'Dış Filtre (1000 L/H)': {
        category: 'Filtrasyon',
        image: 'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?q=80&w=900&auto=format&fit=crop',
        description: 'Yüksek debili dış filtre, mekanik ve biyolojik filtrasyonla su berraklığını korumaya yardımcı olur.',
        specs: ['1000 L/H debi', 'Çok katmanlı filtre sepeti', 'Orta ve büyük tanklar için']
    },
    'Su Düzenleyici Bakteri Kültürü': {
        category: 'Su Düzenleyici',
        image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=900&auto=format&fit=crop',
        description: 'Yeni kurulumlarda ve su değişimlerinde biyolojik dengeyi desteklemek için bakteri kültürü.',
        specs: ['Biyolojik denge desteği', 'Su değişimi sonrası kullanım', 'Filtre bakterilerini destekler']
    },
    'Premium Tetra Balık Yemi': {
        category: 'Balık Yemi',
        image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=900&auto=format&fit=crop',
        description: 'Günlük beslenme için dengeli içerikli, tropikal balıklara uygun premium yem.',
        specs: ['Günlük kullanım', 'Tropikal balıklar için', 'Dengeli besin içeriği']
    },
    'Paslanmaz Çelik Bitki Makası': {
        category: 'Bakım Ekipmanı',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=900&auto=format&fit=crop',
        description: 'Bitkili akvaryumlarda hassas budama ve düzenleme için paslanmaz çelik bakım makası.',
        specs: ['Paslanmaz çelik gövde', 'Hassas bitki budama', 'Aquascape bakımı için']
    }
};

function readAdminContent() {
    return readJsonStorage(ADMIN_CONTENT_KEY, {});
}

function saveAdminContent(content) {
    writeJsonStorage(ADMIN_CONTENT_KEY, content);
}

function normalizeSpecs(specs) {
    if (Array.isArray(specs)) return specs.filter(Boolean);
    return String(specs || '').split('\n').map(item => item.trim()).filter(Boolean);
}

function getProductDisplay(baseTitle) {
    const product = productCatalog[baseTitle] || {};
    const override = readAdminContent().products?.[baseTitle] || {};
    return {
        title: override.title || baseTitle,
        price: override.price || '',
        category: override.category || product.category || '',
        image: override.image || product.image || '',
        description: override.description || product.description || '',
        specs: override.specs ? normalizeSpecs(override.specs) : (product.specs || [])
    };
}

function getAdminEditableItems() {
    const staticItems = [
        {
            key: 'header',
            group: 'Genel',
            label: 'Üst Başlık',
            fields: [
                { name: 'title', label: 'Başlık', selector: '.top-header h2', type: 'text' },
                { name: 'subtitle', label: 'Alt başlık', selector: '.top-header .subtitle', type: 'textarea' }
            ]
        },
        {
            key: 'camera',
            group: 'Sağ Panel',
            label: 'Canlı Kamera',
            fields: [
                { name: 'title', label: 'Kart başlığı', selector: '#card-camera h3', type: 'text' },
                { name: 'video', label: 'Video yolu', selector: '#cam-stream, #camera-video', attr: 'src', type: 'text' }
            ]
        },
        {
            key: 'products-title',
            group: 'Sağ Panel',
            label: 'Önerilen Ürünler Başlığı',
            fields: [
                { name: 'title', label: 'Başlık', selector: '.side-panel-right-header h3', type: 'text' }
            ]
        },
        {
            key: 'footer-brand',
            group: 'Footer',
            label: 'Marka Metni',
            fields: [
                { name: 'title', label: 'Başlık', selector: '.footer-section:nth-child(1) h4', type: 'text' },
                { name: 'text', label: 'Metin', selector: '.footer-section:nth-child(1) p', type: 'textarea' }
            ]
        }
    ];

    const dashboardItems = dashboardPermissionCards.map(card => ({
        key: `dashboard-${card.id}`,
        group: 'Dashboard Kartları',
        label: card.label,
        fields: [
            { name: 'title', label: 'Kart başlığı', selector: `#${card.id} h3`, type: 'text' },
            { name: 'detail', label: 'Durum / açıklama metni', selector: `#${card.id} .card-trend span`, type: 'text' },
            { name: 'icon', label: 'Icon class', selector: `#${card.id} .icon-wrapper i`, type: 'text', mode: 'class' }
        ]
    }));

    return [...staticItems, ...dashboardItems];
}

function getFieldDefault(field) {
    const element = document.querySelector(field.selector);
    if (!element) return '';
    if (field.mode === 'class') return element.className || '';
    if (field.attr) return element.getAttribute(field.attr) || '';
    return element.textContent.trim();
}

function setAdminFieldValue(field, value) {
    document.querySelectorAll(field.selector).forEach(element => {
        if (field.mode === 'class') {
            element.className = value;
            return;
        }
        if (field.attr) {
            element.setAttribute(field.attr, value);
            if (element.tagName === 'VIDEO') {
                element.load();
                element.muted = true;
                element.loop = true;
                element.play().catch(() => {});
            }
            return;
        }
        element.textContent = value;
    });
}

function applyAdminContent() {
    const content = readAdminContent();
    const items = getAdminEditableItems();
    Object.entries(content.items || {}).forEach(([key, values]) => {
        const item = items.find(candidate => candidate.key === key);
        if (!item || !values) return;
        item.fields.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(values, field.name)) {
                setAdminFieldValue(field, values[field.name]);
            }
        });
    });

    document.querySelectorAll('.product-card').forEach(card => {
        const baseTitle = card.dataset.productTitle || card.dataset.baseProductTitle || card.querySelector('.product-title')?.textContent?.trim();
        if (!baseTitle || !productCatalog[baseTitle]) return;
        const product = getProductDisplay(baseTitle);
        const titleEl = card.querySelector('.product-title');
        const priceEl = card.querySelector('.product-price');
        const imageEl = card.querySelector('.product-image');
        if (titleEl) titleEl.textContent = product.title;
        if (priceEl && product.price) priceEl.textContent = product.price;
        if (imageEl && product.image) imageEl.innerHTML = `<img src="${product.image}" alt="${escapeHtml(product.title)}" loading="lazy">`;
    });
}

function initProductCards() {
    document.querySelectorAll('.product-card').forEach(card => {
        const titleEl = card.querySelector('.product-title');
        const priceEl = card.querySelector('.product-price');
        const imageEl = card.querySelector('.product-image');
        const button = card.querySelector('.add-btn');
        if (!titleEl || !priceEl || !imageEl || !button) return;

        const title = titleEl.textContent.trim();
        const product = getProductDisplay(title);
        if (!product) return;

        card.dataset.productTitle = title;
        card.dataset.baseProductTitle = title;
        titleEl.textContent = product.title;
        if (product.price) priceEl.textContent = product.price;
        imageEl.innerHTML = `<img src="${product.image}" alt="${escapeHtml(product.title)}" loading="lazy">`;

        button.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            openProductModal(title, priceEl.textContent.trim());
        });

        card.addEventListener('click', event => {
            event.preventDefault();
            openProductModal(title, priceEl.textContent.trim());
        });
    });
}

function openProductModal(title, price) {
    const product = getProductDisplay(title);
    if (!product) return;

    document.getElementById('productModalImage').src = product.image;
    document.getElementById('productModalImage').alt = product.title;
    document.getElementById('productModalCategory').textContent = product.category;
    document.getElementById('productModalTitle').textContent = product.title;
    document.getElementById('productModalDescription').textContent = product.description;
    document.getElementById('productModalPrice').textContent = price;
    document.getElementById('productModalSpecs').innerHTML = product.specs.map(spec => `<span>${spec}</span>`).join('');

    document.getElementById('productModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal(e) {
    if (e) e.stopPropagation();
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = '';
}

function showAdminStatus(message, type = 'success') {
    const status = document.getElementById('admin-panel-status');
    if (!status) return;
    status.textContent = message;
    status.className = `admin-panel-status ${type}`;
}

function renderAdminContentEditor(selectedKey) {
    const select = document.getElementById('admin-content-select');
    const root = document.getElementById('admin-content-fields');
    if (!select || !root) return;

    const items = getAdminEditableItems();
    const content = readAdminContent();
    const activeKey = selectedKey || select.value || items[0]?.key;
    select.innerHTML = items.map(item => `<option value="${item.key}" ${item.key === activeKey ? 'selected' : ''}>${escapeHtml(item.group)} / ${escapeHtml(item.label)}</option>`).join('');

    const item = items.find(candidate => candidate.key === activeKey) || items[0];
    const values = content.items?.[item.key] || {};
    root.innerHTML = item.fields.map(field => {
        const value = Object.prototype.hasOwnProperty.call(values, field.name) ? values[field.name] : getFieldDefault(field);
        const input = field.type === 'textarea'
            ? `<textarea class="setting-input admin-field-input" data-admin-field="${field.name}" rows="4">${escapeHtml(value)}</textarea>`
            : `<input class="setting-input admin-field-input" data-admin-field="${field.name}" type="text" value="${escapeHtml(value)}">`;
        return `<div class="input-group"><label>${escapeHtml(field.label)}</label>${input}</div>`;
    }).join('');
}

function renderAdminProductEditor(selectedTitle) {
    const select = document.getElementById('admin-product-select');
    const root = document.getElementById('admin-product-fields');
    if (!select || !root) return;

    const titles = Object.keys(productCatalog);
    const activeTitle = selectedTitle || select.value || titles[0];
    select.innerHTML = titles.map(title => `<option value="${escapeHtml(title)}" ${title === activeTitle ? 'selected' : ''}>${escapeHtml(getProductDisplay(title).title)}</option>`).join('');

    const product = getProductDisplay(activeTitle);
    const currentPrice = product.price || Array.from(document.querySelectorAll('.product-card')).find(card => card.dataset.baseProductTitle === activeTitle || card.dataset.productTitle === activeTitle)?.querySelector('.product-price')?.textContent?.trim() || '';
    root.innerHTML = `
        <div class="input-group"><label>Urun adi</label><input class="setting-input" id="admin-product-title" type="text" value="${escapeHtml(product.title)}"></div>
        <div class="input-group"><label>Fiyat</label><input class="setting-input" id="admin-product-price" type="text" value="${escapeHtml(currentPrice)}"></div>
        <div class="input-group"><label>Kategori</label><input class="setting-input" id="admin-product-category" type="text" value="${escapeHtml(product.category)}"></div>
        <div class="input-group"><label>Gorsel yolu veya secilen dosya</label><input class="setting-input" id="admin-product-image" type="text" value="${escapeHtml(product.image)}"><input class="admin-file-input" id="admin-product-image-file" type="file" accept="image/*"></div>
        <div class="input-group"><label>Aciklama</label><textarea class="setting-input" id="admin-product-description" rows="4">${escapeHtml(product.description)}</textarea></div>
        <div class="input-group"><label>Ozellikler</label><textarea class="setting-input" id="admin-product-specs" rows="4">${escapeHtml(product.specs.join('\n'))}</textarea></div>
    `;

    document.getElementById('admin-product-image-file')?.addEventListener('change', event => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const input = document.getElementById('admin-product-image');
            if (input) input.value = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function renderCustomCardsList() {
    const root = document.getElementById('admin-custom-cards-list');
    if (!root) return;
    const cards = getCustomCards();
    root.innerHTML = cards.length ? cards.map(card => `
        <div class="admin-custom-row">
            <div><strong>${escapeHtml(card.title)}</strong><span>${card.type === 'sensor' ? 'Sensor karti' : 'Kontrol karti'} · ${isDashboardCardDeleted(`card-${card.key}`) ? 'Silinenlerde' : 'Aktif'}</span></div>
            <button type="button" data-delete-custom-card="${escapeHtml(card.key)}" title="Silinenlere tasi"><i class="ph ph-trash"></i></button>
        </div>
    `).join('') : '<p class="admin-empty-note">Henuz ozel kart olusturulmadi.</p>';

    root.querySelectorAll('[data-delete-custom-card]').forEach(button => {
        button.addEventListener('click', () => {
            const key = button.dataset.deleteCustomCard;
            const id = `card-${key}`;
            const nextState = getDashboardCardState();
            nextState.hidden = nextState.hidden.filter(item => item !== id);
            if (!nextState.deleted.includes(id)) nextState.deleted.push(id);
            saveDashboardCardState(nextState);
            applyDashboardCardState();
            renderDashboardCardManager();
            renderCustomCardsList();
            showAdminStatus('Ozel kart silinenler listesine tasindi.');
        });
    });
}
function renderDashboardCardManager() {
    const activeRoot = document.getElementById('admin-dashboard-card-list');
    const deletedRoot = document.getElementById('admin-dashboard-deleted-list');
    if (!activeRoot || !deletedRoot) return;

    const cardState = getDashboardCardState();
    const cards = getDashboardCardMeta();
    const activeCards = cards.filter(card => !cardState.deleted.includes(card.id));
    const deletedCards = cards.filter(card => cardState.deleted.includes(card.id));

    activeRoot.innerHTML = activeCards.length ? activeCards.map(card => `
        <div class="admin-dashboard-card-row">
            <label class="admin-card-visible-toggle">
                <input type="checkbox" data-dashboard-card-visible="${escapeHtml(card.id)}" ${cardState.hidden.includes(card.id) ? '' : 'checked'}>
                <span>${escapeHtml(card.label)}</span>
            </label>
            <button type="button" data-dashboard-card-delete="${escapeHtml(card.id)}" title="Kartı sil"><i class="ph ph-trash"></i></button>
        </div>
    `).join('') : '<p class="admin-empty-note">Aktif dashboard kartı yok.</p>';

    deletedRoot.innerHTML = deletedCards.length ? deletedCards.map(card => `
        <div class="admin-dashboard-card-row deleted">
            <div>
                <strong>${escapeHtml(card.label)}</strong>
                <span>Silinmiş kart</span>
            </div>
            <button type="button" data-dashboard-card-restore="${escapeHtml(card.id)}" title="Geri getir"><i class="ph ph-arrow-counter-clockwise"></i></button>
        </div>
    `).join('') : '<p class="admin-empty-note">Silinen kart bulunmuyor.</p>';

    activeRoot.querySelectorAll('[data-dashboard-card-visible]').forEach(input => {
        input.addEventListener('change', () => {
            const id = input.dataset.dashboardCardVisible;
            const nextState = getDashboardCardState();
            nextState.deleted = nextState.deleted.filter(item => item !== id);
            if (input.checked) {
                nextState.hidden = nextState.hidden.filter(item => item !== id);
            } else if (!nextState.hidden.includes(id)) {
                nextState.hidden.push(id);
            }
            saveDashboardCardState(nextState);
            applyDashboardCardState();
            showAdminStatus(input.checked ? 'Kart dashboardda gorunur yapildi.' : 'Kart dashboarddan gizlendi.');
        });
    });

    activeRoot.querySelectorAll('[data-dashboard-card-delete]').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.dashboardCardDelete;
            const nextState = getDashboardCardState();
            nextState.hidden = nextState.hidden.filter(item => item !== id);
            if (!nextState.deleted.includes(id)) nextState.deleted.push(id);
            saveDashboardCardState(nextState);
            applyDashboardCardState();
            renderDashboardCardManager();
            renderCustomCardsList();
            showAdminStatus('Kart silinenler listesine tasindi.');
        });
    });

    deletedRoot.querySelectorAll('[data-dashboard-card-restore]').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.dashboardCardRestore;
            const nextState = getDashboardCardState();
            nextState.deleted = nextState.deleted.filter(item => item !== id);
            nextState.hidden = nextState.hidden.filter(item => item !== id);
            saveDashboardCardState(nextState);
            applyDashboardCardState();
            renderDashboardCardManager();
            renderCustomCardsList();
            showAdminStatus('Kart dashboarda geri getirildi.');
        });
    });
}

function updateCustomCardFormMode() {
    const type = document.getElementById('admin-card-type')?.value || 'sensor';
    document.querySelectorAll('[data-card-mode]').forEach(el => {
        el.style.display = el.dataset.cardMode === type ? '' : 'none';
    });
}

function initAdminPanel() {
    const root = document.getElementById('admin-panel-root');
    if (!root) return;

    root.innerHTML = `
        <div class="admin-panel-toolbar glass-panel">
            <div><strong>Tam Yetkili Kontrol Paneli</strong><span>Bu alan sadece can kullanicisina gorunur. Degisiklikler bu tarayicida kalici saklanir.</span></div>
            <button class="toggle-btn danger-btn" id="btn-admin-reset" type="button">Tum Panel Degisikliklerini Sifirla</button>
        </div>
        <div class="admin-panel-status" id="admin-panel-status"></div>
        <div class="admin-editor-grid">
            <div class="sensor-card glass-panel admin-editor-card">
                <div class="card-header"><div class="icon-wrapper"><i class="ph ph-layout"></i></div><h3>Site Icerikleri</h3></div>
                <div class="input-group"><label>Duzenlenecek alan</label><select class="setting-input" id="admin-content-select"></select></div>
                <div class="admin-fields" id="admin-content-fields"></div>
                <button class="toggle-btn filter-btn" id="btn-admin-save-content" type="button">Alani Kaydet</button>
            </div>
            <div class="sensor-card glass-panel admin-editor-card">
                <div class="card-header"><div class="icon-wrapper"><i class="ph ph-shopping-bag"></i></div><h3>Urunler ve Gorseller</h3></div>
                <div class="input-group"><label>Urun</label><select class="setting-input" id="admin-product-select"></select></div>
                <div class="admin-fields" id="admin-product-fields"></div>
                <button class="toggle-btn filter-btn" id="btn-admin-save-product" type="button">Urunu Kaydet</button>
            </div>
            <div class="sensor-card glass-panel admin-editor-card admin-editor-card-wide">
                <div class="card-header"><div class="icon-wrapper"><i class="ph ph-eye"></i></div><h3>Dashboard Kart Yonetimi</h3></div>
                <div class="admin-card-manager-layout">
                    <div>
                        <h4>Aktif Kartlar</h4>
                        <div class="admin-dashboard-card-list" id="admin-dashboard-card-list"></div>
                    </div>
                    <div>
                        <h4>Silinen Kartlar</h4>
                        <div class="admin-dashboard-card-list deleted-list" id="admin-dashboard-deleted-list"></div>
                    </div>
                </div>
            </div>
            <div class="sensor-card glass-panel admin-editor-card admin-editor-card-wide">
                <div class="card-header"><div class="icon-wrapper"><i class="ph ph-plus-circle"></i></div><h3>Dashboard Karti Olustur</h3></div>
                <div class="admin-fields admin-fields-three">
                    <div class="input-group"><label>Kart basligi</label><input class="setting-input" id="admin-card-title" type="text" placeholder="Orn. Su Isiticisi"></div>
                    <div class="input-group"><label>Kart anahtari</label><input class="setting-input" id="admin-card-key" type="text" placeholder="su-isiticisi"></div>
                    <div class="input-group"><label>Kart tipi</label><select class="setting-input" id="admin-card-type"><option value="sensor">Sensor karti</option><option value="control">Kontrol karti</option></select></div>
                    <div class="input-group"><label>Icon class</label><input class="setting-input" id="admin-card-icon" type="text" value="ph-gauge"></div>
                    <div class="input-group"><label>Renk</label><input class="setting-input" id="admin-card-color" type="color" value="#22d3ee"></div>
                    <div class="input-group"><label>Aciklama</label><input class="setting-input" id="admin-card-description" type="text" placeholder="Kart aciklamasi"></div>
                    <div class="input-group" data-card-mode="sensor"><label>Birim</label><input class="setting-input" id="admin-card-unit" type="text" placeholder="C, ppm, L/dk"></div>
                    <div class="input-group" data-card-mode="sensor"><label>Baslangic degeri</label><input class="setting-input" id="admin-card-base" type="number" step="0.1" value="25"></div>
                    <div class="input-group" data-card-mode="sensor"><label>Minimum deger</label><input class="setting-input" id="admin-card-min" type="number" step="0.1" value="20"></div>
                    <div class="input-group" data-card-mode="sensor"><label>Maksimum deger</label><input class="setting-input" id="admin-card-max" type="number" step="0.1" value="30"></div>
                    <div class="input-group" data-card-mode="sensor"><label>Grafik alt sinir</label><input class="setting-input" id="admin-card-chart-min" type="number" step="0.1" value="0"></div>
                    <div class="input-group" data-card-mode="sensor"><label>Grafik ust sinir</label><input class="setting-input" id="admin-card-chart-max" type="number" step="0.1" value="100"></div>
                    <div class="input-group" data-card-mode="control"><label>Baslangic modu</label><select class="setting-input" id="admin-card-mode"><option value="auto">Otomatik</option><option value="manual">Manuel</option></select></div>
                </div>
                <div class="user-form-actions"><button class="toggle-btn filter-btn" id="btn-admin-save-card" type="button">Karti Olustur</button></div>
                <div class="admin-custom-cards-list" id="admin-custom-cards-list"></div>
            </div>
        </div>
    `;

    renderAdminContentEditor();
    renderAdminProductEditor();
    renderDashboardCardManager();
    renderCustomCardsList();
    updateCustomCardFormMode();

    document.getElementById('admin-content-select')?.addEventListener('change', event => renderAdminContentEditor(event.target.value));
    document.getElementById('admin-product-select')?.addEventListener('change', event => renderAdminProductEditor(event.target.value));
    document.getElementById('admin-card-type')?.addEventListener('change', updateCustomCardFormMode);
    document.getElementById('admin-card-title')?.addEventListener('input', event => {
        const keyInput = document.getElementById('admin-card-key');
        if (keyInput && !keyInput.dataset.touched) keyInput.value = slugifyCardKey(event.target.value);
    });
    document.getElementById('admin-card-key')?.addEventListener('input', event => {
        event.target.dataset.touched = 'true';
        event.target.value = slugifyCardKey(event.target.value);
    });

    document.getElementById('btn-admin-save-content')?.addEventListener('click', () => {
        const item = getAdminEditableItems().find(candidate => candidate.key === document.getElementById('admin-content-select')?.value);
        if (!item) return;
        const content = readAdminContent();
        content.items = content.items || {};
        content.items[item.key] = {};
        item.fields.forEach(field => {
            const input = document.querySelector(`[data-admin-field="${field.name}"]`);
            if (input) content.items[item.key][field.name] = input.value;
        });
        saveAdminContent(content);
        applyAdminContent();
        showAdminStatus('Icerik kaydedildi ve siteye uygulandi.');
    });

    document.getElementById('btn-admin-save-product')?.addEventListener('click', () => {
        const title = document.getElementById('admin-product-select')?.value;
        if (!title) return;
        const content = readAdminContent();
        content.products = content.products || {};
        content.products[title] = {
            title: document.getElementById('admin-product-title')?.value || title,
            price: document.getElementById('admin-product-price')?.value || '',
            category: document.getElementById('admin-product-category')?.value || '',
            image: document.getElementById('admin-product-image')?.value || '',
            description: document.getElementById('admin-product-description')?.value || '',
            specs: document.getElementById('admin-product-specs')?.value || ''
        };
        saveAdminContent(content);
        applyAdminContent();
        renderAdminProductEditor(title);
        showAdminStatus('Urun kaydedildi.');
    });

    document.getElementById('btn-admin-save-card')?.addEventListener('click', () => {
        const title = document.getElementById('admin-card-title')?.value.trim();
        const key = slugifyCardKey(document.getElementById('admin-card-key')?.value || title);
        const type = document.getElementById('admin-card-type')?.value || 'sensor';
        if (!title || !key) {
            showAdminStatus('Kart basligi ve anahtari zorunlu.', 'error');
            return;
        }

        const cards = readCustomCards().filter(card => card.key !== key);
        cards.push({
            key,
            title,
            type,
            icon: document.getElementById('admin-card-icon')?.value.trim() || (type === 'control' ? 'ph-power' : 'ph-gauge'),
            color: document.getElementById('admin-card-color')?.value || '#22d3ee',
            description: document.getElementById('admin-card-description')?.value || '',
            unit: document.getElementById('admin-card-unit')?.value || '',
            base: parseFloat(document.getElementById('admin-card-base')?.value || '0'),
            min: parseFloat(document.getElementById('admin-card-min')?.value || '0'),
            max: parseFloat(document.getElementById('admin-card-max')?.value || '100'),
            chartMin: parseFloat(document.getElementById('admin-card-chart-min')?.value || '0'),
            chartMax: parseFloat(document.getElementById('admin-card-chart-max')?.value || '100'),
            mode: document.getElementById('admin-card-mode')?.value || 'auto'
        });
        writeJsonStorage(CUSTOM_CARDS_KEY, cards);
        showAdminStatus('Kart kaydedildi. Dashboard, ayarlar ve grafikler yenileniyor...');
        window.setTimeout(() => location.reload(), 700);
    });

    document.getElementById('btn-admin-reset')?.addEventListener('click', () => {
        if (!confirm('Yonetim panelindeki icerik ve ozel kart degisiklikleri silinsin mi?')) return;
        localStorage.removeItem(ADMIN_CONTENT_KEY);
        localStorage.removeItem(CUSTOM_CARDS_KEY);
        localStorage.removeItem(DASHBOARD_CARD_STATE_KEY);
        location.reload();
    });
}
// Ayarları Kaydetme Mantığı
document.getElementById('btn-save-settings').addEventListener('click', () => {
    saveWhatsAppSettings();
    saveTelegramSettings();

    chartConfig.temp.idealMin = parseFloat(document.getElementById('set-temp-min').value);
    chartConfig.temp.idealMax = parseFloat(document.getElementById('set-temp-max').value);
    
    chartConfig.tds.idealMin = parseFloat(document.getElementById('set-tds-min').value);
    chartConfig.tds.idealMax = parseFloat(document.getElementById('set-tds-max').value);
    
    chartConfig.ph.idealMin = parseFloat(document.getElementById('set-ph-min').value);
    chartConfig.ph.idealMax = parseFloat(document.getElementById('set-ph-max').value);
    
    chartConfig.hum.idealMin = parseFloat(document.getElementById('set-hum-min').value);
    chartConfig.hum.idealMax = parseFloat(document.getElementById('set-hum-max').value);

    if (document.getElementById('set-flow-min')) {
        chartConfig.flow.idealMin = parseFloat(document.getElementById('set-flow-min').value);
        chartConfig.flow.idealMax = parseFloat(document.getElementById('set-flow-max').value);
    }

    if (document.getElementById('set-oxygen-min')) {
        chartConfig.oxygen.idealMin = parseFloat(document.getElementById('set-oxygen-min').value);
        chartConfig.oxygen.idealMax = parseFloat(document.getElementById('set-oxygen-max').value);
    }
    
    if (document.getElementById('set-co2-min')) {
        chartConfig.co2.idealMin = parseFloat(document.getElementById('set-co2-min').value);
        chartConfig.co2.idealMax = parseFloat(document.getElementById('set-co2-max').value);
    }
    
    if (document.getElementById('set-ec-min')) {
        chartConfig.ec.idealMin = parseFloat(document.getElementById('set-ec-min').value);
        chartConfig.ec.idealMax = parseFloat(document.getElementById('set-ec-max').value);
    }

    getCustomCards().filter(card => card.type === 'sensor').forEach(card => {
        const minInput = document.getElementById(`set-${card.key}-min`);
        const maxInput = document.getElementById(`set-${card.key}-max`);
        if (chartConfig[card.key] && minInput && maxInput) {
            chartConfig[card.key].idealMin = parseFloat(minInput.value);
            chartConfig[card.key].idealMax = parseFloat(maxInput.value);
        }
    });

    const settingsPayload = {
        temp: { idealMin: chartConfig.temp.idealMin, idealMax: chartConfig.temp.idealMax },
        tds: { idealMin: chartConfig.tds.idealMin, idealMax: chartConfig.tds.idealMax },
        ph: { idealMin: chartConfig.ph.idealMin, idealMax: chartConfig.ph.idealMax },
        hum: { idealMin: chartConfig.hum.idealMin, idealMax: chartConfig.hum.idealMax },
        flow: { idealMin: chartConfig.flow.idealMin, idealMax: chartConfig.flow.idealMax },
        oxygen: { idealMin: chartConfig.oxygen.idealMin, idealMax: chartConfig.oxygen.idealMax },
        co2: { idealMin: chartConfig.co2.idealMin, idealMax: chartConfig.co2.idealMax },
        ec: { idealMin: chartConfig.ec.idealMin, idealMax: chartConfig.ec.idealMax }
    };

    getCustomCards().filter(card => card.type === 'sensor').forEach(card => {
        if (chartConfig[card.key]) {
            settingsPayload[card.key] = {
                idealMin: chartConfig[card.key].idealMin,
                idealMax: chartConfig[card.key].idealMax
            };
        }
    });

    localStorage.setItem('akvardinioSettings', JSON.stringify(settingsPayload));

    updateMinMaxBadges();

    const chartInstances = [
        { instance: chartTemp, key: 'temp' },
        { instance: chartTds, key: 'tds' },
        { instance: chartPh, key: 'ph' },
        { instance: chartHum, key: 'hum' },
        { instance: chartCo2, key: 'co2' },
        { instance: chartEc, key: 'ec' },
        { instance: chartFlow, key: 'flow' },
        { instance: chartOxygen, key: 'oxygen' },
        ...Object.entries(customChartInstances).map(([key, instance]) => ({ key, instance }))
    ];

    chartInstances.forEach(item => {
        if (item.instance && item.instance.data.datasets.length > 1) {
            item.instance.data.datasets[1].data = Array(288).fill(chartConfig[item.key].idealMax);
            item.instance.data.datasets[2].data = Array(288).fill(chartConfig[item.key].idealMin);
            item.instance.update('none');
        }
    });

    if (chartModalInstance && currentModalChartKey) {
        if (chartModalInstance.data.datasets.length > 1) {
            chartModalInstance.data.datasets[1].data = Array(288).fill(chartConfig[currentModalChartKey].idealMax);
            chartModalInstance.data.datasets[2].data = Array(288).fill(chartConfig[currentModalChartKey].idealMin);
            chartModalInstance.update('none');
        }
        
        // Modal durumunu da (✅ / ⚠️) anlık güncelle
        const currentData = chartModalInstance.data.datasets[0].data;
        const currentVal = currentData[currentData.length - 1];
        const statusEl = document.getElementById('stat-status');
        const cfg = chartConfig[currentModalChartKey];
        if (currentVal >= cfg.idealMin && currentVal <= cfg.idealMax) {
            statusEl.textContent = '✅ İdeal Aralıkta';
            statusEl.style.color = 'var(--accent-green)';
        } else {
            statusEl.textContent = '⚠️ Aralık Dışı';
            statusEl.style.color = 'var(--accent-yellow)';
        }
    }

    // Alarm sınıflarını (dashboard) anında güncelle
    updateMinMaxBadges();

    // Görsel geribildirim
    const btn = document.getElementById('btn-save-settings');
    const originalText = btn.textContent;
    btn.textContent = 'Kaydedildi! ✓';
    btn.style.background = '#10b981';
    btn.style.color = '#fff';
    btn.style.borderColor = '#10b981';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
    }, 2000);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const camModal = document.getElementById('cameraModal');
        if (camModal && camModal.classList.contains('active')) closeCameraModal();
        const chartModalEl = document.getElementById('chartModal');
        if (chartModalEl && chartModalEl.classList.contains('active')) closeChartModal();
        const productModalEl = document.getElementById('productModal');
        if (productModalEl && productModalEl.classList.contains('active')) closeProductModal();
        const termModal = document.getElementById('terminalModal');
        if (termModal && termModal.classList.contains('active')) termModal.classList.remove('active');
    }
});

// Terminal Görünümü Kontrolleri
let terminalPaused = false;
const btnTerminal = document.getElementById('btn-terminal');
const terminalOutput = document.getElementById('terminal-output');
const btnTermClear = document.getElementById('btn-term-clear');
const btnTermPause = document.getElementById('btn-term-pause');

if (btnTerminal) {
    btnTerminal.addEventListener('click', () => {
        const termNav = document.querySelector('.nav-item[data-view="terminal-view"]');
        if(termNav) termNav.click();
    });
}
if (btnTermClear) {
    btnTermClear.addEventListener('click', () => {
        if(terminalOutput) terminalOutput.innerHTML = '<div style="color: #64748b; margin-bottom: 10px; text-align: center;">--- Ekran Temizlendi ---</div>';
    });
}
if (btnTermPause) {
    btnTermPause.addEventListener('click', () => {
        terminalPaused = !terminalPaused;
        btnTermPause.innerHTML = terminalPaused ? '<i class="ph ph-play"></i> Devam Et' : '<i class="ph ph-pause"></i> Duraklat';
        if(terminalPaused) {
            btnTermPause.style.background = 'rgba(16, 185, 129, 0.15)';
            btnTermPause.style.color = 'var(--accent-green)';
        } else {
            btnTermPause.style.background = 'rgba(255,255,255,0.1)';
            btnTermPause.style.color = 'var(--text-main)';
        }
    });
}

// Terminale Veri Yazdırma Fonksiyonu
function logToTerminal(dataObj) {
    if (terminalPaused || !terminalOutput) return;
    
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const jsonStr = JSON.stringify(dataObj);
    
    const line = document.createElement('div');
    line.style.borderBottom = '1px dashed #1e293b';
    line.style.paddingBottom = '4px';
    line.style.marginBottom = '4px';
    line.style.wordBreak = 'break-all';
    line.innerHTML = `<span style="color: #64748b;">[${time}]</span> <span style="color: #38bdf8;">RX</span> > <span style="color: #c7d2fe;">${jsonStr}</span>`;
    
    terminalOutput.appendChild(line);
    
    // Satır sayısını sınırla (Performans için max 100 satır)
    while (terminalOutput.childNodes.length > 100) {
        terminalOutput.removeChild(terminalOutput.firstChild);
    }
    
    // Otomatik aşağı kaydır
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Terminal açıldığında boş görünmemesi için geriye dönük 20 satır sanal log ekle
function prefillTerminal() {
    try {
        if (!terminalOutput) return;
        
        let simTemp = 25.0;
        let simHum = 60.0;
        let simTds = 200.0;
        let simPh = 7.0;
        let simCo2 = 25.0;
        
        for (let i = 20; i > 0; i--) {
            simTemp += (Math.random() - 0.5) * 0.2;
            simHum += (Math.random() - 0.5) * 1.0;
            simTds += (Math.random() - 0.5) * 2.0;
            simPh += (Math.random() - 0.5) * 0.05;
            simCo2 += (Math.random() - 0.5) * 1.0;
            
            const time = new Date();
            time.setSeconds(time.getSeconds() - (i * 2));
            
            const dataObj = {
                temp: parseFloat(simTemp.toFixed(2)),
                hum: parseFloat(simHum.toFixed(2)),
                tds: parseFloat(simTds.toFixed(2)),
                ph: parseFloat(simPh.toFixed(2)),
                co2: parseFloat(simCo2.toFixed(2)),
                flood: false,
                pump: true,
                light: true,
                filter: true,
                cooling: false,
                air: true
            };
            
            const jsonStr = JSON.stringify(dataObj);
            const timeStr = time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            const line = document.createElement('div');
            line.style.borderBottom = '1px dashed #1e293b';
            line.style.paddingBottom = '4px';
            line.style.marginBottom = '4px';
            line.style.wordBreak = 'break-all';
            line.innerHTML = `<span style="color: #64748b;">[${timeStr}]</span> <span style="color: #38bdf8;">RX</span> > <span style="color: #c7d2fe;">${jsonStr}</span>`;
            
            terminalOutput.appendChild(line);
        }
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    } catch (e) {
        console.error("Prefill Error: ", e);
    }
}

// Uygulama yüklenirken terminali doldur
prefillTerminal();

// Sürükle ve Bırak (Drag & Drop) Özelliği
function initDragAndDrop() {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;

    let draggedEl = null;
    let lastSwapTarget = null;
    const cardSelector = ':scope > .sensor-card, :scope > .sensor-overview-card';
    const getCards = () => Array.from(grid.querySelectorAll(cardSelector));
    let cards = getCards();

    const animateCardMove = (moveCallback) => {
        const firstRects = new Map(getCards().map(card => [card, card.getBoundingClientRect()]));
        moveCallback();
        const movedCards = getCards();

        movedCards.forEach(card => {
            const first = firstRects.get(card);
            if (!first) return;

            const last = card.getBoundingClientRect();
            const deltaX = first.left - last.left;
            const deltaY = first.top - last.top;

            if (!deltaX && !deltaY) return;

            card.style.transition = 'none';
            card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            card.offsetHeight;
            card.style.transition = '';
            card.style.transform = '';
        });

        cards = movedCards;
    };

    const saveOrder = () => {
        const newOrder = getCards().map(c => c.id).filter(Boolean);
        localStorage.setItem('akvardinioGridOrder', JSON.stringify(newOrder));
    };

    // Kayıtlı sırayı yükle
    const savedOrder = localStorage.getItem('akvardinioGridOrder');
    if (savedOrder) {
        try {
            const orderArr = JSON.parse(savedOrder);
            orderArr.forEach(id => {
                const card = document.getElementById(id);
                if (card && card.parentElement && card.parentElement.classList.contains('dashboard-grid') && card.matches('.sensor-card, .sensor-overview-card')) {
                    grid.appendChild(card); // En sona ekleyerek sırayı yeniden oluşturur
                }
            });
            // Kart sırası DOM'da değiştiği için listeyi güncelle
            cards = getCards();
        } catch(e) { console.error('DnD load error', e); }
    }

    // Event listener'ları bağla
    cards.forEach(card => {
        card.classList.add('dashboard-draggable');
        card.setAttribute('draggable', 'true');

        card.addEventListener('dragstart', function(e) {
            if (e.target.closest('.overview-sensor-item')) {
                return;
            }
            draggedEl = this;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.id);
            setTimeout(() => this.classList.add('dragging'), 0);
        });

        card.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            cards.forEach(c => c.classList.remove('drag-over'));
            saveOrder();
            draggedEl = null;
            lastSwapTarget = null;
        });

        card.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            if (draggedEl && draggedEl !== this && lastSwapTarget !== this) {
                lastSwapTarget = this;
                const gridCards = getCards();
                const draggedIndex = gridCards.indexOf(draggedEl);
                const targetIndex = gridCards.indexOf(this);

                animateCardMove(() => {
                    if (draggedIndex < targetIndex) {
                        this.after(draggedEl);
                    } else {
                        this.before(draggedEl);
                    }
                });
            }

            return false;
        });

        card.addEventListener('dragenter', function(e) {
            e.preventDefault();
            if (this !== draggedEl) {
                this.classList.add('drag-over');
            }
        });

        card.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
            if (lastSwapTarget === this) {
                lastSwapTarget = null;
            }
        });

        card.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('drag-over');

            if (draggedEl && draggedEl !== this && draggedEl.parentElement === grid) {
                const gridCards = getCards();
                const draggedIndex = gridCards.indexOf(draggedEl);
                const targetIndex = gridCards.indexOf(this);

                if (draggedIndex !== targetIndex) {
                    animateCardMove(() => {
                        if (draggedIndex < targetIndex) {
                            this.after(draggedEl);
                        } else {
                            this.before(draggedEl);
                        }
                    });
                }

                saveOrder();
            }
            return false;
        });
    });
}

function initOverviewItemDragAndDrop() {
    document.querySelectorAll('.overview-sensor-grid').forEach((grid, groupIndex) => {
        const groupKey = grid.closest('.sensor-overview-card')?.id || `overview-group-${groupIndex}`;
        const getItems = () => Array.from(grid.querySelectorAll(':scope > .overview-sensor-item'));
        let draggedItem = null;
        let lastSwapTarget = null;
        let items = getItems();

        const itemKey = (item) => item.getAttribute('data-overview-chart') || item.querySelector('.overview-label')?.textContent?.trim() || '';

        const animateItemMove = (moveCallback) => {
            const firstRects = new Map(getItems().map(item => [item, item.getBoundingClientRect()]));
            moveCallback();
            const movedItems = getItems();

            movedItems.forEach(item => {
                const first = firstRects.get(item);
                if (!first) return;

                const last = item.getBoundingClientRect();
                const deltaX = first.left - last.left;
                const deltaY = first.top - last.top;
                if (!deltaX && !deltaY) return;

                item.style.transition = 'none';
                item.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                item.offsetHeight;
                item.style.transition = '';
                item.style.transform = '';
            });

            items = movedItems;
        };

        const saveOrder = () => {
            localStorage.setItem(`akvardinioOverviewOrder:${groupKey}`, JSON.stringify(getItems().map(itemKey).filter(Boolean)));
        };

        const savedOrder = localStorage.getItem(`akvardinioOverviewOrder:${groupKey}`);
        if (savedOrder) {
            try {
                JSON.parse(savedOrder).forEach(key => {
                    const item = getItems().find(candidate => itemKey(candidate) === key);
                    if (item) grid.appendChild(item);
                });
                items = getItems();
            } catch (error) {
                console.warn('Özet kart sırası okunamadı:', error);
            }
        }

        items.forEach(item => {
            item.classList.add('overview-draggable');
            item.setAttribute('draggable', 'true');

            item.addEventListener('dragstart', function(e) {
                e.stopPropagation();
                draggedItem = this;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', itemKey(this));
                setTimeout(() => this.classList.add('dragging'), 0);
            });

            item.addEventListener('dragend', function(e) {
                e.stopPropagation();
                this.classList.remove('dragging');
                items.forEach(candidate => candidate.classList.remove('drag-over'));
                saveOrder();
                draggedItem = null;
                lastSwapTarget = null;
                overviewItemDragJustEnded = true;
                setTimeout(() => { overviewItemDragJustEnded = false; }, 80);
            });

            item.addEventListener('dragover', function(e) {
                if (!draggedItem) return;
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';

                if (draggedItem !== this && lastSwapTarget !== this) {
                    lastSwapTarget = this;
                    const currentItems = getItems();
                    const draggedIndex = currentItems.indexOf(draggedItem);
                    const targetIndex = currentItems.indexOf(this);

                    animateItemMove(() => {
                        if (draggedIndex < targetIndex) {
                            this.after(draggedItem);
                        } else {
                            this.before(draggedItem);
                        }
                    });
                }
            });

            item.addEventListener('dragenter', function(e) {
                if (!draggedItem || draggedItem === this) return;
                e.preventDefault();
                e.stopPropagation();
                this.classList.add('drag-over');
            });

            item.addEventListener('dragleave', function(e) {
                e.stopPropagation();
                this.classList.remove('drag-over');
                if (lastSwapTarget === this) {
                    lastSwapTarget = null;
                }
            });

            item.addEventListener('drop', function(e) {
                if (!draggedItem) return;
                e.preventDefault();
                e.stopPropagation();
                this.classList.remove('drag-over');
                saveOrder();
            });
        });
    });
}

function getDashboardMinimizedKey() {
    return currentUser?.username ? `akvardinioMinimizedCards:${currentUser.username}` : 'akvardinioMinimizedCards';
}

function readDashboardMinimizedSet() {
    const values = readJsonStorage(getDashboardMinimizedKey(), []);
    return new Set(Array.isArray(values) ? values : []);
}

function saveDashboardMinimizedSet(minimized) {
    writeJsonStorage(getDashboardMinimizedKey(), [...minimized]);
}

function getDashboardRootCards() {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return [];
    return Array.from(grid.querySelectorAll(':scope > .sensor-card, :scope > .sensor-overview-card')).filter(card => card.id);
}

function ensureDashboardMinimizedDock() {
    let dock = document.getElementById('dashboard-minimized-dock');
    if (dock) return dock;

    dock = document.createElement('div');
    dock.id = 'dashboard-minimized-dock';
    dock.className = 'dashboard-minimized-dock';

    const banner = document.querySelector('.top-banner');
    if (banner?.parentElement) {
        banner.insertAdjacentElement('afterend', dock);
    }

    return dock;
}

function getDashboardCardIconClass(card) {
    return card.querySelector('.icon-wrapper i')?.className || 'ph ph-square';
}

function getDashboardCardTitle(card) {
    return card.querySelector('h3')?.textContent?.trim() || 'Dashboard kartı';
}

function refreshDashboardMinimizedDock() {
    const dock = ensureDashboardMinimizedDock();
    if (!dock) return;

    const minimized = readDashboardMinimizedSet();
    dock.innerHTML = '';

    getDashboardRootCards().forEach(card => {
        const isAdminHidden = card.classList.contains('admin-card-hidden');
        const isMinimized = minimized.has(card.id);
        card.classList.toggle('dashboard-card-hidden', isMinimized && !isAdminHidden);
        if (!isMinimized || isAdminHidden) return;

        const item = document.createElement('div');
        item.className = 'minimized-card-item';
        item.dataset.minimizedCard = card.id;

        const button = document.createElement('button');
        button.className = 'minimized-card-button';
        button.type = 'button';
        button.title = `${getDashboardCardTitle(card)} kartını geri getir`;
        button.innerHTML = `<i class="${getDashboardCardIconClass(card)}"></i>`;
        button.addEventListener('click', () => {
            minimized.delete(card.id);
            saveDashboardMinimizedSet(minimized);
            card.classList.remove('dashboard-card-hidden');
            refreshDashboardMinimizedDock();
        });

        const label = document.createElement('span');
        label.className = 'minimized-card-label';
        label.textContent = getDashboardCardTitle(card);

        item.appendChild(button);
        item.appendChild(label);
        dock.appendChild(item);
    });

    dock.classList.toggle('dashboard-minimized-dock-empty', !dock.children.length);
    const activeView = document.querySelector('.view-section.active')?.id;
    dock.classList.toggle('dashboard-dock-hidden-by-view', activeView && activeView !== 'dashboard-view');
}

function initDashboardCardMinimize() {
    const minimized = readDashboardMinimizedSet();

    getDashboardRootCards().forEach(card => {
        card.querySelector('.dashboard-card-minimize')?.remove();

        const header = card.querySelector('.card-header, .overview-card-header');
        if (!header) return;

        header.classList.add('dashboard-card-header-with-actions');

        let actions = header.querySelector('.dashboard-card-actions');
        if (!actions) {
            actions = document.createElement('div');
            actions.className = 'dashboard-card-actions';
            header.appendChild(actions);
        }

        const button = document.createElement('button');
        button.className = 'dashboard-card-minimize';
        button.type = 'button';
        button.title = 'Kartı küçült';
        button.innerHTML = '<i class="ph ph-x"></i>';
        button.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            const nextMinimized = readDashboardMinimizedSet();
            nextMinimized.add(card.id);
            saveDashboardMinimizedSet(nextMinimized);
            card.classList.add('dashboard-card-hidden');
            refreshDashboardMinimizedDock();
        });
        button.addEventListener('dragstart', event => event.stopPropagation());
        actions.appendChild(button);
    });

    refreshDashboardMinimizedDock();
}

function initMobileNavMenu() {
    const sidebar = document.querySelector('.sidebar');
    const navMenu = document.querySelector('.nav-menu');
    const footer = document.querySelector('.main-footer');
    const sidePanel = document.querySelector('.side-panel-right');
    const topHeader = document.querySelector('.top-header');
    const topBanner = document.querySelector('.top-banner');
    const productsPanel = document.querySelector('.products-panel');
    if (!sidebar || !navMenu || !footer) return;

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const originalParent = navMenu.parentElement;
    const originalNextSibling = navMenu.nextSibling;
    const originalSidePanelParent = sidePanel?.parentElement || null;
    const originalSidePanelNextSibling = sidePanel?.nextSibling || null;
    const originalBannerParent = topBanner?.parentElement || null;
    const originalBannerNextSibling = topBanner?.nextSibling || null;
    const originalProductsParent = productsPanel?.parentElement || null;
    const originalProductsNextSibling = productsPanel?.nextSibling || null;

    const host = document.createElement('div');
    host.className = 'mobile-nav-host glass-panel';
    host.innerHTML = `
        <button class="mobile-nav-toggle" type="button" aria-expanded="false">
            <span><i class="ph ph-list"></i> Menü</span>
            <i class="ph ph-caret-down mobile-nav-caret"></i>
        </button>
        <div class="mobile-nav-panel"></div>
    `;

    const toggle = host.querySelector('.mobile-nav-toggle');
    const panel = host.querySelector('.mobile-nav-panel');

    const setOpen = (open) => {
        host.classList.toggle('mobile-nav-open', open);
        toggle?.setAttribute('aria-expanded', String(open));
    };

    toggle?.addEventListener('click', () => {
        setOpen(!host.classList.contains('mobile-nav-open'));
    });

    navMenu.addEventListener('click', (event) => {
        if (event.target.closest('.nav-item')) {
            setOpen(false);
        }
    });

    const restoreDesktopNav = () => {
        if (originalParent && navMenu.parentElement !== originalParent) {
            if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
                originalParent.insertBefore(navMenu, originalNextSibling);
            } else {
                originalParent.appendChild(navMenu);
            }
        }
        host.remove();
        sidebar.classList.remove('mobile-nav-source-hidden');
        if (sidePanel && originalSidePanelParent && sidePanel.parentElement !== originalSidePanelParent) {
            if (originalSidePanelNextSibling && originalSidePanelNextSibling.parentNode === originalSidePanelParent) {
                originalSidePanelParent.insertBefore(sidePanel, originalSidePanelNextSibling);
            } else {
                originalSidePanelParent.appendChild(sidePanel);
            }
        }
        if (topBanner && originalBannerParent && topBanner.parentElement !== originalBannerParent) {
            if (originalBannerNextSibling && originalBannerNextSibling.parentNode === originalBannerParent) {
                originalBannerParent.insertBefore(topBanner, originalBannerNextSibling);
            } else {
                originalBannerParent.appendChild(topBanner);
            }
        }
        if (productsPanel && originalProductsParent && productsPanel.parentElement !== originalProductsParent) {
            if (originalProductsNextSibling && originalProductsNextSibling.parentNode === originalProductsParent) {
                originalProductsParent.insertBefore(productsPanel, originalProductsNextSibling);
            } else {
                originalProductsParent.appendChild(productsPanel);
            }
        }
        setOpen(false);
    };

    const applyMobileNav = () => {
        if (mediaQuery.matches) {
            if (!host.isConnected) {
                topHeader?.insertAdjacentElement('afterend', host);
            }
            if (sidePanel && sidePanel.previousElementSibling !== host) {
                host.insertAdjacentElement('afterend', sidePanel);
            }
            if (topBanner && topBanner.nextElementSibling !== footer) {
                footer.parentElement?.insertBefore(topBanner, footer);
            }
            if (productsPanel && productsPanel.previousElementSibling !== topBanner) {
                topBanner?.insertAdjacentElement('afterend', productsPanel);
            }
            if (navMenu.parentElement !== panel) {
                panel.appendChild(navMenu);
            }
            sidebar.classList.add('mobile-nav-source-hidden');
        } else {
            restoreDesktopNav();
        }
    };

    applyMobileNav();
    mediaQuery.addEventListener('change', applyMobileNav);
}

// Simulation Initialization
document.addEventListener('DOMContentLoaded', () => {
    initUsersPage();
    initAuth();
    renderCustomCards();
    applyUserPermissions();
    initCharts();
    initDragAndDrop();
    initOverviewItemDragAndDrop();
    initDashboardCardMinimize();
    initMobileNavMenu();
    initWhatsAppTestButton();
    initTelegramTestButton();
    startCameraPreview();
    initProductCards();
    initAdminPanel();
    applyAdminContent();
    initLightingAutomation();
    updateLightDashboardUI();
    
    // YÖNTEM 1: Simülasyon Verisi (Test için aktif)
    setInterval(simulateData, 2000);
    simulateData(); 

    // YÖNTEM 2: Gerçek ESP32 Verisi (Gerçek kullanım için üsttekileri silip alttakileri yorumdan çıkarın)
    /*
    const ESP32_IP = "http://192.168.1.100"; // Kendi ESP32 IP adresinizi yazın
    
    async function fetchRealData() {
        try {
            const response = await fetch(`${ESP32_IP}/data`);
            const data = await response.json();
            
            // Temel sensör verileri
            state.temp = data.temp;
            state.hum = data.hum;
            state.tds = data.tds;
            elTemp.textContent = data.temp.toFixed(1);
            elHum.textContent = Math.round(data.hum);
            elTds.textContent = Math.round(data.tds);
            
            updateChartsLive(data.temp, data.tds, data.ph, data.hum);
            
            // pH verisi
            state.ph = data.ph;
            updatePhUI();
            updateSensorOverviewCard();
            
            // Taşkın & Pompa durumu
            state.floodDetected = data.flood;
            state.pumpActive = data.pumpActive;
            updateAlarmUI();
            
            // Işık durumu
            state.lightOn = data.lightOn;
            updateLightDashboardUI();
        } catch (error) {
            console.error("ESP32'ye bağlanılamadı!", error);
        }
    }
    
    setInterval(fetchRealData, 2000);
    fetchRealData();
    */
});

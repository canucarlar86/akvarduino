const authKey = 'ankistAdminSession';
const settingsKey = 'ankistSiteSettings';
const app = document.getElementById('adminApp');

const defaultSettings = {
    siteMeta: {
        brandName: 'ANKIST',
        brandSubtitle: 'Kurumsal Hizmetler',
        introText: 'Devam etmek istediğiniz kurumsal hizmet alanını seçin.',
        footerText: 'Mimarlık ve zayıf akım sistemlerinde proje, uygulama ve teslim sonrası destek süreçlerini tek kurumsal çatı altında topluyoruz.'
    },
    contact: {
        email: 'info@ankist.com.tr',
        phone: '+90 000 000 00 00',
        address: 'Istanbul, Türkiye'
    },
    sectors: {
        architecture: {
            label: 'ANKIST Mimarlık',
            title: 'Yaşam ve çalışma alanları için ölçülü, uygulanabilir mimari.',
            lead: 'Konut, ticari alan ve karma kullanımlı projelerde tasarımdan uygulama koordinasyonuna kadar bütüncül mimarlık hizmeti sunuyoruz.',
            image: 'Resimler/site/mimarlik-hero.png',
            cta: 'Mimari Teklif Al',
            services: [
                ['fa-pencil-ruler', 'Mimari Proje', 'Konsept, avan, ruhsat ve uygulama projelerini disiplinler arası koordinasyonla hazırlarız.'],
                ['fa-drafting-compass', 'İç Mimari', 'Malzeme, mobilya, aydınlatma ve mekan kurgusunu kullanıcı deneyimiyle birlikte planlarız.'],
                ['fa-hard-hat', 'Uygulama Danışmanlığı', 'Saha sürecinde detay, metraj, keşif ve imalat kontrolüyle projenin doğru uygulanmasını destekleriz.']
            ],
            steps: [
                ['Analiz', 'Arsa, yapı, ihtiyaç programı ve mevzuat koşullarını değerlendiririz.'],
                ['Tasarım', 'Alternatifleri karşılaştırır, seçilen kurguyu netleştiririz.'],
                ['Projelendirme', 'Ruhsat ve uygulama paftalarını teknik detaylarla hazırlarız.'],
                ['Uygulama', 'Malzeme, imalat ve disiplin koordinasyonunu takip ederiz.']
            ]
        },
        systems: {
            label: 'ANKIST Zayıf Akım Sistemleri',
            title: 'Binalar için güvenilir, ölçeklenebilir ve entegre teknik altyapı.',
            lead: 'Güvenlik, haberleşme, yangın algılama, network ve otomasyon sistemlerinde projelendirme, kurulum ve devreye alma hizmetleri sunuyoruz.',
            image: 'Resimler/site/zayif-akim-hero.png',
            cta: 'Keşif Talep Et',
            services: [
                ['fa-video', 'CCTV ve Güvenlik', 'Kamera, kayıt, izleme, çevre güvenliği ve uzaktan erişim altyapılarını projelendirip devreye alırız.'],
                ['fa-fingerprint', 'Geçiş Kontrol', 'Kartlı geçiş, turnike, kapı kontrolü ve yetkilendirme senaryolarını işletme yapısına göre kurgularız.'],
                ['fa-network-wired', 'Network Altyapısı', 'Rack kabin, yapısal kablolama, switch, fiber ve kablosuz ağ çözümlerini ölçeklenebilir şekilde kurarız.']
            ],
            steps: [
                ['Keşif', 'Saha koşullarını, riskleri ve kullanım senaryolarını analiz ederiz.'],
                ['Proje', 'Tek hat, kolon, cihaz yerleşimi ve kablolama güzergahlarını hazırlarız.'],
                ['Kurulum', 'Kablolama, montaj, etiketleme ve pano düzenini standartlara uygun tamamlarız.'],
                ['Devreye Alma', 'Test, eğitim, teslim dokümanı ve bakım planıyla sistemi kullanıma açarız.']
            ]
        }
    },
    pages: {
        choice: { title: 'ANKIST', label: 'ankist.com.tr', image: 'Resimler/site/mimarlik-hero.png' },
        about: { title: 'Hakkımızda', label: 'ANKIST', image: 'Resimler/site/mimarlik-hero.png' },
        service: { title: 'Hizmetler', label: 'ANKIST', image: 'Resimler/site/zayif-akim-hero.png' },
        feature: {
            title: 'Neden ANKIST?', label: 'Süreç ve kalite', image: 'Resimler/site/zayif-akim-hero.png',
            heading: 'Tasarım, teknik altyapı ve uygulama kararlarını birlikte yönetiriz',
            centerImage: 'template/img/feature.jpg',
            items: [
                ['fa-map', 'Keşif ve analiz', 'Karar almadan önce saha, mevzuat, kullanım ve risk koşullarını görünür hale getiririz.'],
                ['fa-file-signature', 'Belgeli teslim', 'Proje, metraj, cihaz listesi, test ve teslim dokümanlarını sürecin parçasına dönüştürürüz.'],
                ['fa-users-cog', 'Tek ekip dili', 'Mimari ve teknik sistem kararlarını aynı proje ritmi içinde takip ederiz.'],
                ['fa-headset', 'Destek yaklaşımı', 'Teslimden sonra bakım, revizyon ve genişleme ihtiyaçları için izlenebilir destek sunarız.']
            ]
        },
        price: {
            title: 'Hizmet Paketleri', label: 'Planlı kapsam', image: 'Resimler/site/mimarlik-hero.png',
            plans: [
                ['Keşif', 'Başlangıç', ['Saha veya ihtiyaç görüşmesi', 'Ön değerlendirme', 'Kapsam notu']],
                ['Proje', 'Planlama', ['Mimari/teknik proje dokümanı', 'Metraj ve malzeme ön listesi', 'Takvim ve koordinasyon']],
                ['Uygulama', 'Teslim', ['Saha uygulama yönetimi', 'Test ve kontrol', 'Teslim dokümanları']]
            ]
        },
        team: {
            title: 'Uzmanlık Alanları', label: 'Ekip dili', image: 'Resimler/site/zayif-akim-hero.png',
            items: [
                ['template/img/team-1.jpg', 'Mimari Tasarım', 'Konsept, ruhsat ve uygulama projeleri'],
                ['template/img/team-2.jpg', 'Teknik Sistemler', 'Zayıf akım, network ve güvenlik altyapıları'],
                ['template/img/team-3.jpg', 'Saha Koordinasyonu', 'İmalat, test ve teslim süreci']
            ]
        },
        testimonial: {
            title: 'Referans Yaklaşımı', label: 'Deneyim', image: 'Resimler/site/mimarlik-hero.png',
            items: [
                ['template/img/testimonial-1.jpg', 'ANKIST Süreci', 'Kurumsal proje', 'Net kapsam, doğru takvim ve belgeli teslim bizim için en kritik beklentiydi.'],
                ['template/img/testimonial-2.jpg', 'ANKIST Süreci', 'Kurumsal proje', 'Teknik sistemlerde genişleme ihtiyacını baştan düşünen bir kurgu oluştu.']
            ]
        },
        quote: {
            title: 'Teklif Al', label: 'Proje talebi', image: 'Resimler/site/zayif-akim-hero.png',
            heading: 'Projenizin kapsamını birlikte netleştirelim.',
            text: 'İhtiyaç, saha koşulu, hedef takvim ve teslim beklentisini birlikte okuyarak size doğru hizmet kapsamıyla döneriz.'
        },
        contact: {
            title: 'İletişim', label: 'ANKIST', image: 'Resimler/site/mimarlik-hero.png',
            eyebrow: 'Bize Ulaşın',
            heading: 'Projeniz için ilk görüşmeyi planlayalım.'
        },
        blog: {
            title: 'Bilgi Merkezi', label: 'ANKIST notları', image: 'Resimler/site/zayif-akim-hero.png',
            posts: [
                ['Resimler/site/mimarlik-hero.png', 'Mimari projeye başlamadan önce netleştirilmesi gerekenler', 'İhtiyaç programı, mevzuat ve bütçe dengesini proje başında okumak süreci rahatlatır.'],
                ['Resimler/site/zayif-akim-hero.png', 'Zayıf akım altyapısında ölçeklenebilirlik neden önemlidir?', 'Network, güvenlik ve otomasyon sistemleri doğru planlandığında bina yaşadıkça büyüyebilir.']
            ]
        },
        detail: {
            title: 'Proje Planlama Rehberi', label: 'Bilgi Merkezi', image: 'Resimler/site/mimarlik-hero.png',
            bodyTitle: 'Doğru başlangıç, daha rahat uygulama demektir.',
            paragraphs: [
                'ANKIST sürecinde ilk adım, ihtiyacı yalnızca iş listesi olarak değil; kullanıcı, mekan, teknik altyapı, takvim ve bütçe beklentisiyle birlikte okumaktır.',
                'Bu yaklaşım, proje ilerledikçe süren belirsizlikleri azaltır ve uygulama ekipleri arasında ortak bir dil oluşturur.'
            ],
            sideTitle: 'Hızlı Başlangıç',
            sideItems: ['İhtiyaç programı', 'Saha bilgileri', 'Hedef takvim', 'Bütçe aralığı']
        }
    }
};

const sections = [
    { id: 'choice', title: 'Açılış Sayfası', type: 'choice', url: 'index.html' },
    { id: 'architecture', title: 'Mimarlık Alanı', type: 'sector', url: 'mimarlik.html' },
    { id: 'systems', title: 'Zayıf Akım Alanı', type: 'sector', url: 'zayif-akim.html' },
    { id: 'about', title: 'Hakkımızda', type: 'page', url: 'about.html' },
    { id: 'service', title: 'Hizmetler', type: 'page', url: 'service.html' },
    { id: 'feature', title: 'Neden Biz', type: 'page', url: 'feature.html' },
    { id: 'price', title: 'Hizmet Paketleri', type: 'page', url: 'price.html' },
    { id: 'team', title: 'Uzmanlıklar', type: 'page', url: 'team.html' },
    { id: 'testimonial', title: 'Referans Yaklaşımı', type: 'page', url: 'testimonial.html' },
    { id: 'quote', title: 'Teklif Al', type: 'page', url: 'quote.html' },
    { id: 'contact', title: 'İletişim', type: 'page', url: 'contact.html' },
    { id: 'blog', title: 'Bilgi Merkezi', type: 'page', url: 'blog.html' },
    { id: 'detail', title: 'Planlama Rehberi', type: 'page', url: 'detail.html' },
    { id: 'advanced', title: 'Tüm Veri / JSON', type: 'advanced', url: 'index.html' }
];

let activeSection = 'choice';

function deepMerge(base, override) {
    return Object.keys(base).reduce((next, key) => {
        if (Array.isArray(base[key])) {
            next[key] = Array.isArray(override?.[key]) ? override[key] : base[key];
            return next;
        }

        if (base[key] && typeof base[key] === 'object') {
            next[key] = deepMerge(base[key], override?.[key] || {});
            return next;
        }

        next[key] = override?.[key] || base[key];
        return next;
    }, {});
}

function getSettings() {
    try {
        return deepMerge(defaultSettings, JSON.parse(localStorage.getItem(settingsKey)) || {});
    } catch (error) {
        return structuredClone(defaultSettings);
    }
}

function saveSettings(settings) {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
}

function isLoggedIn() {
    return sessionStorage.getItem(authKey) === 'can';
}

function read(id) {
    return document.getElementById(id).value.trim();
}

function write(id, value) {
    const input = document.getElementById(id);
    if (input) input.value = value ?? '';
}

function renderLogin(error = '') {
    app.innerHTML = `
        <section class="admin-shell d-flex align-items-center justify-content-center py-5">
            <div class="card admin-login-card">
                <div class="card-body p-5">
                    <div class="text-center mb-4">
                        <span class="admin-brand mb-3">A</span>
                        <h1 class="h3 mb-2">ANKIST Yönetim Paneli</h1>
                        <p class="mb-0">Devam etmek için yetkili kullanıcı bilgisi girin.</p>
                    </div>
                    <form id="loginForm">
                        <label class="form-label" for="username">Kullanıcı adı</label>
                        <input id="username" class="form-control mb-3" autocomplete="username" required>
                        <label class="form-label" for="password">Şifre</label>
                        <input id="password" type="password" class="form-control mb-3" autocomplete="current-password" required>
                        <p class="text-danger admin-status">${error}</p>
                        <button class="btn btn-primary w-100 py-3" type="submit"><i class="fa fa-lock me-2"></i>Giriş Yap</button>
                    </form>
                    <div class="alert alert-warning mt-4 mb-0 small">Bu panel statik site içinde çalışır. Yayın ortamında gerçek güvenlik için sunucu taraflı giriş sistemi gerekir.</div>
                </div>
            </div>
        </section>`;

    document.getElementById('loginForm').addEventListener('submit', (event) => {
        event.preventDefault();
        if (read('username').toLowerCase() === 'can' && read('password') === '1234') {
            sessionStorage.setItem(authKey, 'can');
            renderPanel();
            return;
        }
        renderLogin('Kullanıcı adı veya şifre hatalı.');
    });
}

function renderPanel() {
    const settings = getSettings();
    const section = sections.find(item => item.id === activeSection) || sections[0];
    app.innerHTML = `
        <section class="admin-shell py-5">
            <div class="container-fluid px-3 px-lg-5 py-4">
                <div class="row g-4">
                    <div class="col-xl-3 col-lg-4">
                        <aside class="admin-sidebar p-4">
                            <h1 class="h3 text-white mb-4"><span class="brand-symbol">A</span>ANKIST</h1>
                            <label class="form-label text-white-50" for="sectionSelect">Yönetilecek alan</label>
                            <select id="sectionSelect" class="form-select mb-4">
                                ${sections.map(item => `<option value="${item.id}" ${item.id === activeSection ? 'selected' : ''}>${item.title}</option>`).join('')}
                            </select>
                            <div class="admin-section-list">
                                ${sections.map(item => `<a href="#" data-section="${item.id}" class="${item.id === activeSection ? 'active' : ''}"><i class="fa fa-angle-right"></i>${item.title}</a>`).join('')}
                            </div>
                            <hr class="border-light opacity-25">
                            <a href="${section.url}" target="_blank"><i class="fa fa-external-link-alt"></i>Seçili Sayfayı Aç</a>
                            <a href="#" id="logoutButton"><i class="fa fa-sign-out-alt"></i>Çıkış</a>
                        </aside>
                    </div>
                    <div class="col-xl-9 col-lg-8">
                        <div class="card admin-panel-card">
                            <div class="card-body p-4 p-lg-5">
                                <div class="d-flex flex-wrap justify-content-between gap-3 mb-4">
                                    <div>
                                        <p class="text-primary text-uppercase fw-bold mb-1">İçerik Yönetimi</p>
                                        <h2 class="mb-1">${section.title}</h2>
                                        <p class="mb-0">Metinleri, görsel yollarını ve liste içeriklerini düzenleyebilirsiniz.</p>
                                    </div>
                                    <div class="d-flex gap-2 align-items-start">
                                        <button id="resetButton" class="btn btn-outline-danger"><i class="fa fa-undo me-2"></i>Varsayılana Dön</button>
                                        <a class="btn btn-dark" href="${section.url}" target="_blank"><i class="fa fa-eye me-2"></i>Önizle</a>
                                    </div>
                                </div>
                                <form id="settingsForm">${renderEditor(section, settings)}</form>
                                <p id="status" class="admin-status text-success mt-4 mb-0"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>`;

    bindPanelActions();
}

function renderEditor(section, settings) {
    if (section.type === 'choice') return renderChoiceEditor(settings);
    if (section.type === 'sector') return renderSectorEditor(section.id, settings.sectors[section.id]);
    if (section.type === 'page') return renderPageEditor(section.id, settings.pages[section.id]);
    return renderAdvancedEditor(settings);
}

function field(id, label, value, type = 'text') {
    return `<div class="mb-3"><label class="form-label" for="${id}">${label}</label><input id="${id}" type="${type}" class="form-control" value="${escapeAttr(value)}"></div>`;
}

function area(id, label, value, rows = 3) {
    return `<div class="mb-3"><label class="form-label" for="${id}">${label}</label><textarea id="${id}" class="form-control" rows="${rows}">${escapeHtml(value || '')}</textarea></div>`;
}

function imageField(id, label, value) {
    return `
        <div class="mb-3">
            <label class="form-label" for="${id}">${label}</label>
            <input id="${id}" class="form-control mb-2" value="${escapeAttr(value)}">
            <div class="d-flex flex-wrap gap-2 align-items-center">
                <input type="file" class="form-control admin-file-input" accept="image/*" data-target="${id}">
                <img class="admin-image-preview" src="${escapeAttr(value)}" alt="${label}">
            </div>
            <small class="text-muted">Dosya seçerseniz görsel tarayıcı hafızasına base64 olarak kaydedilir. Yayına almak için kalıcı dosya yolu kullanmak daha sağlıklıdır.</small>
        </div>`;
}

function jsonArea(id, label, value) {
    return area(id, label, JSON.stringify(value || [], null, 2), 10);
}

function renderChoiceEditor(settings) {
    return `
        <div class="row g-4">
            <div class="col-lg-6">
                <h3 class="mb-4">Açılış ve Marka</h3>
                ${field('brandName', 'Marka adı', settings.siteMeta.brandName)}
                ${field('brandSubtitle', 'Marka alt başlığı', settings.siteMeta.brandSubtitle)}
                ${area('introText', 'Açılış açıklaması', settings.siteMeta.introText)}
                ${area('footerText', 'Footer açıklaması', settings.siteMeta.footerText)}
                ${imageField('choiceImage', 'Açılış arka plan görseli', settings.pages.choice.image)}
            </div>
            <div class="col-lg-6">
                <h3 class="mb-4">İletişim</h3>
                ${field('email', 'E-posta', settings.contact.email, 'email')}
                ${field('phone', 'Telefon', settings.contact.phone)}
                ${field('address', 'Adres', settings.contact.address)}
                ${field('choiceLabel', 'Açılış küçük başlık', settings.pages.choice.label)}
                ${field('choiceTitle', 'Açılış ana başlık', settings.pages.choice.title)}
            </div>
        </div>
        ${formButtons()}`;
}

function renderSectorEditor(key, sector) {
    return `
        <div class="row g-4">
            <div class="col-lg-6">
                ${field('sectorLabel', 'Alan adı / kart başlığı', sector.label)}
                ${area('sectorTitle', 'Hero başlığı', sector.title)}
                ${area('sectorLead', 'Açıklama', sector.lead)}
                ${field('sectorCta', 'Buton metni', sector.cta)}
                ${imageField('sectorImage', 'Alan görseli', sector.image)}
            </div>
            <div class="col-lg-6">
                ${jsonArea('sectorServices', 'Hizmet kartları JSON [ikon, başlık, metin]', sector.services)}
                ${jsonArea('sectorSteps', 'Süreç adımları JSON [başlık, metin]', sector.steps)}
            </div>
        </div>
        ${formButtons()}`;
}

function renderPageEditor(key, page) {
    const arrayKeys = Object.keys(page).filter(name => Array.isArray(page[name]));
    const specialKeys = Object.keys(page).filter(name => !['title', 'label', 'image'].includes(name) && !Array.isArray(page[name]));
    return `
        <div class="row g-4">
            <div class="col-lg-6">
                ${field('pageTitle', 'Sayfa başlığı', page.title)}
                ${field('pageLabel', 'Küçük başlık', page.label)}
                ${imageField('pageImage', 'Hero / sayfa görseli', page.image)}
                ${specialKeys.map(name => typeof page[name] === 'string' ? area(`page_${name}`, labelize(name), page[name]) : '').join('')}
            </div>
            <div class="col-lg-6">
                ${arrayKeys.map(name => jsonArea(`page_${name}`, `${labelize(name)} JSON`, page[name])).join('') || '<div class="alert alert-info">Bu sayfada düzenlenebilir liste alanı yok.</div>'}
            </div>
        </div>
        ${formButtons()}`;
}

function renderAdvancedEditor(settings) {
    return `
        <div class="alert alert-warning">Bu bölüm tüm yönetilebilir veriye doğrudan erişim sağlar. JSON yapısını bozarsanız sayfa render edilemeyebilir.</div>
        ${area('advancedJson', 'Tüm site verisi JSON', JSON.stringify(settings, null, 2), 24)}
        ${formButtons()}`;
}

function formButtons() {
    return `
        <div class="d-flex flex-wrap gap-3 mt-4">
            <button class="btn btn-primary py-3 px-5" type="submit"><i class="fa fa-save me-2"></i>Kaydet</button>
            <button class="btn btn-secondary py-3 px-5" type="button" id="exportButton"><i class="fa fa-file-export me-2"></i>JSON Dışa Aktar</button>
        </div>`;
}

function bindPanelActions() {
    document.getElementById('sectionSelect').addEventListener('change', (event) => {
        activeSection = event.target.value;
        renderPanel();
    });

    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            activeSection = link.dataset.section;
            renderPanel();
        });
    });

    document.getElementById('settingsForm').addEventListener('submit', (event) => {
        event.preventDefault();
        try {
            const settings = collectSettings();
            saveSettings(settings);
            setStatus('Değişiklikler kaydedildi. Açık önizleme sayfasını yenileyerek görebilirsiniz.');
        } catch (error) {
            setStatus(error.message, true);
        }
    });

    document.getElementById('resetButton').addEventListener('click', () => {
        localStorage.removeItem(settingsKey);
        renderPanel();
    });

    document.getElementById('logoutButton').addEventListener('click', (event) => {
        event.preventDefault();
        sessionStorage.removeItem(authKey);
        renderLogin();
    });

    document.getElementById('exportButton')?.addEventListener('click', () => {
        const settings = collectSettings();
        navigator.clipboard?.writeText(JSON.stringify(settings, null, 2));
        setStatus('JSON panoya kopyalandı.');
    });

    document.querySelectorAll('.admin-file-input').forEach(input => {
        input.addEventListener('change', () => handleImageUpload(input));
    });
}

function collectSettings() {
    const settings = getSettings();
    const section = sections.find(item => item.id === activeSection);

    if (section.type === 'choice') {
        settings.siteMeta.brandName = read('brandName') || defaultSettings.siteMeta.brandName;
        settings.siteMeta.brandSubtitle = read('brandSubtitle') || defaultSettings.siteMeta.brandSubtitle;
        settings.siteMeta.introText = read('introText') || defaultSettings.siteMeta.introText;
        settings.siteMeta.footerText = read('footerText') || defaultSettings.siteMeta.footerText;
        settings.contact.email = read('email') || defaultSettings.contact.email;
        settings.contact.phone = read('phone') || defaultSettings.contact.phone;
        settings.contact.address = read('address') || defaultSettings.contact.address;
        settings.pages.choice.label = read('choiceLabel') || defaultSettings.pages.choice.label;
        settings.pages.choice.title = read('choiceTitle') || defaultSettings.pages.choice.title;
        settings.pages.choice.image = read('choiceImage') || defaultSettings.pages.choice.image;
    }

    if (section.type === 'sector') {
        const sector = settings.sectors[section.id];
        sector.label = read('sectorLabel') || defaultSettings.sectors[section.id].label;
        sector.title = read('sectorTitle') || defaultSettings.sectors[section.id].title;
        sector.lead = read('sectorLead') || defaultSettings.sectors[section.id].lead;
        sector.cta = read('sectorCta') || defaultSettings.sectors[section.id].cta;
        sector.image = read('sectorImage') || defaultSettings.sectors[section.id].image;
        sector.services = parseJson('sectorServices');
        sector.steps = parseJson('sectorSteps');
    }

    if (section.type === 'page') {
        const page = settings.pages[section.id];
        page.title = read('pageTitle') || defaultSettings.pages[section.id].title;
        page.label = read('pageLabel') || defaultSettings.pages[section.id].label;
        page.image = read('pageImage') || defaultSettings.pages[section.id].image;
        Object.keys(page).forEach(key => {
            if (['title', 'label', 'image'].includes(key)) return;
            const input = document.getElementById(`page_${key}`);
            if (!input) return;
            page[key] = Array.isArray(page[key]) ? parseJson(`page_${key}`) : input.value.trim();
        });
    }

    if (section.type === 'advanced') {
        return JSON.parse(read('advancedJson'));
    }

    return settings;
}

function parseJson(id) {
    try {
        return JSON.parse(read(id) || '[]');
    } catch (error) {
        throw new Error(`${id} alanındaki JSON geçerli değil.`);
    }
}

function handleImageUpload(input) {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        const target = document.getElementById(input.dataset.target);
        target.value = reader.result;
        input.closest('.mb-3').querySelector('.admin-image-preview').src = reader.result;
        setStatus('Görsel seçildi. Kalıcı olması için Kaydet düğmesine basın.');
    };
    reader.readAsDataURL(file);
}

function setStatus(message, isError = false) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.classList.toggle('text-danger', isError);
    status.classList.toggle('text-success', !isError);
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
}

function labelize(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase());
}

if (isLoggedIn()) {
    renderPanel();
} else {
    renderLogin();
}

const page = document.body.dataset.page || 'choice';
const settingsKey = 'ankistSiteSettings';

function readSiteSettings() {
    try {
        return JSON.parse(localStorage.getItem(settingsKey)) || {};
    } catch (error) {
        return {};
    }
}

function mergeObject(base, override) {
    return Object.keys(base).reduce((next, key) => {
        if (Array.isArray(base[key])) {
            next[key] = Array.isArray(override?.[key]) ? override[key] : base[key];
            return next;
        }

        if (base[key] && typeof base[key] === 'object') {
            next[key] = mergeObject(base[key], override?.[key] || {});
            return next;
        }

        next[key] = override?.[key] || base[key];
        return next;
    }, {});
}

const defaultSiteMeta = {
    brandName: 'ANKIST',
    brandSubtitle: 'Kurumsal Hizmetler',
    introText: 'Devam etmek istediğiniz kurumsal hizmet alanını seçin.',
    footerText: 'Mimarlık ve zayıf akım sistemlerinde proje, uygulama ve teslim sonrası destek süreçlerini tek kurumsal çatı altında topluyoruz.'
};

const defaultContact = {
    email: 'info@ankist.com.tr',
    phone: '+90 000 000 00 00',
    address: 'Istanbul, Turkiye'
};

const navItems = [
    ['index.html', 'Giriş'],
    ['about.html', 'Hakkımızda'],
    ['service.html', 'Hizmetler'],
    ['feature.html', 'Neden Biz'],
    ['blog.html', 'Bilgi Merkezi'],
    ['contact.html', 'İletişim']
];

const moreItems = [
    ['price.html', 'Hizmet Paketleri'],
    ['team.html', 'Uzmanlıklar'],
    ['testimonial.html', 'Referans Yaklaşımı'],
    ['quote.html', 'Teklif Al'],
    ['detail.html', 'Planlama Rehberi']
];

const defaultSectors = {
    architecture: {
        label: 'ANKIST Mimarlık',
        title: 'Yaşam ve çalışma alanları için ölçülü, uygulanabilir mimari.',
        lead: 'Konut, ticari alan ve karma kullanımlı projelerde tasarımdan uygulama koordinasyonuna kadar bütüncül mimarlık hizmeti sunuyoruz.',
        image: 'Resimler/site/mimarlik-hero.png',
        headerClass: 'architecture-header',
        cta: 'Mimari Teklif Al',
        href: 'mimarlik.html',
        services: [
            ['fa-pencil-ruler', 'Mimari Proje', 'Konsept, avan, ruhsat ve uygulama projelerini disiplinler arasi koordinasyonla hazirlariz.'],
            ['fa-drafting-compass', 'Ic Mimari', 'Malzeme, mobilya, aydinlatma ve mekan kurgusunu kullanici deneyimiyle birlikte planlariz.'],
            ['fa-hard-hat', 'Uygulama Danismanligi', 'Saha süreçinde detay, metraj, kesif ve imalat kontroluyle projenin dogru uygulanmasini destekleriz.']
        ],
        steps: [
            ['Analiz', 'Arsa, yapi, ihtiyaç programi ve mevzuat kosullarini degerlendiririz.'],
            ['Tasarim', 'Alternatifleri karsilastirir, secilen kurguyu netlestiririz.'],
            ['Projelendirme', 'Ruhsat ve uygulama paftalarini teknik detaylarla hazirlariz.'],
            ['Uygulama', 'Malzeme, imalat ve disiplin koordinasyonunu takip ederiz.']
        ]
    },
    systems: {
        label: 'ANKIST Zayıf Akım Sistemleri',
        title: 'Binalar için güvenilir, ölçeklenebilir ve entegre teknik altyapı.',
        lead: 'Güvenlik, haberleşme, yangın algılama, network ve otomasyon sistemlerinde projelendirme, kurulum ve devreye alma hizmetleri sunuyoruz.',
        image: 'Resimler/site/zayif-akim-hero.png',
        headerClass: 'systems-header',
        cta: 'Keşif Talep Et',
        href: 'zayif-akim.html',
        services: [
            ['fa-video', 'CCTV ve Guvenlik', 'Kamera, kayit, izleme, cevre guvenligi ve uzaktan erisim altyapilarini projelendirip devreye aliriz.'],
            ['fa-fingerprint', 'Gecis Kontrol', 'Kartli gecis, turnike, kapi kontrolu ve yetkilendirme senaryolarini isletme yapisina gore kurgulariz.'],
            ['fa-network-wired', 'Network Altyapisi', 'Rack kabin, yapisal kablolama, switch, fiber ve kablosuz ag çözümlerini olceklenebilir sekilde kurariz.'],
            ['fa-fire', 'Yangin Algilama', 'Adresli ve konvansiyonel sistemlerde algilama, alarm ve senaryo entegrasyonlarini uygulariz.'],
            ['fa-bullhorn', 'Seslendirme ve Anons', 'Magaza, ofis, otel ve kamusal yapilarda bolgesel anons ve acil durum seslendirme altyapisi kurariz.'],
            ['fa-home', 'Akilli Bina', 'Aydinlatma, enerji, guvenlik ve otomasyon sistemlerini tek merkezden yonetilebilir hale getiririz.']
        ],
        steps: [
            ['Kesif', 'Saha kosullarini, riskleri ve kullanim senaryolarini analiz ederiz.'],
            ['Proje', 'Tek hat, kolon, cihaz yerlesimi ve kablolama guzergahlarini hazirlariz.'],
            ['Kurulum', 'Kablolama, montaj, etiketleme ve pano duzenini standartlara uygun tamamlariz.'],
            ['Devreye Alma', 'Test, egitim, teslim dokumani ve bakim planiyla sistemi kullanima acariz.']
        ]
    }
};

const defaultPages = {
    choice: {
        title: 'ANKIST',
        label: 'ankist.com.tr',
        image: 'Resimler/site/mimarlik-hero.png'
    },
    about: {
        title: 'Hakkımızda',
        label: 'ANKIST',
        image: 'Resimler/site/mimarlik-hero.png'
    },
    service: {
        title: 'Hizmetler',
        label: 'ANKIST',
        image: 'Resimler/site/zayif-akim-hero.png'
    },
    feature: {
        title: 'Neden ANKIST?',
        label: 'Süreç ve kalite',
        image: 'Resimler/site/zayif-akim-hero.png',
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
        title: 'Hizmet Paketleri',
        label: 'Planlı kapsam',
        image: 'Resimler/site/mimarlik-hero.png',
        plans: [
            ['Keşif', 'Başlangıç', ['Saha veya ihtiyaç görüşmesi', 'Ön değerlendirme', 'Kapsam notu']],
            ['Proje', 'Planlama', ['Mimari/teknik proje dokümanı', 'Metraj ve malzeme ön listesi', 'Takvim ve koordinasyon']],
            ['Uygulama', 'Teslim', ['Saha uygulama yönetimi', 'Test ve kontrol', 'Teslim dokümanları']]
        ]
    },
    team: {
        title: 'Uzmanlık Alanları',
        label: 'Ekip dili',
        image: 'Resimler/site/zayif-akim-hero.png',
        items: [
            ['template/img/team-1.jpg', 'Mimari Tasarım', 'Konsept, ruhsat ve uygulama projeleri'],
            ['template/img/team-2.jpg', 'Teknik Sistemler', 'Zayıf akım, network ve güvenlik altyapıları'],
            ['template/img/team-3.jpg', 'Saha Koordinasyonu', 'İmalat, test ve teslim süreci']
        ]
    },
    testimonial: {
        title: 'Referans Yaklaşımı',
        label: 'Deneyim',
        image: 'Resimler/site/mimarlik-hero.png',
        items: [
            ['template/img/testimonial-1.jpg', 'ANKIST Süreci', 'Kurumsal proje', 'Net kapsam, doğru takvim ve belgeli teslim bizim için en kritik beklentiydi.'],
            ['template/img/testimonial-2.jpg', 'ANKIST Süreci', 'Kurumsal proje', 'Teknik sistemlerde genişleme ihtiyacını baştan düşünen bir kurgu oluştu.'],
            ['template/img/testimonial-3.jpg', 'ANKIST Süreci', 'Kurumsal proje', 'Mimari kararlar ile saha uygulaması arasındaki iletişim net ilerledi.'],
            ['template/img/testimonial-4.jpg', 'ANKIST Süreci', 'Kurumsal proje', 'Teslim sonrası destek ihtiyaçlarına hızlı dönüş alabildik.']
        ]
    },
    quote: {
        title: 'Teklif Al',
        label: 'Proje talebi',
        image: 'Resimler/site/zayif-akim-hero.png',
        heading: 'Projenizin kapsamını birlikte netleştirelim.',
        text: 'İhtiyaç, saha koşulu, hedef takvim ve teslim beklentisini birlikte okuyarak size doğru hizmet kapsamıyla döneriz.'
    },
    contact: {
        title: 'İletişim',
        label: 'ANKIST',
        image: 'Resimler/site/mimarlik-hero.png',
        heading: 'Projeniz için ilk görüşmeyi planlayalım.',
        eyebrow: 'Bize Ulaşın'
    },
    blog: {
        title: 'Bilgi Merkezi',
        label: 'ANKIST notları',
        image: 'Resimler/site/zayif-akim-hero.png',
        posts: [
            ['Resimler/site/mimarlik-hero.png', 'Mimari projeye başlamadan önce netleştirilmesi gerekenler', 'İhtiyaç programı, mevzuat ve bütçe dengesini proje başında okumak süreci rahatlatır.'],
            ['Resimler/site/zayif-akim-hero.png', 'Zayıf akım altyapısında ölçeklenebilirlik neden önemlidir?', 'Network, güvenlik ve otomasyon sistemleri doğru planlandığında bina yaşadıkça büyüyebilir.'],
            ['template/img/blog-3.jpg', 'Saha tesliminde dokümantasyonun rolü', 'Test, etiketleme ve teslim dokümanları sonraki bakım sürecinin temelidir.']
        ]
    },
    detail: {
        title: 'Proje Planlama Rehberi',
        label: 'Bilgi Merkezi',
        image: 'Resimler/site/mimarlik-hero.png',
        bodyTitle: 'Doğru başlangıç, daha rahat uygulama demektir.',
        paragraphs: [
            'ANKIST sürecinde ilk adım, ihtiyacı yalnızca iş listesi olarak değil; kullanıcı, mekan, teknik altyapı, takvim ve bütçe beklentisiyle birlikte okumaktır.',
            'Mimarlık tarafında arsa veya mevcut yapı koşulları, ruhsat gereklilikleri, malzeme kararlarının bakım etkisi ve kullanıcı deneyimi birlikte değerlendirilir. Zayıf akım tarafında ise güvenlik senaryoları, network kapasitesi, kablo güzergahları, genişleme ihtimali ve teslim sonrası destek kurgusu baştan planlanır.',
            'Bu yaklaşım, proje ilerledikçe süren belirsizlikleri azaltır ve uygulama ekipleri arasında ortak bir dil oluşturur.'
        ],
        sideTitle: 'Hızlı Başlangıç',
        sideItems: ['İhtiyaç programı', 'Saha bilgileri', 'Hedef takvim', 'Bütçe aralığı']
    }
};

const savedSettings = readSiteSettings();
const siteMeta = mergeObject(defaultSiteMeta, savedSettings.siteMeta || {});
const contact = mergeObject(defaultContact, savedSettings.contact || {});
const sectors = mergeObject(defaultSectors, savedSettings.sectors || {});
const pages = mergeObject(defaultPages, savedSettings.pages || {});

function activeClass(file) {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    return current === file ? ' active' : '';
}

function topbar() {
    return `
        <div class="container-fluid bg-dark px-5 d-none d-lg-block">
            <div class="row gx-0 topbar-contact">
                <div class="col-lg-8 text-center text-lg-start mb-2 mb-lg-0">
                    <div class="d-inline-flex align-items-center h-100">
                        <small class="me-3 text-light"><i class="fa fa-map-marker-alt me-2"></i>${contact.address}</small>
                        <small class="me-3 text-light"><i class="fa fa-phone-alt me-2"></i>${contact.phone}</small>
                        <small class="text-light"><i class="fa fa-envelope-open me-2"></i>${contact.email}</small>
                    </div>
                </div>
                <div class="col-lg-4 text-center text-lg-end">
                    <div class="d-inline-flex align-items-center h-100">
                        <a class="btn btn-sm btn-outline-light btn-sm-square rounded-circle me-2" href="#"><i class="fab fa-instagram fw-normal"></i></a>
                        <a class="btn btn-sm btn-outline-light btn-sm-square rounded-circle me-2" href="#"><i class="fab fa-linkedin-in fw-normal"></i></a>
                        <a class="btn btn-sm btn-outline-light btn-sm-square rounded-circle" href="#"><i class="fab fa-whatsapp fw-normal"></i></a>
                    </div>
                </div>
            </div>
        </div>`;
}

function navbar() {
    return `
        <div class="container-fluid position-relative p-0">
            <nav class="navbar navbar-expand-lg navbar-dark px-5 py-3 py-lg-0">
                <a href="index.html" class="navbar-brand p-0 d-flex align-items-center">
                    <h1 class="m-0 d-flex align-items-center"><span class="brand-symbol">${siteMeta.brandName.charAt(0)}</span><span>${siteMeta.brandName}<small>${siteMeta.brandSubtitle}</small></span></h1>
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                    <span class="fa fa-bars"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarCollapse">
                    <div class="navbar-nav ms-auto py-0">
                        ${navItems.map(([href, text]) => `<a href="${href}" class="nav-item nav-link${activeClass(href)}">${text}</a>`).join('')}
                        <div class="nav-item dropdown">
                            <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">Sayfalar</a>
                            <div class="dropdown-menu m-0">
                                ${moreItems.map(([href, text]) => `<a href="${href}" class="dropdown-item">${text}</a>`).join('')}
                            </div>
                        </div>
                    </div>
                    <a href="quote.html" class="btn btn-primary py-2 px-4 ms-3">Teklif Al</a>
                </div>
            </nav>
        </div>`;
}

function footer() {
    return `
        <div class="container-fluid bg-dark text-light mt-5 wow fadeInUp" data-wow-delay="0.1s">
            <div class="container">
                <div class="row gx-5">
                    <div class="col-lg-4 col-md-6 footer-about">
                        <div class="d-flex flex-column align-items-center justify-content-center text-center h-100 bg-primary p-4">
                            <a href="index.html" class="navbar-brand"><h1 class="m-0 text-white"><span class="brand-symbol">${siteMeta.brandName.charAt(0)}</span>${siteMeta.brandName}</h1></a>
                            <p class="mt-3 mb-4">${siteMeta.footerText}</p>
                            <a class="btn btn-dark py-3 px-4" href="quote.html">Proje Talebi Oluştur</a>
                        </div>
                    </div>
                    <div class="col-lg-8 col-md-6">
                        <div class="row gx-5">
                            <div class="col-lg-4 col-md-12 pt-5 mb-5">
                                <div class="section-title section-title-sm position-relative pb-3 mb-4"><h3 class="text-light mb-0">İletişim</h3></div>
                                <div class="d-flex mb-2"><i class="bi bi-geo-alt text-primary me-2"></i><p class="mb-0">${contact.address}</p></div>
                                <div class="d-flex mb-2"><i class="bi bi-envelope-open text-primary me-2"></i><p class="mb-0">${contact.email}</p></div>
                                <div class="d-flex mb-2"><i class="bi bi-telephone text-primary me-2"></i><p class="mb-0">${contact.phone}</p></div>
                            </div>
                            <div class="col-lg-4 col-md-12 pt-0 pt-lg-5 mb-5">
                                <div class="section-title section-title-sm position-relative pb-3 mb-4"><h3 class="text-light mb-0">Hızlı Linkler</h3></div>
                                <div class="link-animated d-flex flex-column justify-content-start">
                                    ${navItems.slice(0, 6).map(([href, text]) => `<a class="text-light mb-2" href="${href}"><i class="bi bi-arrow-right text-primary me-2"></i>${text}</a>`).join('')}
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-12 pt-0 pt-lg-5 mb-5">
                                <div class="section-title section-title-sm position-relative pb-3 mb-4"><h3 class="text-light mb-0">Alanlar</h3></div>
                                <div class="link-animated d-flex flex-column justify-content-start">
                                    <a class="text-light mb-2" href="mimarlik.html"><i class="bi bi-arrow-right text-primary me-2"></i>Mimarlık</a>
                                    <a class="text-light mb-2" href="zayif-akim.html"><i class="bi bi-arrow-right text-primary me-2"></i>Zayıf Akım Sistemleri</a>
                                    <a class="text-light mb-2" href="price.html"><i class="bi bi-arrow-right text-primary me-2"></i>Paketler</a>
                                    <a class="text-light" href="detail.html"><i class="bi bi-arrow-right text-primary me-2"></i>Planlama Rehberi</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container-fluid text-white" style="background: #061429;">
            <div class="container text-center">
                <div class="row justify-content-end">
                    <div class="col-lg-8 col-md-6">
                        <div class="d-flex align-items-center justify-content-center copyright-row">
                            <p class="mb-0">&copy; <a class="text-white border-bottom" href="index.html">${siteMeta.brandName}</a>. Tüm hakları saklıdır. Template altyapisi HTML Codex tasarim sistemiyle uyarlanmıştır.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

function shell(content, options = {}) {
    return `${topbar()}${navbar()}${content}${footer()}`;
}

function choicePage() {
    return shell(`
        <main class="choice-page">
            <section class="choice-hero">
                <div class="container py-5">
                    <div class="section-title text-center position-relative pb-3 mb-5 mx-auto" style="max-width: 760px;">
                        <h5 class="fw-bold text-primary text-uppercase">ankist.com.tr</h5>
                        <h1 class="display-3 text-white mb-0">${siteMeta.brandName}</h1>
                    </div>
                    <p class="lead text-center text-white-50 mb-5">${siteMeta.introText}</p>
                    <div class="row g-5">
                        ${choiceCard(sectors.architecture, 'fa-building')}
                        ${choiceCard(sectors.systems, 'fa-project-diagram')}
                    </div>
                </div>
            </section>
        </main>`);
}

function choiceCard(sector, icon) {
    return `
        <div class="col-lg-6 wow zoomIn" data-wow-delay="0.2s">
            <a class="choice-card" href="${sector.href}">
                <img src="${sector.image}" alt="${sector.label}">
                <span class="btn btn-primary choice-action">Devam Et <i class="bi bi-arrow-right ms-2"></i></span>
                <span class="choice-card-content">
                    <span class="bg-primary rounded d-flex align-items-center justify-content-center mb-4 choice-icon"><i class="fa ${icon} text-white fa-2x"></i></span>
                    <small class="text-primary text-uppercase fw-bold">ANKIST</small>
                    <h2 class="text-white mt-2 mb-3">${sector.label.replace('ANKIST ', '')}</h2>
                    <p class="mb-0">${sector.lead}</p>
                </span>
            </a>
        </div>`;
}

function sectorPage(kind) {
    const sector = sectors[kind];
    return shell(`
        <div id="header-carousel" class="carousel slide carousel-fade ankist-carousel" data-bs-ride="carousel">
            <div class="carousel-inner">
                <div class="carousel-item active">
                    <img class="w-100" src="${sector.image}" alt="${sector.label}">
                    <div class="carousel-caption d-flex flex-column align-items-center justify-content-center">
                        <div class="p-3" style="max-width: 960px;">
                            <h5 class="text-white text-uppercase mb-3 animated slideInDown">${sector.label}</h5>
                            <h1 class="display-1 text-white mb-md-4 animated zoomIn">${sector.title}</h1>
                            <a href="quote.html" class="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft">${sector.cta}</a>
                            <a href="index.html" class="btn btn-outline-light py-md-3 px-md-5 animated slideInRight">Seçim Ekranı</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ${facts()}
        ${aboutBlock(sector)}
        ${servicesBlock(sector)}
        ${processBlock(sector)}
        ${quoteBand()}`);
}

function pageHeader(title, label, headerClass = 'architecture-header') {
    return `
        <div class="container-fluid ${headerClass} page-header wow fadeIn" data-wow-delay="0.1s">
            <div class="container py-5">
                <div class="row justify-content-center">
                    <div class="col-lg-10 text-center">
                        <h5 class="text-primary text-uppercase">${label}</h5>
                        <h1 class="display-4 text-white animated zoomIn">${title}</h1>
                    </div>
                </div>
            </div>
        </div>`;
}

function facts() {
    return `
        <div class="container-fluid facts py-5 pt-lg-0">
            <div class="container py-5 pt-lg-0">
                <div class="row gx-0">
                    <div class="col-lg-4 wow zoomIn" data-wow-delay="0.1s"><div class="bg-primary shadow d-flex align-items-center justify-content-center p-4" style="height: 150px;"><div class="bg-white d-flex align-items-center justify-content-center rounded mb-2" style="width: 60px; height: 60px;"><i class="fa fa-users text-primary"></i></div><div class="ps-4"><h5 class="text-white mb-0">Kurumsal Süreç</h5><h1 class="text-white mb-0">360</h1></div></div></div>
                    <div class="col-lg-4 wow zoomIn" data-wow-delay="0.3s"><div class="bg-light shadow d-flex align-items-center justify-content-center p-4" style="height: 150px;"><div class="bg-primary d-flex align-items-center justify-content-center rounded mb-2" style="width: 60px; height: 60px;"><i class="fa fa-check text-white"></i></div><div class="ps-4"><h5 class="text-primary mb-0">Proje Takibi</h5><h1 class="mb-0">Planli</h1></div></div></div>
                    <div class="col-lg-4 wow zoomIn" data-wow-delay="0.6s"><div class="bg-primary shadow d-flex align-items-center justify-content-center p-4" style="height: 150px;"><div class="bg-white d-flex align-items-center justify-content-center rounded mb-2" style="width: 60px; height: 60px;"><i class="fa fa-award text-primary"></i></div><div class="ps-4"><h5 class="text-white mb-0">Teslim</h5><h1 class="text-white mb-0">Belgeli</h1></div></div></div>
                </div>
            </div>
        </div>`;
}

function aboutBlock(sector = sectors.architecture) {
    return `
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div class="container py-5">
                <div class="row g-5">
                    <div class="col-lg-7">
                        <div class="section-title position-relative pb-3 mb-5">
                            <h5 class="fw-bold text-primary text-uppercase">${sector.label}</h5>
                            <h1 class="mb-0">${sector.title}</h1>
                        </div>
                        <p class="mb-4">${sector.lead} Tasarim kararlarini, teknik gereklilikleri, takvimi ve butce disiplinini ayni masada ele alarak izlenebilir bir süreç kurariz.</p>
                        <div class="row g-0 mb-3">
                            <div class="col-sm-6 wow zoomIn" data-wow-delay="0.2s"><h5 class="mb-3"><i class="fa fa-check text-primary me-3"></i>Planli kesif ve analiz</h5><h5 class="mb-3"><i class="fa fa-check text-primary me-3"></i>Uygulanabilir proje dili</h5></div>
                            <div class="col-sm-6 wow zoomIn" data-wow-delay="0.4s"><h5 class="mb-3"><i class="fa fa-check text-primary me-3"></i>Disiplin koordinasyonu</h5><h5 class="mb-3"><i class="fa fa-check text-primary me-3"></i>Teslim sonrasi destek</h5></div>
                        </div>
                        <a href="quote.html" class="btn btn-primary py-3 px-5 mt-3 wow zoomIn" data-wow-delay="0.6s">${sector.cta}</a>
                    </div>
                    <div class="col-lg-5 about-image" style="min-height: 500px;">
                        <div class="position-relative h-100"><img class="position-absolute w-100 h-100 rounded wow zoomIn" data-wow-delay="0.6s" src="${sector.image}" alt="${sector.label}"></div>
                    </div>
                </div>
            </div>
        </div>`;
}

function servicesBlock(sector = sectors.systems) {
    return `
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div class="container py-5">
                <div class="section-title text-center position-relative pb-3 mb-5 mx-auto" style="max-width: 640px;">
                    <h5 class="fw-bold text-primary text-uppercase">Hizmetler</h5>
                    <h1 class="mb-0">${sector.label} kapsamında sundugumuz çözümler</h1>
                </div>
                <div class="row g-5">
                    ${sector.services.map(([icon, title, text], index) => `
                        <div class="col-lg-4 col-md-6 wow zoomIn" data-wow-delay="${0.2 + (index % 3) * 0.2}s">
                            <div class="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                                <div class="service-icon"><i class="fa ${icon} text-white"></i></div>
                                <h4 class="mb-3">${title}</h4>
                                <p class="m-0">${text}</p>
                                <a class="btn btn-lg btn-primary rounded" href="quote.html"><i class="bi bi-arrow-right"></i></a>
                            </div>
                        </div>`).join('')}
                </div>
            </div>
        </div>`;
}

function processBlock(sector = sectors.systems) {
    return `
        <div class="container-fluid py-5 wow fadeInUp bg-light" data-wow-delay="0.1s">
            <div class="container py-5">
                <div class="section-title text-center position-relative pb-3 mb-5 mx-auto" style="max-width: 620px;">
                    <h5 class="fw-bold text-primary text-uppercase">Süreç</h5>
                    <h1 class="mb-0">Başlangıçtan teslime kadar net is akisi</h1>
                </div>
                <div class="row g-4">
                    ${sector.steps.map(([title, text], index) => `
                        <div class="col-lg-3 col-md-6 wow slideInUp" data-wow-delay="${0.2 + index * 0.1}s">
                            <div class="bg-white rounded shadow-sm h-100 p-4 process-card">
                                <h2 class="text-primary mb-3">${String(index + 1).padStart(2, '0')}</h2>
                                <h4>${title}</h4>
                                <p class="mb-0">${text}</p>
                            </div>
                        </div>`).join('')}
                </div>
            </div>
        </div>`;
}

function quoteBand() {
    return `
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div class="container py-5">
                <div class="row g-5 align-items-center">
                    <div class="col-lg-7">
                        <div class="section-title position-relative pb-3 mb-4">
                            <h5 class="fw-bold text-primary text-uppercase">Teklif</h5>
                            <h1 class="mb-0">Projenizin kapsamÄ±nÄ± birlikte netlestirelim.</h1>
                        </div>
                        <p class="mb-4">İhtiyaç, saha kosulu, hedef takvim ve teslim beklentisini birlikte okuyarak size dogru hizmet kapsamıyla doneriz.</p>
                    </div>
                    <div class="col-lg-5">
                        ${quoteForm()}
                    </div>
                </div>
            </div>
        </div>`;
}

function quoteForm() {
    return `
        <div class="bg-primary rounded h-100 p-5">
            <form>
                <div class="row g-3">
                    <div class="col-12"><input type="text" class="form-control bg-light border-0" placeholder="Ad Soyad" style="height: 55px;"></div>
                    <div class="col-12"><input type="email" class="form-control bg-light border-0" placeholder="E-posta" style="height: 55px;"></div>
                    <div class="col-12"><select class="form-select bg-light border-0" style="height: 55px;"><option selected>Hizmet Alanı</option><option>Mimarlık</option><option>Zayıf Akım Sistemleri</option><option>Her ikisi</option></select></div>
                    <div class="col-12"><textarea class="form-control bg-light border-0" rows="3" placeholder="Kısa proje notu"></textarea></div>
                    <div class="col-12"><button class="btn btn-dark w-100 py-3" type="button">Talebi Gönder</button></div>
                </div>
            </form>
        </div>`;
}

function servicePage() {
    return shell(`${pageHeader('Hizmetler', 'ANKIST', 'systems-header')}${servicesBlock(sectors.architecture)}${servicesBlock(sectors.systems)}${quoteBand()}`);
}

function aboutPage() {
    return shell(`${pageHeader('Hakkımızda', 'ANKIST', 'architecture-header')}${aboutBlock(sectors.architecture)}${aboutBlock(sectors.systems)}${facts()}`);
}

function featurePage() {
    return shell(`
        ${pageHeader('Neden ANKIST?', 'Süreç ve kalite', 'systems-header')}
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div class="container py-5">
                <div class="section-title text-center position-relative pb-3 mb-5 mx-auto" style="max-width: 650px;"><h5 class="fw-bold text-primary text-uppercase">Neden Biz</h5><h1 class="mb-0">Tasarim, teknik altyapi ve uygulama kararlarini birlikte yonetiriz</h1></div>
                <div class="row g-5">
                    <div class="col-lg-4"><div class="row g-5">
                        ${featureItem('fa-map', 'Kesif ve analiz', 'Karar almadan once saha, mevzuat, kullanim ve risk kosullarini gorunur hale getiririz.')}
                        ${featureItem('fa-file-signature', 'Belgeli teslim', 'Proje, metraj, cihaz listesi, test ve teslim dokumanlarini süreçin parcasina donustururuz.')}
                    </div></div>
                    <div class="col-lg-4 wow zoomIn feature-image" data-wow-delay="0.5s"><div class="position-relative h-100"><img class="position-absolute w-100 h-100 rounded wow zoomIn" src="template/img/feature.jpg" alt="ANKIST proje koordinasyonu"></div></div>
                    <div class="col-lg-4"><div class="row g-5">
                        ${featureItem('fa-users-cog', 'Tek ekip dili', 'Mimari ve teknik sistem kararlarini ayni proje ritmi icinde takip ederiz.')}
                        ${featureItem('fa-headset', 'Destek yaklasimi', 'Teslimden sonra bakim, revizyon ve genisleme ihtiyaçlari icin izlenebilir destek sunariz.')}
                    </div></div>
                </div>
            </div>
        </div>`);
}

function featureItem(icon, title, text) {
    return `<div class="col-12 wow zoomIn" data-wow-delay="0.2s"><div class="bg-primary rounded d-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;"><i class="fa ${icon} text-white"></i></div><h4>${title}</h4><p class="mb-0">${text}</p></div>`;
}

function pricePage() {
    const plans = [
        ['Kesif', 'Başlangıç', ['Saha veya ihtiyaç gorusmesi', 'On degerlendirme', 'Kapsam notu']],
        ['Proje', 'Planlama', ['Mimari/teknik proje dokumani', 'Metraj ve malzeme on listesi', 'Takvim ve koordinasyon']],
        ['Uygulama', 'Teslim', ['Saha uygulama yonetimi', 'Test ve kontrol', 'Teslim dokumanlari']]
    ];
    return shell(`${pageHeader('Hizmet Paketleri', 'Planli kapsam', 'architecture-header')}
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s"><div class="container py-5"><div class="row g-5">
        ${plans.map(([name, label, items], index) => `<div class="col-lg-4 wow slideInUp" data-wow-delay="${0.2 + index * 0.2}s"><div class="bg-light rounded h-100 p-5"><div class="border-bottom pb-4 mb-4"><h4 class="text-primary">${name}</h4><h1 class="mb-0">${label}</h1></div>${items.map(item => `<p><i class="fa fa-check text-primary me-3"></i>${item}</p>`).join('')}<a href="quote.html" class="btn btn-primary py-3 px-5 mt-3">Teklif Al</a></div></div>`).join('')}
        </div></div></div>`);
}

function teamPage() {
    const items = [
        ['template/img/team-1.jpg', 'Mimari Tasarim', 'Konsept, ruhsat ve uygulama projeleri'],
        ['template/img/team-2.jpg', 'Teknik Sistemler', 'Zayif akim, network ve guvenlik altyapilari'],
        ['template/img/team-3.jpg', 'Saha Koordinasyonu', 'Imalat, test ve teslim süreçi']
    ];
    return shell(`${pageHeader('Uzmanlik Alanlari', 'Ekip dili', 'systems-header')}<div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s"><div class="container py-5"><div class="row g-5">${items.map(([img, title, text], index) => `<div class="col-lg-4 wow slideInUp" data-wow-delay="${0.2 + index * 0.2}s"><div class="team-item bg-light rounded overflow-hidden"><div class="team-img position-relative overflow-hidden"><img class="img-fluid w-100" src="${img}" alt="${title}"></div><div class="text-center py-4 px-3"><h4 class="text-primary">${title}</h4><p class="text-uppercase m-0">${text}</p></div></div></div>`).join('')}</div></div></div>`);
}

function testimonialPage() {
    return shell(`${pageHeader('Referans Yaklaşımı', 'Deneyim', 'architecture-header')}
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s"><div class="container py-5"><div class="owl-carousel testimonial-carousel wow fadeInUp" data-wow-delay="0.4s">
        ${['Net kapsam, dogru takvim ve belgeli teslim bizim icin en kritik beklentiydi.', 'Teknik sistemlerde genisleme ihtiyaçıni bastan dusunen bir kurgu olustu.', 'Mimari kararlar ile saha uygulamasi arasindaki iletisim net ilerledi.', 'Teslim sonrasi destek ihtiyaçlarina hizli donus alabildik.'].map((text, index) => `<div class="testimonial-item bg-light my-4"><div class="d-flex align-items-center border-bottom pt-5 pb-4 px-5"><img class="img-fluid rounded" src="template/img/testimonial-${index + 1}.jpg" style="width: 60px; height: 60px;" alt="Referans"><div class="ps-4"><h4 class="text-primary mb-1">ANKIST Süreci</h4><small class="text-uppercase">Kurumsal proje</small></div></div><div class="pt-4 pb-5 px-5">${text}</div></div>`).join('')}
        </div></div></div>`);
}

function quotePage() {
    return shell(`${pageHeader('Teklif Al', 'Proje talebi', 'systems-header')}${quoteBand()}`);
}

function contactPage() {
    return shell(`${pageHeader('İletişim', 'ANKIST', 'architecture-header')}
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s"><div class="container py-5"><div class="row g-5">
            <div class="col-lg-5"><div class="section-title position-relative pb-3 mb-5"><h5 class="fw-bold text-primary text-uppercase">Bize Ulasin</h5><h1 class="mb-0">Projeniz icin ilk gorusmeyi planlayalim.</h1></div><p><i class="fa fa-map-marker-alt text-primary me-3"></i>${contact.address}</p><p><i class="fa fa-phone-alt text-primary me-3"></i>${contact.phone}</p><p><i class="fa fa-envelope-open text-primary me-3"></i>${contact.email}</p></div>
            <div class="col-lg-7">${quoteForm()}</div>
        </div></div></div>`);
}

function blogPage() {
    const posts = [
        ['Resimler/site/mimarlik-hero.png', 'Mimari projeye baslamadan once netlestirilmesi gerekenler', 'İhtiyaç programi, mevzuat ve butce dengesini proje basinda okumak süreçi rahatlatir.'],
        ['Resimler/site/zayif-akim-hero.png', 'Zayif akim altyapisinda olceklenebilirlik neden onemlidir?', 'Network, guvenlik ve otomasyon sistemleri dogru planlandiginda bina yasadikca buyuyebilir.'],
        ['template/img/blog-3.jpg', 'Saha tesliminde dokumantasyonun rolu', 'Test, etiketleme ve teslim dokumanlari sonraki bakim süreçinin temelidir.']
    ];
    return shell(`${pageHeader('Bilgi Merkezi', 'ANKIST notlari', 'systems-header')}
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s"><div class="container py-5"><div class="row g-5">${posts.map(([img, title, text], index) => `<div class="col-lg-4 wow slideInUp" data-wow-delay="${0.2 + index * 0.2}s"><div class="blog-item bg-light rounded overflow-hidden"><div class="blog-img position-relative overflow-hidden"><img class="img-fluid" src="${img}" alt="${title}"><a class="position-absolute top-0 start-0 bg-primary text-white rounded-end mt-5 py-2 px-4" href="detail.html">Rehber</a></div><div class="p-4"><div class="d-flex mb-3"><small class="me-3"><i class="far fa-user text-primary me-2"></i>ANKIST</small><small><i class="far fa-calendar-alt text-primary me-2"></i>2026</small></div><h4 class="mb-3">${title}</h4><p>${text}</p><a class="text-uppercase" href="detail.html">Devamini Oku <i class="bi bi-arrow-right"></i></a></div></div></div>`).join('')}</div></div></div>`);
}

function detailPage() {
    return shell(`${pageHeader('Proje Planlama Rehberi', 'Bilgi Merkezi', 'architecture-header')}
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s"><div class="container py-5"><div class="row g-5">
            <div class="col-lg-8"><img class="img-fluid w-100 rounded mb-5" src="Resimler/site/mimarlik-hero.png" alt="Proje planlama"><h1 class="mb-4">Dogru baslangic, daha rahat uygulama demektir.</h1><p>ANKIST süreçinde ilk adim, ihtiyaçı yalnizca is listesi olarak degil; kullanici, mekan, teknik altyapi, takvim ve butce beklentisiyle birlikte okumaktir.</p><p>Mimarlık tarafinda arsa veya mevcut yapi kosullari, ruhsat gereklilikleri, malzeme kararlarinin bakim etkisi ve kullanici deneyimi birlikte degerlendirilir. Zayif akim tarafinda ise guvenlik senaryolari, network kapasitesi, kablo guzergahlari, genisleme ihtimali ve teslim sonrasi destek kurgusu bastan planlanir.</p><p>Bu yaklasim, proje ilerledikce suren belirsizlikleri azaltir ve uygulama ekipleri arasinda ortak bir dil olusturur.</p></div>
            <div class="col-lg-4"><div class="bg-light rounded p-5"><h3 class="mb-4">Hizli Başlangıç</h3><p><i class="fa fa-check text-primary me-3"></i>İhtiyaç programi</p><p><i class="fa fa-check text-primary me-3"></i>Saha bilgileri</p><p><i class="fa fa-check text-primary me-3"></i>Hedef takvim</p><p><i class="fa fa-check text-primary me-3"></i>Bütçe araligi</p><a class="btn btn-primary py-3 px-5 mt-3" href="quote.html">Teklif Al</a></div></div>
        </div></div></div>`);
}

function headerClassForImage(pageConfig, fallbackClass = 'architecture-header') {
    return pageConfig.image ? '' : fallbackClass;
}

function pageHeader(title, label, headerClass = 'architecture-header', image = '') {
    const style = image ? ` style="background-image: linear-gradient(rgba(9, 30, 62, .76), rgba(9, 30, 62, .76)), url('${image}');"` : '';
    return `
        <div class="container-fluid ${headerClass} page-header wow fadeIn" data-wow-delay="0.1s"${style}>
            <div class="container py-5">
                <div class="row justify-content-center">
                    <div class="col-lg-10 text-center">
                        <h5 class="text-primary text-uppercase">${label}</h5>
                        <h1 class="display-4 text-white animated zoomIn">${title}</h1>
                    </div>
                </div>
            </div>
        </div>`;
}

function managedHeader(key, fallbackClass = 'architecture-header') {
    const pageConfig = pages[key] || {};
    return pageHeader(pageConfig.title || key, pageConfig.label || siteMeta.brandName, headerClassForImage(pageConfig, fallbackClass), pageConfig.image || '');
}

function choicePage() {
    const pageConfig = pages.choice;
    return shell(`
        <main class="choice-page">
            <section class="choice-hero" style="background-image: linear-gradient(rgba(9, 30, 62, .86), rgba(9, 30, 62, .78)), url('${pageConfig.image || sectors.architecture.image}');">
                <div class="container py-5">
                    <div class="section-title text-center position-relative pb-3 mb-5 mx-auto" style="max-width: 760px;">
                        <h5 class="fw-bold text-primary text-uppercase">${pageConfig.label || 'ankist.com.tr'}</h5>
                        <h1 class="display-3 text-white mb-0">${pageConfig.title || siteMeta.brandName}</h1>
                    </div>
                    <p class="lead text-center text-white-50 mb-5">${siteMeta.introText}</p>
                    <div class="row g-5">
                        ${choiceCard(sectors.architecture, 'fa-building')}
                        ${choiceCard(sectors.systems, 'fa-project-diagram')}
                    </div>
                </div>
            </section>
        </main>`);
}

function sectorPage(kind) {
    const sector = sectors[kind];
    return shell(`
        <div id="header-carousel" class="carousel slide carousel-fade ankist-carousel" data-bs-ride="carousel">
            <div class="carousel-inner">
                <div class="carousel-item active">
                    <img class="w-100" src="${sector.image}" alt="${sector.label}">
                    <div class="carousel-caption d-flex flex-column align-items-center justify-content-center">
                        <div class="p-3" style="max-width: 960px;">
                            <h5 class="text-white text-uppercase mb-3 animated slideInDown">${sector.label}</h5>
                            <h1 class="display-1 text-white mb-md-4 animated zoomIn">${sector.title}</h1>
                            <a href="quote.html" class="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft">${sector.cta}</a>
                            <a href="index.html" class="btn btn-outline-light py-md-3 px-md-5 animated slideInRight">Seçim Ekranı</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ${facts()}
        ${aboutBlock(sector)}
        ${servicesBlock(sector)}
        ${processBlock(sector)}
        ${quoteBand()}`);
}

function quoteBand() {
    const pageConfig = pages.quote;
    return `
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div class="container py-5">
                <div class="row g-5 align-items-center">
                    <div class="col-lg-7">
                        <div class="section-title position-relative pb-3 mb-4">
                            <h5 class="fw-bold text-primary text-uppercase">${pageConfig.label}</h5>
                            <h1 class="mb-0">${pageConfig.heading}</h1>
                        </div>
                        <p class="mb-4">${pageConfig.text}</p>
                    </div>
                    <div class="col-lg-5">
                        ${quoteForm()}
                    </div>
                </div>
            </div>
        </div>`;
}

function servicePage() {
    return shell(`${managedHeader('service', 'systems-header')}${servicesBlock(sectors.architecture)}${servicesBlock(sectors.systems)}${quoteBand()}`);
}

function aboutPage() {
    return shell(`${managedHeader('about', 'architecture-header')}${aboutBlock(sectors.architecture)}${aboutBlock(sectors.systems)}${facts()}`);
}

function featurePage() {
    const pageConfig = pages.feature;
    const items = pageConfig.items || [];
    return shell(`
        ${managedHeader('feature', 'systems-header')}
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div class="container py-5">
                <div class="section-title text-center position-relative pb-3 mb-5 mx-auto" style="max-width: 650px;"><h5 class="fw-bold text-primary text-uppercase">Neden Biz</h5><h1 class="mb-0">${pageConfig.heading}</h1></div>
                <div class="row g-5">
                    <div class="col-lg-4"><div class="row g-5">${items.slice(0, 2).map((item) => featureItem(item[0], item[1], item[2])).join('')}</div></div>
                    <div class="col-lg-4 wow zoomIn feature-image" data-wow-delay="0.5s"><div class="position-relative h-100"><img class="position-absolute w-100 h-100 rounded wow zoomIn" src="${pageConfig.centerImage}" alt="${pageConfig.title}"></div></div>
                    <div class="col-lg-4"><div class="row g-5">${items.slice(2, 4).map((item) => featureItem(item[0], item[1], item[2])).join('')}</div></div>
                </div>
            </div>
        </div>`);
}

function pricePage() {
    const pageConfig = pages.price;
    const plans = pageConfig.plans || [];
    return shell(`${managedHeader('price', 'architecture-header')}
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s"><div class="container py-5"><div class="row g-5">
        ${plans.map(([name, label, items], index) => `<div class="col-lg-4 wow slideInUp" data-wow-delay="${0.2 + index * 0.2}s"><div class="bg-light rounded h-100 p-5"><div class="border-bottom pb-4 mb-4"><h4 class="text-primary">${name}</h4><h1 class="mb-0">${label}</h1></div>${(items || []).map(item => `<p><i class="fa fa-check text-primary me-3"></i>${item}</p>`).join('')}<a href="quote.html" class="btn btn-primary py-3 px-5 mt-3">Teklif Al</a></div></div>`).join('')}
        </div></div></div>`);
}

function teamPage() {
    const pageConfig = pages.team;
    const items = pageConfig.items || [];
    return shell(`${managedHeader('team', 'systems-header')}<div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s"><div class="container py-5"><div class="row g-5">${items.map(([img, title, text], index) => `<div class="col-lg-4 wow slideInUp" data-wow-delay="${0.2 + index * 0.2}s"><div class="team-item bg-light rounded overflow-hidden"><div class="team-img position-relative overflow-hidden"><img class="img-fluid w-100" src="${img}" alt="${title}"></div><div class="text-center py-4 px-3"><h4 class="text-primary">${title}</h4><p class="text-uppercase m-0">${text}</p></div></div></div>`).join('')}</div></div></div>`);
}

function testimonialPage() {
    const pageConfig = pages.testimonial;
    const items = pageConfig.items || [];
    return shell(`${managedHeader('testimonial', 'architecture-header')}
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s"><div class="container py-5"><div class="owl-carousel testimonial-carousel wow fadeInUp" data-wow-delay="0.4s">
        ${items.map(([img, title, role, text]) => `<div class="testimonial-item bg-light my-4"><div class="d-flex align-items-center border-bottom pt-5 pb-4 px-5"><img class="img-fluid rounded" src="${img}" style="width: 60px; height: 60px;" alt="${title}"><div class="ps-4"><h4 class="text-primary mb-1">${title}</h4><small class="text-uppercase">${role}</small></div></div><div class="pt-4 pb-5 px-5">${text}</div></div>`).join('')}
        </div></div></div>`);
}

function quotePage() {
    return shell(`${managedHeader('quote', 'systems-header')}${quoteBand()}`);
}

function contactPage() {
    const pageConfig = pages.contact;
    return shell(`${managedHeader('contact', 'architecture-header')}
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s"><div class="container py-5"><div class="row g-5">
            <div class="col-lg-5"><div class="section-title position-relative pb-3 mb-5"><h5 class="fw-bold text-primary text-uppercase">${pageConfig.eyebrow}</h5><h1 class="mb-0">${pageConfig.heading}</h1></div><p><i class="fa fa-map-marker-alt text-primary me-3"></i>${contact.address}</p><p><i class="fa fa-phone-alt text-primary me-3"></i>${contact.phone}</p><p><i class="fa fa-envelope-open text-primary me-3"></i>${contact.email}</p></div>
            <div class="col-lg-7">${quoteForm()}</div>
        </div></div></div>`);
}

function blogPage() {
    const pageConfig = pages.blog;
    const posts = pageConfig.posts || [];
    return shell(`${managedHeader('blog', 'systems-header')}
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s"><div class="container py-5"><div class="row g-5">${posts.map(([img, title, text], index) => `<div class="col-lg-4 wow slideInUp" data-wow-delay="${0.2 + index * 0.2}s"><div class="blog-item bg-light rounded overflow-hidden"><div class="blog-img position-relative overflow-hidden"><img class="img-fluid" src="${img}" alt="${title}"><a class="position-absolute top-0 start-0 bg-primary text-white rounded-end mt-5 py-2 px-4" href="detail.html">Rehber</a></div><div class="p-4"><div class="d-flex mb-3"><small class="me-3"><i class="far fa-user text-primary me-2"></i>${siteMeta.brandName}</small><small><i class="far fa-calendar-alt text-primary me-2"></i>2026</small></div><h4 class="mb-3">${title}</h4><p>${text}</p><a class="text-uppercase" href="detail.html">Devamını Oku <i class="bi bi-arrow-right"></i></a></div></div></div>`).join('')}</div></div></div>`);
}

function detailPage() {
    const pageConfig = pages.detail;
    return shell(`${managedHeader('detail', 'architecture-header')}
        <div class="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s"><div class="container py-5"><div class="row g-5">
            <div class="col-lg-8"><img class="img-fluid w-100 rounded mb-5" src="${pageConfig.image}" alt="${pageConfig.title}"><h1 class="mb-4">${pageConfig.bodyTitle}</h1>${(pageConfig.paragraphs || []).map(text => `<p>${text}</p>`).join('')}</div>
            <div class="col-lg-4"><div class="bg-light rounded p-5"><h3 class="mb-4">${pageConfig.sideTitle}</h3>${(pageConfig.sideItems || []).map(item => `<p><i class="fa fa-check text-primary me-3"></i>${item}</p>`).join('')}<a class="btn btn-primary py-3 px-5 mt-3" href="quote.html">Teklif Al</a></div></div>
        </div></div></div>`);
}

const renderers = {
    choice: choicePage,
    architecture: () => sectorPage('architecture'),
    systems: () => sectorPage('systems'),
    about: aboutPage,
    service: servicePage,
    feature: featurePage,
    price: pricePage,
    team: teamPage,
    testimonial: testimonialPage,
    quote: quotePage,
    contact: contactPage,
    blog: blogPage,
    detail: detailPage
};

document.getElementById('app').innerHTML = (renderers[page] || choicePage)();




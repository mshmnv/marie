(() => {
  const translations = {
    ru: {
      nav: { work: 'РАБОТЫ', prices: 'ЦЕНЫ', about: 'ОБО МНЕ' },
      languageLabel: 'Выбрать язык',
      pageTitles: { home: 'MARIE — Портфолио', about: 'MARIE — Обо мне', pricing: 'MARIE — Съёмка' },
      home: {
        quote: 'я снимаю то, что исчезает за секунду. не постановочное, а живое, случайное, настоящее. для меня красота всегда была немного незапланированной.',
        cta: 'СНИМЕМ?',
        tagline: 'живые кадры, без постановки,\nтолько настоящие моменты',
        contact: 'написать мне →'
      },
      pricing: {
        lead: 'Снимаю людей такими, какие они есть —\nбез постановки и напряжения.\nТолько живые кадры.',
        tags: 'женский портрет · модельные тесты · контент для брендов',
        photo: 'ФОТО', faqTitle: 'ВОПРОСЫ', howTitle: 'КАК ЭТО РАБОТАЕТ',
        step1: 'Пишешь мне', step2: 'Обсуждаем идею и локацию', step3: 'Снимаем', step4: 'Получаешь готовые файлы',
        cta: 'написать мне'
      }
    },
    en: {
      nav: { work: 'WORK', prices: 'PRICES', about: 'ABOUT' },
      languageLabel: 'Choose language',
      pageTitles: { home: 'MARIE — Portfolio', about: 'MARIE — About', pricing: 'MARIE — Photoshoots' },
      home: {
        quote: 'I shoot what disappears in a second. Not staged, but alive, accidental, real. To me, beauty has always been a little unplanned.',
        cta: 'LET’S SHOOT?',
        tagline: 'real moments, no posing,\njust life as it happens',
        contact: 'get in touch →'
      },
      pricing: {
        lead: 'I photograph people as they are —\nunposed and at ease.\nJust real, alive moments.',
        tags: 'women’s portraits · model tests · brand content',
        photo: 'PHOTOGRAPHY', faqTitle: 'QUESTIONS', howTitle: 'HOW IT WORKS',
        step1: 'Get in touch', step2: 'We plan the idea and location', step3: 'We shoot', step4: 'Your finished photos are delivered',
        cta: 'get in touch'
      }
    },
    es: {
      nav: { work: 'TRABAJO', prices: 'PRECIOS', about: 'SOBRE MÍ' },
      languageLabel: 'Elegir idioma',
      pageTitles: { home: 'MARIE — Portfolio', about: 'MARIE — Sobre mí', pricing: 'MARIE — Sesiones' },
      home: {
        quote: 'Fotografío lo que desaparece en un segundo. Nada posado: vivo, espontáneo, real. Para mí, la belleza siempre ha sido un poco imprevisible.',
        cta: '¿HACEMOS FOTOS?',
        tagline: 'momentos reales, sin poses,\ntal como suceden',
        contact: 'escríbeme →'
      },
      pricing: {
        lead: 'Fotografío a las personas tal como son —\nsin poses forzadas ni tensión.\nSolo momentos reales y vivos.',
        tags: 'retrato femenino · tests de modelo · contenido para marcas',
        photo: 'FOTOGRAFÍA', faqTitle: 'PREGUNTAS', howTitle: 'CÓMO FUNCIONA',
        step1: 'Me escribes', step2: 'Hablamos de la idea y la ubicación', step3: 'Hacemos la sesión', step4: 'Recibes las fotos terminadas',
        cta: 'escríbeme'
      }
    }
  };

  const supported = Object.keys(translations);
  const storageKey = 'marie-site-language';
  const page = document.body.dataset.page || '';
  const listeners = new Set();

  function readSavedLanguage() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (supported.includes(saved)) return saved;
    } catch (_) { /* Storage may be disabled. */ }
    return 'ru';
  }

  let language = readSavedLanguage();

  function applyStaticTranslations() {
    const pack = translations[language];
    document.documentElement.lang = language;
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const value = element.getAttribute('data-i18n').split('.').reduce((current, key) => current?.[key], pack);
      if (typeof value === 'string') element.textContent = value;
    });
    document.querySelectorAll('.language-switcher button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === language));
    });
    const switcher = document.querySelector('.language-switcher');
    if (switcher) switcher.setAttribute('aria-label', pack.languageLabel);
    if (pack.pageTitles[page]) document.title = pack.pageTitles[page];
  }

  function setLanguage(nextLanguage) {
    if (!supported.includes(nextLanguage) || nextLanguage === language) return;
    language = nextLanguage;
    try { localStorage.setItem(storageKey, language); } catch (_) { /* Keep the selection for this page. */ }
    applyStaticTranslations();
    listeners.forEach(listener => listener(language));
  }

  function mountSwitcher() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks || navLinks.querySelector('.language-switcher')) return;
    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.setAttribute('role', 'group');
    switcher.setAttribute('aria-label', translations[language].languageLabel);
    for (const code of supported) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.lang = code;
      button.textContent = code.toUpperCase();
      button.setAttribute('aria-label', code.toUpperCase());
      button.addEventListener('click', () => setLanguage(code));
      switcher.appendChild(button);
    }
    navLinks.appendChild(switcher);
  }

  function onChange(listener) {
    listeners.add(listener);
    listener(language);
    return () => listeners.delete(listener);
  }

  mountSwitcher();
  applyStaticTranslations();

  window.SiteI18n = {
    getLanguage: () => language,
    getPack: () => translations[language],
    onChange,
    setLanguage
  };
})();

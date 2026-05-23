const menuToggle = document.querySelector("#menuToggle");
        const navLinks = document.querySelector("#navLinks");
        const themeToggle = document.querySelector("#themeToggle");
        const themeIcon = themeToggle.querySelector("i");
        const contactForm = document.querySelector("#contactForm");
        const languageSwitcher = document.querySelector(".language-switcher");
        const languageMenuToggle = document.querySelector("#languageMenuToggle");
        const currentLanguageLabel = document.querySelector("#currentLanguageLabel");
        const languageButtons = document.querySelectorAll(".language-option");
        const originalContent = new Map();
        const languageLabels = {
            en: "🇬🇧 English",
            fi: "🇫🇮 Suomi",
            fr: "🇫🇷 Français"
        };

        function getTranslationEntries(language) {
            const translations = window.portfolioTranslations?.[language] || {};
            return [
                ...Object.entries(translations.text || {}).map(([selector, value]) => ({ selector, value, property: "textContent" })),
                ...Object.entries(translations.html || {}).map(([selector, value]) => ({ selector, value, property: "innerHTML" }))
            ];
        }

        function rememberOriginalContent() {
            Object.keys(window.portfolioTranslations || {}).forEach((language) => {
                getTranslationEntries(language).forEach(({ selector }) => {
                    const element = document.querySelector(selector);
                    if (!element || originalContent.has(selector)) return;
                    originalContent.set(selector, {
                        innerHTML: element.innerHTML,
                        textContent: element.textContent
                    });
                });
            });
        }

        function updateLanguageButtons(language) {
            languageButtons.forEach((button) => {
                const isActive = button.dataset.lang === language;
                button.classList.toggle("active", isActive);
                button.setAttribute("aria-pressed", String(isActive));
            });
            currentLanguageLabel.textContent = languageLabels[language] || languageLabels.en;
        }

        function applyLanguage(language) {
            const normalizedLanguage = window.portfolioTranslations?.[language] ? language : "en";
            document.documentElement.lang = normalizedLanguage;

            if (normalizedLanguage !== "en") {
                const translations = window.portfolioTranslations[normalizedLanguage];
                document.title = translations.title;
                document.querySelector("meta[name='description']").setAttribute("content", translations.description);
                getTranslationEntries(normalizedLanguage).forEach(({ selector, value, property }) => {
                    const element = document.querySelector(selector);
                    if (!element) return;
                    element[property] = value;
                });
            } else {
                document.title = "Balde Mamadou | Software Developer Portfolio";
                document.querySelector("meta[name='description']").setAttribute("content", "Portfolio of Balde Mamadou, a software engineering graduate in Helsinki focused on full-stack, mobile, AI-integrated applications and IT support.");
                originalContent.forEach((content, selector) => {
                    const element = document.querySelector(selector);
                    if (!element) return;
                    element.innerHTML = content.innerHTML;
                });
            }

            localStorage.setItem("portfolioLanguage", normalizedLanguage);
            updateLanguageButtons(normalizedLanguage);
        }

        function setThemeIcon() {
            const darkMode = document.body.classList.contains("dark-mode");
            themeIcon.classList.toggle("fa-sun", darkMode);
            themeIcon.classList.toggle("fa-moon", !darkMode);
        }

        rememberOriginalContent();

        if (localStorage.getItem("darkMode") === "enabled") {
            document.body.classList.add("dark-mode");
            setThemeIcon();
        }

        applyLanguage(localStorage.getItem("portfolioLanguage") || "en");

        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("active");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.querySelector("i").classList.toggle("fa-bars", !isOpen);
            menuToggle.querySelector("i").classList.toggle("fa-xmark", isOpen);
        });

        document.querySelectorAll(".nav-links a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.querySelector("i").classList.add("fa-bars");
                menuToggle.querySelector("i").classList.remove("fa-xmark");
            });
        });

        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
            setThemeIcon();
        });

        languageButtons.forEach((button) => {
            button.addEventListener("click", () => {
                applyLanguage(button.dataset.lang);
                languageSwitcher.classList.remove("open");
                languageMenuToggle.setAttribute("aria-expanded", "false");
            });
        });

        languageMenuToggle.addEventListener("click", () => {
            const isOpen = languageSwitcher.classList.toggle("open");
            languageMenuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        document.addEventListener("click", (event) => {
            if (languageSwitcher.contains(event.target)) return;
            languageSwitcher.classList.remove("open");
            languageMenuToggle.setAttribute("aria-expanded", "false");
        });

        const sections = [...document.querySelectorAll("main section[id]")];
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                document.querySelectorAll(".nav-links a").forEach((link) => {
                    link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
                });
            });
        }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });

        sections.forEach((section) => observer.observe(section));

        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = new FormData(contactForm);
            const name = formData.get("name").trim();
            const email = formData.get("email").trim();
            const message = formData.get("message").trim();
            const language = localStorage.getItem("portfolioLanguage");
            const subjectText = {
                fi: `Portfolioyhteydenotto henkilöltä ${name}`,
                fr: `Contact portfolio de ${name}`
            };
            const fromLabels = {
                fi: "Lähettäjä",
                fr: "De"
            };
            const subject = encodeURIComponent(subjectText[language] || `Portfolio contact from ${name}`);
            const fromLabel = fromLabels[language] || "From";
            const body = encodeURIComponent(`${message}\n\n${fromLabel}: ${name}\nEmail: ${email}`);
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
        });
    

(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- Header: solid background once scrolled ----------
    const header = document.getElementById('siteHeader');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // ---------- Mobile navigation ----------
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    function setMenu(open) {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        links.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
    }

    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    links.addEventListener('click', (e) => {
        if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setMenu(false);
    });

    // ---------- Active nav link for the section in view ----------
    const navAnchors = [...links.querySelectorAll('a[href^="#"]')];
    const navTargets = navAnchors
        .map((a) => document.querySelector(a.getAttribute('href')))
        .filter(Boolean);

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navAnchors.forEach((a) => {
                a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navTargets.forEach((s) => sectionObserver.observe(s));

    // ---------- Reveal on scroll ----------
    const revealEls = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach((el) => el.classList.add('visible'));
    } else {
        // Stagger siblings that enter together
        revealEls.forEach((el) => {
            const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
            el.style.setProperty('--delay', (siblings.indexOf(el) * 0.08).toFixed(2) + 's');
        });
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach((el) => revealObserver.observe(el));
    }

    // ---------- Hero sound wave ----------
    const wave = document.querySelector('.soundwave');
    if (wave) {
        const count = Math.min(140, Math.floor(window.innerWidth / 9));
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const bar = document.createElement('i');
            const t = i / count;
            const envelope = 0.35 + 0.65 * Math.sin(Math.PI * t);
            bar.style.setProperty('--h', Math.round((20 + Math.random() * 80) * envelope) + '%');
            bar.style.setProperty('--d', (0.9 + Math.random() * 1.2).toFixed(2) + 's');
            bar.style.setProperty('--delay', (-Math.random() * 2).toFixed(2) + 's');
            frag.appendChild(bar);
        }
        wave.appendChild(frag);
    }

    // ---------- Spotlight on mission cards ----------
    document.querySelectorAll('.pillar').forEach((card) => {
        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
    });

    // ---------- Contact form with math captcha ----------
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    const captchaInput = document.getElementById('captcha');
    const question = document.getElementById('mathQuestion');
    let correctAnswer = 0;

    function generateMathQuestion() {
        const ops = ['+', '-', '×'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let a, b;
        if (op === '×') {
            a = Math.floor(Math.random() * 5) + 1;
            b = Math.floor(Math.random() * 5) + 1;
            correctAnswer = a * b;
        } else {
            a = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            if (op === '-' && b > a) [a, b] = [b, a];
            correctAnswer = op === '+' ? a + b : a - b;
        }
        question.textContent = `What is ${a} ${op} ${b}?`;
        captchaInput.value = '';
    }

    function setStatus(message, type) {
        status.textContent = message;
        status.className = 'form-status' + (type ? ' ' + type : '');
    }

    function validate() {
        let ok = true;
        form.querySelectorAll('input, textarea').forEach((field) => {
            const valid = field === captchaInput
                ? parseInt(field.value, 10) === correctAnswer
                : field.checkValidity();
            field.classList.toggle('invalid', !valid);
            if (!valid && ok) {
                field.focus();
                ok = false;
                setStatus(field === captchaInput
                    ? 'Please solve the math problem correctly to prove you are human.'
                    : 'Please fill in all fields with valid information.', 'error');
            }
        });
        return ok;
    }

    form.addEventListener('input', (e) => e.target.classList.remove('invalid'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const button = form.querySelector('button[type="submit"]');
        const label = button.querySelector('.btn-label');
        button.disabled = true;
        label.textContent = 'Sending…';
        setStatus('', '');

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });
            if (!response.ok) throw new Error('Request failed');
            form.reset();
            setStatus('Thank you for your message! We will get back to you soon. God bless!', 'success');
        } catch {
            setStatus('Sorry, something went wrong sending your message. Please try again shortly.', 'error');
        } finally {
            button.disabled = false;
            label.textContent = 'Send Message';
            generateMathQuestion();
        }
    });

    generateMathQuestion();
})();

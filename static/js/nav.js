/**
 * nav.js
 * Part of the Sort Scramble Visualization Engine.
 */

/* ═══════════════════════════════════════════════════════════════
   NAV COMPONENT — Hamburger toggle + scroll behavior
   ═══════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    const hamburger = document.getElementById('nav-hamburger');
    const navLinks  = document.getElementById('nav-links');

    if (!hamburger || !navLinks) return;

    const openIcon  = hamburger.querySelector('.hamburger-open');
    const closeIcon = hamburger.querySelector('.hamburger-close');

    // Toggle mobile menu
    hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('nav-open');
        openIcon.style.display  = isOpen ? 'none' : '';
        closeIcon.style.display = isOpen ? '' : 'none';
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a link is clicked (mobile)
    navLinks.addEventListener('click', (e) => {
        if (e.target.closest('.nav-link')) {
            navLinks.classList.remove('nav-open');
            openIcon.style.display  = '';
            closeIcon.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Add scroll shadow to nav
    const nav = document.getElementById('global-nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 10) {
            nav.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.3)';
        } else {
            nav.style.boxShadow = 'none';
        }
        lastScroll = scrollY;
    }, { passive: true });
})();


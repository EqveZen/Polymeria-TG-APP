// intro.js — приветственное окно
window.Polymeria = window.Polymeria || {};

(function() {
    'use strict';
    const P = window.Polymeria;

    P.Intro = {
        init: function() {
            const modal = document.getElementById('intro-modal');
            const btn = document.getElementById('btn-start-shift');
            if (!modal || !btn) return;

            function close() {
                modal.classList.add('hidden');
                if (window.Polymeria.cloudAvailable) {
                    window.Telegram.WebApp.CloudStorage.setItem('polymeria_intro_shown', '1', () => {});
                }
                localStorage.setItem('polymeria_intro_shown', '1');
            }

            btn.onclick = close;

            if (localStorage.getItem('polymeria_intro_shown') === '1') {
                modal.classList.add('hidden');
            } else if (window.Polymeria.cloudAvailable) {
                window.Telegram.WebApp.CloudStorage.getItem('polymeria_intro_shown', (err, value) => {
                    if (value === '1') {
                        localStorage.setItem('polymeria_intro_shown', '1');
                        modal.classList.add('hidden');
                    } else {
                        modal.classList.remove('hidden');
                    }
                });
            } else {
                modal.classList.remove('hidden');
            }
        }
    };
})();
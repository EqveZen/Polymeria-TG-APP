// navigation.js — навигация
window.Polymeria = window.Polymeria || {};

(function() {
    'use strict';
    const P = window.Polymeria;

    P.Navigation = {
        init: function() {
            const btns = document.querySelectorAll('.nav-btn');
            const tabs = document.querySelectorAll('.tab-content');

            function switchTab(name) {
                btns.forEach(b => b.classList.remove('active'));
                const ab = document.querySelector(`.nav-btn[data-tab="${name}"]`);
                if (ab) ab.classList.add('active');
                tabs.forEach(t => { t.classList.add('hidden'); t.classList.remove('active'); });
                const tt = document.getElementById('tab-' + name);
                if (tt) { tt.classList.remove('hidden'); tt.classList.add('active'); }
                if (name === 'profile') { P.Profile.updateTab(); P.Bonus.updateButton(); }
                if (name === 'shop') P.Profile.updateShopTab();
                if (name === 'tasks') { P.Tasks.init(); P.Tasks.updateUI(); P.Pass.updateTimer(); }
            }

            btns.forEach(b => b.addEventListener('click', () => switchTab(b.getAttribute('data-tab'))));
        }
    };
})();
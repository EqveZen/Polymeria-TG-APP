// telegram.js — интеграция Telegram Mini App
(function() {
    'use strict';
    if (!window.Polymeria) return;

    const isTelegram = window.Telegram && window.Telegram.WebApp;
    window.Polymeria.isTelegram = isTelegram;
    window.Polymeria.cloudAvailable = false;
    window.Polymeria.tgUser = null;

    function initTelegram() {
        if (!isTelegram) { console.log('Polymeria: не в Telegram'); return; }
        const tg = window.Telegram.WebApp;
        tg.ready();
        window.Polymeria.cloudAvailable = true;

        if (tg.initDataUnsafe?.user) {
            window.Polymeria.tgUser = tg.initDataUnsafe.user;
        }

        if (tg.colorScheme === 'dark') document.body.style.backgroundColor = '#1e1e1e';

        tg.CloudStorage.getItem('polymeria_save', (err, value) => {
            if (!err && value) {
                try {
                    const cloudState = JSON.parse(value);
                    const state = window.Polymeria.state;
                    if (!state) return;
                    if (cloudState.lastSave && state.lastSave && cloudState.lastSave > state.lastSave) {
                        Object.assign(state, cloudState);
                        window.Polymeria.updateUI();
                    } else if (!state.lastSave) {
                        Object.assign(state, cloudState);
                        window.Polymeria.updateUI();
                    }
                } catch(e) {}
            }
        });

        window.Polymeria.saveToCloud = function(state) {
            try {
                tg.CloudStorage.setItem('polymeria_save', JSON.stringify(state), (err) => {
                    if (err) console.error('CloudStorage save error:', err);
                });
            } catch(e) {}
        };
    }

    document.addEventListener('DOMContentLoaded', initTelegram);
})();
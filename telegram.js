// telegram.js — интеграция Telegram Mini App
(function() {
    'use strict';

    if (!window.Polymeria) return;

    const isTelegram = window.Telegram && window.Telegram.WebApp;
    window.Polymeria.isTelegram = isTelegram;
    window.Polymeria.cloudAvailable = false;

    function initTelegram() {
        if (!isTelegram) {
            console.log('Polymeria: не в Telegram, облачные сохранения недоступны.');
            return;
        }
        const tg = window.Telegram.WebApp;
        tg.ready();
        window.Polymeria.cloudAvailable = true;

        if (tg.colorScheme === 'dark') {
            document.body.style.backgroundColor = '#1e1e1e';
        }

        // Загрузка из облака
        tg.CloudStorage.getItem('polymeria_save', (err, value) => {
            if (!err && value) {
                try {
                    const cloudState = JSON.parse(value);
                    Object.assign(window.Polymeria.state, cloudState);
                    window.Polymeria.updateUI();
                } catch(e) {}
            }
        });

        window.Polymeria.saveToCloud = function(state) {
            try {
                tg.CloudStorage.setItem('polymeria_save', JSON.stringify(state), (err) => {
                    if (err) console.error('Ошибка сохранения в CloudStorage', err);
                });
            } catch(e) {}
        };
    }

    document.addEventListener('DOMContentLoaded', initTelegram);
})();
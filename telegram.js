// telegram.js — интеграция Telegram Mini App
(function() {
    'use strict';

    if (!window.Polymeria) window.Polymeria = {};

    const isTelegram = window.Telegram && window.Telegram.WebApp;
    window.Polymeria.isTelegram = isTelegram;
    window.Polymeria.tgUser = null;
    window.Polymeria.cloudAvailable = false;

    function initTelegram() {
        if (!isTelegram) {
            console.log('Polymeria: не в Telegram, облачные сохранения недоступны.');
            return;
        }
        const tg = window.Telegram.WebApp;
        tg.ready();
        window.Polymeria.cloudAvailable = true;

        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            window.Polymeria.tgUser = tg.initDataUnsafe.user;
            console.log('Polymeria: пользователь загружен', window.Polymeria.tgUser);
        } else {
            console.log('Polymeria: initDataUnsafe.user недоступен');
        }

        if (tg.colorScheme === 'dark') {
            document.body.style.backgroundColor = '#1e1e1e';
        }
    }

    // Сохранение в CloudStorage
    window.Polymeria.saveToCloud = function(state) {
        if (!isTelegram || !window.Telegram?.WebApp?.CloudStorage) return;
        try {
            window.Telegram.WebApp.CloudStorage.setItem('polymeria_save', JSON.stringify(state), (err) => {
                if (err) console.error('CloudStorage save error:', err);
            });
        } catch(e) { console.error('Save to cloud error:', e); }
    };

    // Загрузка из CloudStorage
    window.Polymeria.loadFromCloud = async function() {
        if (!isTelegram || !window.Telegram?.WebApp?.CloudStorage) return null;

        return new Promise((resolve) => {
            window.Telegram.WebApp.CloudStorage.getItem('polymeria_save', (err, value) => {
                if (!err && value) {
                    try {
                        resolve(JSON.parse(value));
                    } catch(e) { resolve(null); }
                } else {
                    resolve(null);
                }
            });
        });
    };

    document.addEventListener('DOMContentLoaded', initTelegram);
})();
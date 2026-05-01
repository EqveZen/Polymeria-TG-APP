// save.js — сохранение и загрузка
window.Polymeria = window.Polymeria || {};

(function() {
    'use strict';
    const P = window.Polymeria;

    P.Save = {
        save: function() {
            P.state.lastSave = Date.now();
            try {
                localStorage.setItem('polymeria_save', JSON.stringify(P.state));
                if (window.Polymeria.saveToCloud) window.Polymeria.saveToCloud(P.state);
            } catch(e) {}
        },

        load: async function() {
            let localData = null;
            try {
                const saved = localStorage.getItem('polymeria_save');
                if (saved) localData = JSON.parse(saved);
            } catch(e) {}

            if (window.Polymeria.loadFromCloud) {
                try {
                    const cloudData = await window.Polymeria.loadFromCloud();
                    if (cloudData && (cloudData.lastSave || 0) > (localData?.lastSave || 0)) {
                        Object.assign(P.state, P.defaults, cloudData);
                        localStorage.setItem('polymeria_save', JSON.stringify(P.state));
                    } else if (localData) {
                        Object.assign(P.state, P.defaults, localData);
                    }
                } catch(e) {
                    if (localData) Object.assign(P.state, P.defaults, localData);
                }
            } else if (localData) {
                Object.assign(P.state, P.defaults, localData);
            }

            P.state.sessionStart = Date.now();
            // Не вызываем UI.update() здесь — вызовется позже в startGame
        }
    };
})();
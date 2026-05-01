// promo.js — промокоды
window.Polymeria = window.Polymeria || {};

(function() {
    'use strict';
    const P = window.Polymeria;

    P.Promo = {
        data: { universal: [], personal: [] },

        defaultData: {
            universal: [
                { "code": "STAHANOVS12026DEV", "reward": { "type": "pass", "amount": 1 }, "used": [] },
                { "code": "STARS150", "reward": { "type": "stars", "amount": 150 }, "used": [] }
            ],
            personal: []
        },

        getUserId: function() {
            if (P.tgUser?.id) return 'tg_' + P.tgUser.id;
            if (!localStorage.getItem('polymeria_uid')) localStorage.setItem('polymeria_uid', 'web_' + Date.now());
            return localStorage.getItem('polymeria_uid');
        },

        redeem: function(code) {
            const uid = P.Promo.getUserId();
            const uc = code.toUpperCase().trim();
            const uni = P.Promo.data.universal?.find(p => p.code === uc);
            if (uni) {
                if (!uni.used) uni.used = [];
                if (uni.used.includes(uid)) return { success: false, message: 'Вы уже использовали этот промокод.' };
                uni.used.push(uid);
                P.Promo.apply(uni.reward);
                return { success: true, message: P.Promo.formatReward(uni.reward) };
            }
            const pers = P.Promo.data.personal?.find(p => p.code === uc);
            if (pers) {
                if (pers.used) return { success: false, message: 'Промокод уже использован.' };
                if (pers.for !== uid) return { success: false, message: 'Этот промокод не для вашего аккаунта.' };
                pers.used = true;
                P.Promo.apply(pers.reward);
                return { success: true, message: P.Promo.formatReward(pers.reward) };
            }
            return { success: false, message: 'Промокод не найден.' };
        },

        apply: function(r) {
            const s = P.state;
            switch(r.type) {
                case 'stars': s.stars += r.amount; break;
                case 'pass': s.passOwned = true; break;
                case 'purified': s.purified += r.amount; break;
                case 'robots': s.robots += r.amount; s.incomePerSec = s.robots * 0.1; break;
                case 'energy': s.energy = Math.min(100, s.energy + r.amount); break;
                case 'polymer': s.polymer += r.amount; s.dailyPolymerEarned += r.amount; break;
            }
            P.UI.update();
            P.Save.save();
            P.Profile.updateShopTab();
        },

        formatReward: function(r) {
            const n = { stars: 'звёзд', pass: 'Стахановский билет', purified: 'полимера', robots: 'роботов', energy: 'энергии', polymer: 'отработки' };
            if (r.type === 'pass') return 'Промокод активирован! Получен Стахановский билет.';
            return `Промокод активирован! Получено: ${r.amount} ${n[r.type] || ''}`;
        },

        init: function() {
            const btn = document.getElementById('btn-promo-submit');
            const input = document.getElementById('promo-input');
            const result = document.getElementById('promo-result');
            if (!btn || !input || !result) return;
            btn.addEventListener('click', () => {
                const code = input.value.trim();
                if (!code) { result.textContent = 'Введите промокод.'; result.className = 'promo-result promo-result-error'; return; }
                const res = P.Promo.redeem(code);
                result.textContent = res.message;
                result.className = 'promo-result ' + (res.success ? 'promo-result-success' : 'promo-result-error');
                if (res.success) input.value = '';
            });
            input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
        }
    };
})();
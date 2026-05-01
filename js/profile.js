// profile.js — профиль и магазин
window.Polymeria = window.Polymeria || {};

(function() {
    'use strict';
    const P = window.Polymeria;

    P.Profile = {
        updateTab: function() {
            const s = P.state;
            document.getElementById('profile-stars').textContent = Math.floor(s.stars);
            document.getElementById('profile-polymer').textContent = Math.floor(s.polymer);
            document.getElementById('profile-purified').textContent = Math.floor(s.purified);
            document.getElementById('profile-robots').textContent = s.robots;
            const u = P.tgUser;
            if (u) {
                const pn = document.getElementById('profile-name');
                const pph = document.getElementById('profile-photo-img');
                if (pn && u.first_name) pn.textContent = u.first_name + (u.last_name ? ' ' + u.last_name : '');
                if (pph && u.photo_url) { pph.src = u.photo_url; pph.style.filter = 'none'; }
            }
        },

        updateShopTab: function() {
            const s = document.getElementById('shop-stars');
            if (s) s.textContent = Math.floor(P.state.stars);
        },

        initButtons: function() {
            document.getElementById('btn-withdraw-stars')?.addEventListener('click', () => {
                alert('Вывод звёзд.\nФункция появится позже.');
            });
            document.getElementById('btn-invite-friend')?.addEventListener('click', () => {
                alert('Пригласи друга.\nРеферальная система скоро заработает.');
            });
        }
    };
})();
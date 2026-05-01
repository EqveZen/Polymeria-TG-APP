// loading.js — экран загрузки
window.Polymeria = window.Polymeria || {};

(function() {
    'use strict';
    const P = window.Polymeria;

    P.Loading = {
        setText: function(text) {
            const el = document.getElementById('loading-text');
            if (el) el.textContent = text;
        },

        hide: function() {
            const screen = document.getElementById('loading-screen');
            if (screen) screen.style.display = 'none';
        },

        showError: function() {
            const gear = document.getElementById('loading-gear');
            const text = document.getElementById('loading-text');
            const error = document.getElementById('loading-error');
            if (gear) gear.style.display = 'none';
            if (text) text.style.display = 'none';
            if (error) error.style.display = 'block';
        }
    };
})();
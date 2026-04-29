// collapse.js — Полимерный коллапс v0.3 (с анимациями)
(function() {
    'use strict';

    if (!window.Polymeria) return;

    const COLLAPSE_HOURS = window.Polymeria.COLLAPSE_HOURS || [6, 12, 18, 0];
    let lastCollapseKey = null;

    function createModal() {
        let modal = document.getElementById('collapse-modal');
        if (modal) return modal;
        modal = document.createElement('div');
        modal.id = 'collapse-modal';
        modal.className = 'modal hidden';
        document.body.appendChild(modal);
        return modal;
    }

    function showCollapseModal(rewardCallback) {
        const modal = createModal();
        modal.innerHTML = `
            <div class="modal-content">
                <h2>⚡ ПОЛИМЕРНЫЙ КОЛЛАПС</h2>
                <p>Реактор нестабилен. Ваши действия:</p>
                <button id="collapse-risk">РИСКНУТЬ (+200% полимера, −30 энергии)</button>
                <button id="collapse-cool">ОХЛАДИТЬ (безопасно, +50 полимера)</button>
                <button id="collapse-redirect">ПЕРЕНАПРАВИТЬ (+100 полимера, +1 робот)</button>
            </div>
        `;
        modal.classList.remove('hidden');

        // Добавляем свечение на все панели
        document.querySelectorAll('.panel').forEach(p => p.classList.add('collapse-glow'));

        // Обработчики
        document.getElementById('collapse-risk').onclick = () => {
            const state = window.Polymeria.state;
            state.polymer += state.baseClickValue * 50;
            state.energy = Math.max(0, state.energy - 30);
            window.Polymeria.updateUI();
            window.Polymeria.saveGame();
            modal.classList.add('hidden');
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('collapse-glow'));
            if (rewardCallback) rewardCallback('risk');
        };
        document.getElementById('collapse-cool').onclick = () => {
            const state = window.Polymeria.state;
            state.polymer += 50;
            window.Polymeria.updateUI();
            window.Polymeria.saveGame();
            modal.classList.add('hidden');
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('collapse-glow'));
            if (rewardCallback) rewardCallback('cool');
        };
        document.getElementById('collapse-redirect').onclick = () => {
            const state = window.Polymeria.state;
            state.polymer += 100;
            state.robots += 1;
            state.incomePerSec = state.robots * 0.1;
            window.Polymeria.updateUI();
            window.Polymeria.saveGame();
            modal.classList.add('hidden');
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('collapse-glow'));
            if (rewardCallback) rewardCallback('redirect');
        };
    }

    function checkCollapse() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${hour}`;
        if (COLLAPSE_HOURS.includes(hour) && minute === 0 && lastCollapseKey !== key) {
            lastCollapseKey = key;
            if (window.Polymeria.state) {
                const lampCollapse = document.getElementById('lamp-collapse');
                if (lampCollapse) {
                    lampCollapse.className = 'status-lamp collapse-active';
                }
                const lampNormal = document.getElementById('lamp-normal');
                if (lampNormal) lampNormal.className = 'status-lamp off';

                showCollapseModal(() => {
                    if (lampCollapse) lampCollapse.className = 'status-lamp off';
                    if (lampNormal) lampNormal.className = 'status-lamp on';
                });
            }
        }
    }

    setInterval(checkCollapse, 15000);

    window.Polymeria.collapse = {
        checkCollapse: checkCollapse
    };
})();
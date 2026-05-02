// collapse.js — Полимерный коллапс: мини-игра «Подписание документа»
(function() {
    'use strict';

    if (!window.Polymeria) return;

    const COLLAPSE_HOURS = window.Polymeria.COLLAPSE_HOURS || [6, 12, 18, 0];
    let lastCollapseKey = null;

    // Пул подписантов: правильная фамилия + должность
    const signers = [
        { name: 'Иванов И.И.', title: 'Главный инженер' },
        { name: 'Петров П.П.', title: 'Начальник цеха' },
        { name: 'Сидоров С.С.', title: 'Дежурный реакторщик' },
        { name: 'Кузнецов К.К.', title: 'Мастер смены' },
        { name: 'Смирнов С.С.', title: 'Технолог полимера' },
        { name: 'Фёдоров Ф.Ф.', title: 'Инспектор ОТК' },
        { name: 'Васильев В.В.', title: 'Бригадир' },
        { name: 'Морозов М.М.', title: 'Энергетик' },
        { name: 'Зайцев З.З.', title: 'Механик-наладчик' },
        { name: 'Борисов Б.Б.', title: 'Лаборант-химик' }
    ];

    let collapseActive = false;
    let collapseTimer = null;
    let timeLeft = 15;

    function createModal() {
        let modal = document.getElementById('collapse-modal');
        if (modal) return modal;
        modal = document.createElement('div');
        modal.id = 'collapse-modal';
        modal.className = 'modal hidden';
        document.body.appendChild(modal);
        return modal;
    }

    function getRandomSigner() {
        return signers[Math.floor(Math.random() * signers.length)];
    }

    function getFakeSigners(correctSigner) {
        // Две другие фамилии из пула, не совпадающие с правильной
        const others = signers.filter(s => s.name !== correctSigner.name);
        const shuffled = [...others].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 2);
    }

    function showCollapseGame() {
        collapseActive = true;
        timeLeft = 15;

        const modal = createModal();
        const correctSigner = getRandomSigner();
        const fakeSigners = getFakeSigners(correctSigner);

        // Три варианта: правильный + 2 фальшивых, перемешать
        const options = [
            { name: correctSigner.name, title: correctSigner.title, correct: true },
            { name: fakeSigners[0].name, title: fakeSigners[0].title, correct: false },
            { name: fakeSigners[1].name, title: fakeSigners[1].title, correct: false }
        ].sort(() => Math.random() - 0.5);

        // Дата для документа
        const now = new Date();
        const day = now.getDate();
        const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
        const month = months[now.getMonth()];
        const year = 1955;
        const orderNum = Math.floor(Math.random() * 9000) + 1000;

        modal.innerHTML = `
            <div class="modal-content collapse-game-content">
                <div class="collapse-game-header">
                    <span class="collapse-stamp">СРОЧНО</span>
                    <h2>ПРИКАЗ №${orderNum}</h2>
                    <div class="collapse-date">от ${day} ${month} ${year} г.</div>
                </div>
                <div class="collapse-game-body">
                    <p>В связи с нестабильностью полимерного реактора и угрозой коллапса,</p>
                    <p><strong>ПРИКАЗЫВАЮ:</strong></p>
                    <ol>
                        <li>Принять срочные меры по стабилизации реактора.</li>
                        <li>Подписать документ у ответственного лица:</li>
                    </ol>
                    <div class="collapse-hint">
                        ⚠ Документ должен подписать: <strong>${correctSigner.name}</strong> — ${correctSigner.title}
                    </div>
                    <p>Выберите правильную подпись:</p>
                    <div class="collapse-signatures">
                        ${options.map((opt, i) => `
                            <button class="collapse-sign-btn" data-correct="${opt.correct}" data-index="${i}">
                                ${opt.name}<br><small>${opt.title}</small>
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="collapse-timer" id="collapse-timer">
                    Осталось: <span id="collapse-time-left">15</span> сек
                </div>
            </div>
        `;
        modal.classList.remove('hidden');

        // Таймер
        document.getElementById('collapse-time-left').textContent = timeLeft;
        collapseTimer = setInterval(() => {
            timeLeft--;
            document.getElementById('collapse-time-left').textContent = timeLeft;
            if (timeLeft <= 5) {
                document.getElementById('collapse-timer').style.color = '#cc0000';
            }
            if (timeLeft <= 0) {
                clearInterval(collapseTimer);
                resolveCollapse('timeout');
            }
        }, 1000);

        // Подсветка панелей
        document.querySelectorAll('.panel').forEach(p => p.classList.add('collapse-glow'));
        document.getElementById('lamp-collapse').className = 'status-lamp collapse-active';
        document.getElementById('lamp-normal').className = 'status-lamp off';

        // Обработчики кнопок подписи
        document.querySelectorAll('.collapse-sign-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                clearInterval(collapseTimer);
                const isCorrect = btn.getAttribute('data-correct') === 'true';
                resolveCollapse(isCorrect ? 'correct' : 'wrong');
            });
        });
    }

    function resolveCollapse(result) {
        collapseActive = false;
        const modal = document.getElementById('collapse-modal');
        if (modal) modal.classList.add('hidden');

        document.querySelectorAll('.panel').forEach(p => p.classList.remove('collapse-glow'));
        document.getElementById('lamp-collapse').className = 'status-lamp off';
        document.getElementById('lamp-normal').className = 'status-lamp on';

        const state = window.Polymeria.state;

        if (result === 'correct') {
            state.purified += 20;
            state.energy = Math.min(100, state.energy + 80);
            window.Polymeria.updateUI();
            window.Polymeria.saveGame();
            alert('✅ Документ подписан верно!\n+20 полимера, +80 энергии');
        } else if (result === 'wrong') {
            state.energy = Math.max(0, state.energy - 10);
            state.polymer += 20;
            window.Polymeria.updateUI();
            window.Polymeria.saveGame();
            alert('❌ Неправильная подпись!\n-10 энергии, +20 отработки (утешительный)');
        } else if (result === 'timeout') {
            state.energy = Math.max(0, state.energy - 10);
            window.Polymeria.updateUI();
            window.Polymeria.saveGame();
            alert('⏰ Время вышло! Документ не подписан.\n-10 энергии');
        }
    }

    function checkCollapse() {
        if (collapseActive) return;

        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${hour}`;

        if (COLLAPSE_HOURS.includes(hour) && minute === 0 && lastCollapseKey !== key) {
            lastCollapseKey = key;
            if (window.Polymeria.state) {
                showCollapseGame();
            }
        }
    }

    setInterval(checkCollapse, 15000);

    window.Polymeria.collapse = { checkCollapse: checkCollapse };
})();
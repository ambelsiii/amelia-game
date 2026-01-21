const symbols = ['🍎', '🥦', '🌽', '🍓', '🍇', '🥕', '🍍', '🍉', '🥑', '🍆', '🥥', '🍊', '🍒', '🍋'];
let playerName = "";
let moves = 0;
let timer = 0;
let timerInterval;
let flippedCards = [];
let matchedCount = 0;
let isLock = false;
let currentLevel = 1;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
    if(id === 'menu') updateBestScore();
}

function enterMenu() {
    const input = document.getElementById('player-name');
    playerName = input.value.trim() || "Player";
    document.getElementById('welcome-msg').innerText = `Halo, ${playerName}!`;
    sfx.click(); 
    showScreen('menu');
}

function updateBestScore() {
    const best = localStorage.getItem('bestMoves') || "-";
    document.getElementById('best-score').innerText = `Best Moves: ${best}`;
}

function startLevel(level) {
    currentLevel = level;
    moves = 0; timer = 0; matchedCount = 0; flippedCards = []; isLock = false;
    document.getElementById('lvl-display').innerText = level;
    document.getElementById('moves-display').innerText = '0';
    document.getElementById('timer-display').innerText = '0';
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        document.getElementById('timer-display').innerText = timer;
    }, 1000);

    initGrid(level);
    showScreen('game');
}

function initGrid(level) {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    
    // Tentukan jumlah kartu (Level 1: 8, Level 2: 12, dst)
    let totalCards = 8 + (level - 1) * 4;
    if(totalCards > 24) totalCards = 24;

    // Logika 2 Baris: Kolom = Total Kartu dibagi 2
    const cols = totalCards / 2;
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    const levelSymbols = symbols.slice(0, totalCards/2);
    const deck = [...levelSymbols, ...levelSymbols].sort(() => Math.random() - 0.5);

    deck.forEach(symbol => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${symbol}</div>
            </div>`;
        card.onclick = () => flipCard(card, symbol, totalCards/2);
        grid.appendChild(card);
    });
}

function flipCard(el, sym, totalPairs) {
    if(isLock || el.classList.contains('flipped') || el.classList.contains('matched')) return;
    
    sfx.click();
    el.classList.add('flipped');
    flippedCards.push({el, sym});

    if(flippedCards.length === 2) {
        moves++;
        document.getElementById('moves-display').innerText = moves;
        isLock = true;
        
        if(flippedCards[0].sym === flippedCards[1].sym) {
            setTimeout(() => {
                flippedCards.forEach(c => c.el.classList.add('matched'));
                sfx.match();
                matchedCount++;
                flippedCards = [];
                isLock = false;
                
                if(matchedCount === totalPairs) {
                    clearInterval(timerInterval);
                    sfx.win();
                    setTimeout(() => {
                        alert(`Hebat ${playerName}! Level ${currentLevel} Selesai.`);
                        startLevel(currentLevel + 1);
                    }, 600);
                }
            }, 400);
        } else {
            setTimeout(() => {
                sfx.fail();
                flippedCards.forEach(c => c.el.classList.remove('flipped'));
                flippedCards = [];
                isLock = false;
            }, 800);
        }
    }
}
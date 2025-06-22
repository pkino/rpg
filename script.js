class Character {
  constructor(name, hp, maxHp, attack, healPower = 0) {
    this.name = name;
    this.hp = hp;
    this.maxHp = maxHp;
    this.attackPower = attack;
    this.healPower = healPower;
  }

  isAlive() {
    return this.hp > 0;
  }
}

const logEl = document.getElementById('log');
const statusEl = document.getElementById('status');
const choicesEl = document.getElementById('choices');
const enemyImageEl = document.getElementById('enemy-image');

const enemySprites = {
  'スライム': '🟢',
  'ゴブリン': '👹',
  'ドラゴン': '🐉'
};
const mapEl = document.getElementById('map');

const mapWidth = 5;
const mapHeight = 5;
let playerPos = { x: 0, y: 0 };

function drawMap() {
  mapEl.style.gridTemplateColumns = `repeat(${mapWidth}, 40px)`;
  mapEl.style.gridTemplateRows = `repeat(${mapHeight}, 40px)`;
  mapEl.innerHTML = '';
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = x;
      cell.dataset.y = y;
      mapEl.appendChild(cell);
    }
  }
  updatePlayerPos();
}

function updatePlayerPos() {
  const cells = mapEl.querySelectorAll('.cell');
  cells.forEach(c => c.classList.remove('player'));
  const idx = playerPos.y * mapWidth + playerPos.x;
  if (cells[idx]) cells[idx].classList.add('player');
}

function movePlayer(dx, dy) {
  const nx = playerPos.x + dx;
  const ny = playerPos.y + dy;
  if (nx >= 0 && nx < mapWidth && ny >= 0 && ny < mapHeight && !enemy) {
    playerPos.x = nx;
    playerPos.y = ny;
    updatePlayerPos();
  }
}

document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp':
      movePlayer(0, -1); break;
    case 'ArrowDown':
      movePlayer(0, 1); break;
    case 'ArrowLeft':
      movePlayer(-1, 0); break;
    case 'ArrowRight':
      movePlayer(1, 0); break;
  }
});

const player = new Character('勇者', 40, 40, 6, 4);
// プレイヤーの所持道具
player.items = { potion: 1 };
let enemy;
let scene = 0;

function updateEnemyImage() {
  if (enemy && enemySprites[enemy.name]) {
    enemyImageEl.textContent = enemySprites[enemy.name];
  } else {
    enemyImageEl.textContent = '';
  }
  enemyImageEl.classList.remove('hit');
}

function updateStatus() {
  statusEl.textContent = `あなたのHP: ${player.hp}/${player.maxHp}` + (enemy ? ` ${enemy.name}のHP: ${enemy.hp}` : '');
  updateEnemyImage();
}

function addLog(message) {
  const p = document.createElement('p');
  p.textContent = message;
  logEl.appendChild(p);
  logEl.scrollTop = logEl.scrollHeight;
}

function clearChoices() {
  choicesEl.innerHTML = '';
}

function addChoice(text, handler) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.onclick = handler;
  choicesEl.appendChild(btn);
}

// 戦闘時の選択肢を表示
function showBattleOptions() {
  addChoice('攻撃', playerAttack);
  addChoice('回復', playerHeal);
  if (player.items.potion > 0) {
    addChoice('道具', useItemMenu);
  }
}

// 道具メニュー
function useItemMenu() {
  clearChoices();
  if (player.items.potion > 0) {
    addChoice('薬草を使う', () => {
      player.items.potion--;
      const healAmount = 10;
      player.hp = Math.min(player.maxHp, player.hp + healAmount);
      addLog(`薬草を使った！HPが${healAmount}回復した！`);
      enemyAttack();
      updateStatus();
      showBattleOptions();
    });
  } else {
    addLog('使える道具がない！');
  }
  addChoice('戻る', showBattleOptions);
}

function playerAttack() {
  if (!enemy || !player.isAlive()) return;
  const dmg = Math.floor(Math.random() * player.attackPower) + 1;
  enemy.hp -= dmg;
  addLog(`あなたの攻撃！${enemy.name}に${dmg}のダメージ！`);
  enemyImageEl.classList.add('hit');
  setTimeout(() => enemyImageEl.classList.remove('hit'), 300);
  if (!enemy.isAlive()) {
    addLog(`${enemy.name}を倒した！`);
    enemy = null;
    scene++;
    nextScene();
  } else {
    enemyAttack();
  }
  updateStatus();
}

function playerHeal() {
  if (!enemy || !player.isAlive()) return;
  const healAmount = Math.floor(Math.random() * player.healPower) + 1;
  player.hp = Math.min(player.maxHp, player.hp + healAmount);
  addLog(`回復！HPが${healAmount}回復した！`);
  enemyAttack();
  updateStatus();
}

function enemyAttack() {
  if (!enemy || !enemy.isAlive()) return;
  const dmg = Math.floor(Math.random() * 4) + 1;
  player.hp -= dmg;
  addLog(`${enemy.name}の攻撃！あなたは${dmg}のダメージ！`);
  if (!player.isAlive()) {
    player.hp = 0;
    addLog('あなたは倒れてしまった... ゲームオーバー');
    clearChoices();
  }
}

function nextScene() {
  clearChoices();
  switch(scene) {
    case 0:
      addLog('あなたは旅立ちの村にいる。外に出ますか？');
      addChoice('外に出る', () => { scene++; nextScene(); });
      break;
    case 1:
      addLog('森でスライムが現れた！');
      enemy = new Character('スライム', 15, 15, 3);
      showBattleOptions();
      break;
    case 2:
      addLog('さらに奥へ進むとゴブリンが立ち塞がった！');
      enemy = new Character('ゴブリン', 20, 20, 4);
      showBattleOptions();
      break;
    case 3:
      addLog('ボスのドラゴンが現れた！');
      enemy = new Character('ドラゴン', 40, 40, 6);
      showBattleOptions();
      break;
    case 4:
      addLog('ドラゴンを倒した！世界に平和が訪れた...');
      addChoice('もう一度遊ぶ', () => { location.reload(); });
      break;
  }
  updateStatus();
}

drawMap();
nextScene();

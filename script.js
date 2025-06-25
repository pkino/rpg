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

const player = new Character('勇者', 40, 40, 6, 4);
let enemy;
let locationIndex = 0;
let state = 'map';

const mapData = [
  { description: 'あなたは旅立ちの村にいる。外に出ますか？' },
  { description: '森に入った。スライムが現れた！', enemy: { name: 'スライム', hp: 15, maxHp: 15, attack: 3 } },
  { description: 'さらに奥へ進むとゴブリンが立ち塞がった！', enemy: { name: 'ゴブリン', hp: 20, maxHp: 20, attack: 4 } },
  { description: 'ボスのドラゴンが現れた！', enemy: { name: 'ドラゴン', hp: 40, maxHp: 40, attack: 6 } },
  { description: 'ドラゴンを倒した！世界に平和が訪れた...' }
];

function updateStatus() {
  statusEl.textContent = `あなたのHP: ${player.hp}/${player.maxHp}` + (enemy ? `    ${enemy.name}のHP: ${enemy.hp}` : '');
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

function playerAttack() {
  if (state !== 'battle' || !enemy || !player.isAlive()) return;
  const dmg = Math.floor(Math.random() * player.attackPower) + 1;
  enemy.hp -= dmg;
  addLog(`あなたの攻撃！${enemy.name}に${dmg}のダメージ！`);
  if (!enemy.isAlive()) {
    victory();
  } else {
    enemyAttack();
  }
  updateStatus();
}

function playerHeal() {
  if (state !== 'battle' || !enemy || !player.isAlive()) return;
  const healAmount = Math.floor(Math.random() * player.healPower) + 1;
  player.hp = Math.min(player.maxHp, player.hp + healAmount);
  addLog(`回復！HPが${healAmount}回復した！`);
  enemyAttack();
  updateStatus();
}

function enemyAttack() {
  if (state !== 'battle' || !enemy || !enemy.isAlive()) return;
  const dmg = Math.floor(Math.random() * 4) + 1;
  player.hp -= dmg;
  addLog(`${enemy.name}の攻撃！あなたは${dmg}のダメージ！`);
  if (!player.isAlive()) {
    player.hp = 0;
    addLog('あなたは倒れてしまった... ゲームオーバー');
    clearChoices();
  }
}

function victory() {
  addLog(`${enemy.name}を倒した！`);
  enemy = null;
  state = 'map';
  locationIndex++;
  showMap();
}

function showMap() {
  state = 'map';
  clearChoices();
  const loc = mapData[locationIndex];
  addLog(loc.description);
  if (loc.enemy) {
    addChoice('戦う', () => startBattle(loc.enemy));
  } else {
    if (locationIndex < mapData.length - 1) {
      addChoice('次へ進む', () => { locationIndex++; showMap(); });
    } else {
      addChoice('もう一度遊ぶ', () => { location.reload(); });
    }
  }
  updateStatus();
}

function startBattle(enemyData) {
  enemy = new Character(enemyData.name, enemyData.hp, enemyData.maxHp, enemyData.attack);
  state = 'battle';
  clearChoices();
  addLog(`${enemy.name}が現れた！`);
  addChoice('攻撃', playerAttack);
  addChoice('回復', playerHeal);
  updateStatus();
}

showMap();

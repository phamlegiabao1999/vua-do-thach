import { Economy } from './Economy.js';
import { Stone } from './Stone.js';
import { Flashlight } from './Flashlight.js';
import { Cutter } from './Cutter.js';
import { SoundManager } from './SoundManager.js';
import { Haptics } from './Haptics.js';
import { Shop } from './Shop.js';
import { Storage } from './Storage.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Tải dữ liệu lưu cũ (nếu có)
const savedData = Storage.load();

const economy = new Economy(savedData ? savedData.cash : 1000);
const sounds = new SoundManager();
const shop = new Shop(economy, sounds);
if (savedData && savedData.levels) {
  shop.loadLevels(savedData.levels);
}

const flashlight = new Flashlight(shop.getFlashlightRadius());
const cutter = new Cutter();

let currentMode = 'INSPECT';
let stone = null;
let isMouseDown = false;
let lastGlowVibrateTime = 0;

const STONE_TIERS = {
  LOW: { name: 'Đá Thô Rẻ', cost: 200, probabilities: { 0: 0.55, 1: 0.35, 2: 0.08, 3: 0.02 } },
  HIGH: { name: 'Đá Cấp Cao', cost: 600, probabilities: { 0: 0.25, 1: 0.45, 2: 0.22, 3: 0.08 } }
};

// UI Elements
const btnBuyLow = document.getElementById('btn-buy-low');
const btnBuyHigh = document.getElementById('btn-buy-high');
const btnMode = document.getElementById('btn-mode');
const btnCut = document.getElementById('btn-cut');
const btnSell = document.getElementById('btn-sell');
const btnOpenShop = document.getElementById('btn-open-shop');
const btnCloseShop = document.getElementById('btn-close-shop');
const shopModal = document.getElementById('shop-modal');
const statusText = document.getElementById('status-text');

function saveProgress() {
  Storage.save({
    cash: economy.cash,
    levels: shop.levels
  });
}

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

function updateControls() {
  const hasStone = !!stone;
  const isSliced = hasStone && stone.isSliced;

  btnBuyLow.disabled = hasStone || !economy.canAfford(STONE_TIERS.LOW.cost);
  btnBuyHigh.disabled = hasStone || !economy.canAfford(STONE_TIERS.HIGH.cost);
  btnMode.disabled = !hasStone || isSliced;
  btnCut.disabled = !hasStone || isSliced;
  btnSell.disabled = !isSliced;

  // Cập nhật bán kính đèn theo cấp độ shop
  flashlight.setRadius(shop.getFlashlightRadius());
}

function buyStone(tier) {
  sounds.init();
  if (stone) return;
  if (!economy.deduct(tier.cost)) {
    alert('Bạn không đủ tiền mua viên đá này!');
    return;
  }

  saveProgress();
  sounds.playClick();
  Haptics.medium();

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  stone = new Stone(centerX, centerY, 110, tier);

  currentMode = 'INSPECT';
  btnMode.innerText = 'Chế độ: Soi Đèn 🔦';
  btnMode.classList.remove('active');
  cutter.reset();

  statusText.innerHTML = `Đã mua <strong>${tier.name}</strong> ($${tier.cost}). Rê chuột/vuốt để <span>soi mảng ngọc</span>!`;
  updateControls();
}

btnBuyLow.addEventListener('click', () => buyStone(STONE_TIERS.LOW));
btnBuyHigh.addEventListener('click', () => buyStone(STONE_TIERS.HIGH));

btnMode.addEventListener('click', () => {
  sounds.init();
  if (!stone || stone.isSliced) return;

  sounds.playClick();
  Haptics.medium();

  if (currentMode === 'INSPECT') {
    currentMode = 'CUT';
    btnMode.innerText = 'Chế độ: Vạch Đường 🪚';
    btnMode.classList.add('active');
    statusText.innerText = 'Vuốt kéo trên mặt đá để vạch đường cưa!';
  } else {
    currentMode = 'INSPECT';
    btnMode.innerText = 'Chế độ: Soi Đèn 🔦';
    btnMode.classList.remove('active');
    statusText.innerText = 'Soi tìm mảng ngọc ẩn trước khi cắt!';
  }
});

btnCut.addEventListener('click', () => {
  sounds.init();
  if (!stone || stone.isSliced) return;

  if (!cutter.hasValidLine()) {
    alert('Hãy kéo một đường cưa dài qua quả đá trước!');
    return;
  }

  sounds.playSawSound(0.8);
  Haptics.heavyPattern();

  stone.slice();
  const gem = stone.colors[stone.gemCore.quality];

  // Tính giá bán có cộng % bonus từ Lưỡi cưa
  const basePrice = stone.getSellingPrice();
  const bonusMultiplier = shop.getSawBonus();
  const finalPrice = Math.round(basePrice * (1 + bonusMultiplier));

  stone.finalCalculatedPrice = finalPrice;

  if (stone.gemCore.quality >= 2) {
    setTimeout(() => sounds.playGemWin(), 300);
  }

  let bonusText = bonusMultiplier > 0 ? ` <span style="color:#2ea043">(+${Math.round(bonusMultiplier*100)}% Lưỡi Kim Cương)</span>` : '';
  statusText.innerHTML = `Đã xẻ đá! Phát hiện: <strong style="color: ${gem.core}">${gem.name}</strong>. Định giá: <strong>$${finalPrice}</strong>${bonusText}`;
  updateControls();
});

btnSell.addEventListener('click', () => {
  sounds.init();
  if (!stone || !stone.isSliced) return;

  const price = stone.finalCalculatedPrice || stone.getSellingPrice();
  economy.add(price);
  saveProgress();

  sounds.playCoinChime();
  Haptics.medium();

  alert(`Bạn đã bán sản phẩm ngọc thành công, thu về $${price}!`);
  stone = null;
  cutter.reset();

  statusText.innerHTML = 'Hãy mua viên <span>Nguyên Thạch</span> tiếp theo để tiếp tục!';
  updateControls();
});

// Quản lý Modal Cửa Hàng
btnOpenShop.addEventListener('click', () => {
  sounds.init();
  sounds.playClick();
  renderShopUI();
  shopModal.classList.add('active');
});

btnCloseShop.addEventListener('click', () => {
  sounds.playClick();
  shopModal.classList.remove('active');
  updateControls();
});

function renderShopUI() {
  const shopList = document.getElementById('shop-items-list');
  shopList.innerHTML = '';

  Object.keys(shop.catalog).forEach(itemKey => {
    const item = shop.catalog[itemKey];
    const currentLvl = shop.levels[itemKey];
    const nextConfig = item.configs.find(c => c.level === currentLvl + 1);

    const card = document.createElement('div');
    card.className = 'shop-item';
    
    let btnHTML = '';
    if (nextConfig) {
      btnHTML = `<button class="btn-upgrade" data-key="${itemKey}">Nâng cấp $${nextConfig.cost.toLocaleString()}</button>`;
    } else {
      btnHTML = `<button disabled>Đã Đạt Cấp Tối Đa</button>`;
    }

    card.innerHTML = `
      <div class="shop-item-info">
        <strong>${item.name}</strong>
        <p>${item.desc}</p>
        <div class="level-tag">Cấp hiện tại: ${currentLvl}/${item.configs.length - (itemKey === 'lens' ? 1 : 0)}</div>
      </div>
      ${btnHTML}
    `;

    shopList.appendChild(card);
  });

  // Gắn sự kiện click nút mua nâng cấp
  document.querySelectorAll('.btn-upgrade').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = e.target.getAttribute('data-key');
      const res = shop.buyUpgrade(key);
      alert(res.msg);
      if (res.success) {
        saveProgress();
        renderShopUI();
        updateControls();
      }
    });
  });
}

// Xử lý Sự kiện Chuột / Cảm ứng
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function handleStart(e) {
  sounds.init();
  isMouseDown = true;
  const pos = getPos(e);

  if (currentMode === 'INSPECT' && stone && !stone.isSliced) {
    flashlight.updatePosition(pos.x, pos.y);
  } else if (currentMode === 'CUT' && stone && !stone.isSliced) {
    cutter.startLine(pos.x, pos.y);
  }
}

function handleMove(e) {
  if (!isMouseDown && e.type.startsWith('mouse')) return;
  const pos = getPos(e);

  if (currentMode === 'INSPECT' && stone && !stone.isSliced) {
    flashlight.updatePosition(pos.x, pos.y);

    const gemX = stone.x + stone.gemCore.offsetX;
    const gemY = stone.y + stone.gemCore.offsetY;
    const dist = Math.hypot(pos.x - gemX, pos.y - gemY);

    const now = Date.now();
    if (dist < stone.gemCore.size && now - lastGlowVibrateTime > 120) {
      Haptics.light();
      lastGlowVibrateTime = now;
    }

    // Nếu đã sở hữu Kính Thẩm Định -> Hiển thị thông số phân tích
    const lens = shop.getLensStatus();
    if (lens.active && dist < stone.gemCore.size + flashlight.radius) {
      const gem = stone.colors[stone.gemCore.quality];
      statusText.innerHTML = `🔍 <strong>Kính Thẩm Định:</strong> Phát hiện tín hiệu ngọc <span>${gem.name}</span>!`;
    }
  } else if (currentMode === 'CUT' && stone && !stone.isSliced) {
    cutter.updateLine(pos.x, pos.y);
  }
}

function handleEnd() {
  isMouseDown = false;
  if (currentMode === 'CUT') {
    cutter.stopLine();
  }
}

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);

canvas.addEventListener('touchstart', handleStart);
canvas.addEventListener('touchmove', handleMove);
window.addEventListener('touchend', handleEnd);

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (stone) {
    stone.renderBase(ctx);

    if (currentMode === 'INSPECT' && !stone.isSliced) {
      flashlight.render(ctx, stone);
    } else if (currentMode === 'CUT' && !stone.isSliced) {
      cutter.render(ctx);
    }
  } else {
    ctx.fillStyle = '#161b22';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Chọn mua đá thô để bắt đầu lượt chơi', canvas.width / 2, canvas.height / 2);
  }

  requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
economy.updateUI();
updateControls();
gameLoop();
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

// Tải dữ liệu tiến trình cũ
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
  if (!canvas) return;
  // Cập nhật kích thước thực tế khung vẽ Canvas
  canvas.width = canvas.clientWidth || 360;
  canvas.height = canvas.clientHeight || 360;
}

function updateControls() {
  const hasStone = !!stone;
  const isSliced = hasStone && stone.isSliced;

  btnBuyLow.disabled = hasStone || !economy.canAfford(STONE_TIERS.LOW.cost);
  btnBuyHigh.disabled = hasStone || !economy.canAfford(STONE_TIERS.HIGH.cost);
  btnMode.disabled = !hasStone || isSliced;
  btnCut.disabled = !hasStone || isSliced;
  btnSell.disabled = !isSliced;

  flashlight.setRadius(shop.getFlashlightRadius());
}

function buyStone(tier) {
  sounds.init();
  if (stone) return;

  if (!economy.canAfford(tier.cost)) {
    alert('Bạn không đủ tiền mua viên đá này!');
    return;
  }

  // Bắt buộc tính lại kích thước Canvas trước khi tính tâm điểm
  resizeCanvas();

  if (!economy.deduct(tier.cost)) return;
  saveProgress();
  sounds.playClick();
  Haptics.medium();

  // Đảm bảo quả đá luôn ở chính giữa bàn
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

  alert(`Bạn đã bán sản phẩm ngọc thành công, thu

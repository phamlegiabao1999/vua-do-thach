export class Stone {
  constructor(x, y, radius, tierConfig) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.cost = tierConfig ? tierConfig.cost : 200;
    this.tierName = tierConfig ? tierConfig.name : 'Đá Thô';
    this.isSliced = false;

    // Phẩm chất ngọc
    const probs = (tierConfig && tierConfig.probabilities) ? tierConfig.probabilities : { 0: 0.55, 1: 0.35, 2: 0.08, 3: 0.02 };
    const rand = Math.random();
    let quality = 0;
    if (rand < probs[3]) {
      quality = 3;
    } else if (rand < probs[3] + probs[2]) {
      quality = 2;
    } else if (rand < probs[3] + probs[2] + probs[1]) {
      quality = 1;
    } else {
      quality = 0;
    }

    this.gemCore = {
      offsetX: (Math.random() - 0.5) * (radius * 0.5),
      offsetY: (Math.random() - 0.5) * (radius * 0.5),
      size: radius * (0.35 + Math.random() * 0.3),
      quality: quality
    };

    this.colors = {
      0: { name: 'Đá Rác (Không Có Ngọc)', core: '#4a4a4a', glow: '#666666', priceMultiplier: 0.1 },
      1: { name: 'Đậu Chủng (Màu Xanh Nhạt)', core: '#4caf50', glow: '#81c784', priceMultiplier: 1.5 },
      2: { name: 'Băng Chủng (Trong Suốt)', core: '#00bcd4', glow: '#80deea', priceMultiplier: 4.0 },
      3: { name: 'Đế Vương Lục (Tuyệt Phẩm)', core: '#00e676', glow: '#69f0ae', priceMultiplier: 12.0 }
    };
  }

  getSellingPrice() {
    const gem = this.colors[this.gemCore.quality];
    return Math.round(this.cost * gem.priceMultiplier);
  }

  slice() {
    this.isSliced = true;
  }

  renderBase(ctx) {
    ctx.save();
    if (!this.isSliced) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#2d2621';
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#1a1512';
      ctx.stroke();
    } else {
      const gem = this.colors[this.gemCore.quality];

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#221c18';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#110e0c';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius - 8, 0, Math.PI * 2);
      ctx.fillStyle = gem.core;
      ctx.fill();

      const gemX = this.x + this.gemCore.offsetX;
      const gemY = this.y + this.gemCore.offsetY;
      const grad = ctx.createRadialGradient(
        gemX, gemY, 5,
        gemX, gemY, this.gemCore.size
      );
      grad.addColorStop(0, '#ffffffcc');
      grad.addColorStop(0.4, gem.glow);
      grad.addColorStop(1, gem.core);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gemX, gemY, this.gemCore.size, 0, Math.PI * 2);
      ctx.fill();

      const shineGrad = ctx.createLinearGradient(this.x - this.radius, this.y - this.radius, this.x + this.radius, this.y + this.radius);
      shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
      shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

      ctx.fillStyle = shineGrad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius - 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

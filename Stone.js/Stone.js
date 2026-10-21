export class Stone {
  constructor(x, y, radius, tierConfig) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.cost = tierConfig.cost;
    this.tierName = tierConfig.name;
    this.isSliced = false;

    const rand = Math.random();
    let quality = 0;
    if (rand < tierConfig.probabilities[3]) {
      quality = 3;
    } else if (rand < tierConfig.probabilities[3] + tierConfig.probabilities[2]) {
      quality = 2;
    } else if (rand < tierConfig.probabilities[3] + tierConfig.probabilities[2] + tierConfig.probabilities[1]) {
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

  // Bán ngọc kết hợp hệ số nhân từ Lưỡi Cưa
  getSellingPrice(sawBonusMultiplier = 1.0) {
    const gem = this.colors[this.gemCore.quality];
    return Math.round(this.cost * gem.priceMultiplier * sawBonusMultiplier);
  }

  // Dự báo chất lượng khi sở hữu Kính Hiển Vi
  getMicroscopeHint(microscopeLevel) {
    if (microscopeLevel === 0) return '';
    const q = this.gemCore.quality;

    if (microscopeLevel === 1) {
      if (q === 0) return '🔬 Thẩm định: Bề mặt khô, ít tiềm năng.';
      if (q === 1) return '🔬 Thẩm định: Cấu trúc có vệt xanh mờ.';
      return '🔬 Thẩm định: Năng lượng ngọc rất mạnh!';
    }

    if (microscopeLevel === 2) {
      return `🔬 Thẩm định chính xác: Phẩm chất dự kiến [${this.colors[q].name}]!`;
    }
    return '';
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
        gemX,
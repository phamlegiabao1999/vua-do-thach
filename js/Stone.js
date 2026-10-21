export class Stone {
  constructor(x, y, radius, tierConfig) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.cost = tierConfig ? tierConfig.cost : 200;
    this.tierName = tierConfig ? tierConfig.name : 'Đá Thô';
    this.isSliced = false;

    const probs = (tierConfig && tierConfig.probabilities) ? tierConfig.probabilities : { 0: 0.55, 1: 0.35, 2: 0.08, 3: 0.02 };
    const rand = Math.random();
    let quality = 0;
    if (rand < probs[3]) {
      quality = 3; // Đế Vương Lục
    } else if (rand < probs[3] + probs[2]) {
      quality = 2; // Băng Chủng
    } else if (rand < probs[3] + probs[2] + probs[1]) {
      quality = 1; // Đậu Chủng
    } else {
      quality = 0; // Đá Rác
    }

    this.gemCore = {
      offsetX: (Math.random() - 0.5) * (radius * 0.4),
      offsetY: (Math.random() - 0.5) * (radius * 0.4),
      size: radius * (0.45 + Math.random() * 0.25),
      quality: quality
    };

    // Phân loại phẩm chất ngọc Phỉ Thúy
    this.colors = {
      0: { name: 'Đá Rác (Không Ngọc)', core: '#3a3a3a', inner: '#2a2a2a', glow: '#555555', priceMultiplier: 0.1 },
      1: { name: 'Đậu Chủng (Màu Xanh Nhạt)', core: '#2e7d32', inner: '#4caf50', glow: '#a5d6a7', priceMultiplier: 1.5 },
      2: { name: 'Băng Chủng (Trong Suốt)', core: '#00838f', inner: '#00bcd4', glow: '#e0f7fa', priceMultiplier: 4.0 },
      3: { name: 'Đế Vương Lục (Tuyệt Phẩm)', core: '#00695c', inner: '#00e676', glow: '#b9f6ca', priceMultiplier: 12.0 }
    };

    // Tự động sinh dữ liệu vân ngọc (Veins) & đốm tuyết (Snow flakes) ngẫu nhiên
    this.generateJadeTexture();
  }

  generateJadeTexture() {
    // 1. Vân rễ cây uốn lượn (Veins)
    this.veins = [];
    const numVeins = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < numVeins; i++) {
      this.veins.push({
        angle: Math.random() * Math.PI * 2,
        length: Math.random() * this.radius * 0.8 + 20,
        curve: (Math.random() - 0.5) * 40,
        width: Math.random() * 4 + 1
      });
    }

    // 2. Bông tuyết / Hạt tinh thể Phỉ thúy (Jadeite crystal flakes)
    this.flakes = [];
    for (let i = 0; i < 25; i++) {
      this.flakes.push({
        x: (Math.random() - 0.5) * this.radius * 1.5,
        y: (Math.random() - 0.5) * this.radius * 1.5,
        r: Math.random() * 3 + 1,
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    // 3. Vết sa kết xù xì vỏ ngoài
    this.rindCracks = [];
    for (let i = 0; i < 6; i++) {
      this.rindCracks.push({
        x: (Math.random() - 0.5) * this.radius * 1.6,
        y: (Math.random() - 0.5) * this.radius * 1.6,
        len: Math.random() * 30 + 15,
        rot: Math.random() * Math.PI
      });
    }
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
      // --- A. VẼ VỎ ĐÁ THÔ SA KẾT ---
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      
      // Gradient vỏ đá thô 3D
      const crustGrad = ctx.createRadialGradient(this.x - 30, this.y - 30, 10, this.x, this.y, this.radius);
      crustGrad.addColorStop(0, '#54473a');
      crustGrad.addColorStop(0.5, '#382f26');
      crustGrad.addColorStop(1, '#1f1914');
      ctx.fillStyle = crustGrad;
      ctx.fill();

      // Viền đá xù xì
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#120e0b';
      ctx.stroke();

      // Vẽ vết nứt sa kết & đốm khoáng rỉ vàng
      ctx.save();
      ctx.clip();
      this.rindCracks.forEach(c => {
        ctx.beginPath();
        ctx.moveTo(this.x + c.x, this.y + c.y);
        ctx.lineTo(this.x + c.x + Math.cos(c.rot) * c.len, this.y + c.y + Math.sin(c.rot) * c.len);
        ctx.strokeStyle = '#120d09';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      ctx.restore();

    } else {
      // --- B. VẼ MẶT CẮT NGỌC PHỈ THÚY CỰC NGHỆ THUẬT ---
      const gem = this.colors[this.gemCore.quality];

      // 1. Viền vỏ ngoài sa kết sau khi cắt
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#261f18';
      ctx.fill();

      // 2. Cốt thịt ngọc nền (Base Jade Texture)
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius - 6, 0, Math.PI * 2);
      ctx.fillStyle = gem.core;
      ctx.fill();

      ctx.save();
      ctx.clip(); // Giới hạn chỉ vẽ vân inside lòng ngọc

      // 3. Quầng sáng ngọc tỏa ra từ tâm mảng ngọc ẩn
      const gemX = this.x + this.gemCore.offsetX;
      const gemY = this.y + this.gemCore.offsetY;
      const glowGrad = ctx.createRadialGradient(gemX, gemY, 5, gemX, gemY, this.gemCore.size);
      glowGrad.addColorStop(0, '#ffffff');
      glowGrad.addColorStop(0.3, gem.glow);
      glowGrad.addColorStop(0.7, gem.inner);
      glowGrad.addColorStop(1, gem.core);

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(gemX, gemY, this.gemCore.size * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // 4. Vẽ dải vân ngọc Phỉ Thúy uốn lượn (Vein Lines)
      this.veins.forEach(v => {
        ctx.beginPath();
        ctx.moveTo(gemX, gemY);
        const endX = gemX + Math.cos(v.angle) * v.length;
        const endY = gemY + Math.sin(v.angle) * v.length;
        const ctrlX = (gemX + endX) / 2 + v.curve;
        const ctrlY = (gemY + endY) / 2 - v.curve;

        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
        ctx.strokeStyle = gem.glow;
        ctx.lineWidth = v.width;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
      });

      // 5. Vẽ đốm hạt bông tuyết / tinh thể phỉ thúy
      this.flakes.forEach(f => {
        ctx.beginPath();
        ctx.arc(gemX + f.x, gemY + f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = f.alpha;
        ctx.fill();
      });

      ctx.restore(); // Bỏ clip

      // 6. Lớp bóng mài gương dầu (Greasy Specular Luster)
      const specularGrad = ctx.createLinearGradient(
        this.x - this.radius, this.y - this.radius,
        this.x + this.radius, this.y + this.radius
      );
      specularGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      specularGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
      specularGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.0)');
      specularGrad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');

      ctx.fillStyle = specularGrad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius - 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

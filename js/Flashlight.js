export class Flashlight {
  constructor(radius = 55) {
    this.x = -100;
    this.y = -100;
    this.radius = radius;
  }

  setRadius(r) {
    this.radius = r;
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  render(ctx, stone) {
    if (!stone) return;

    ctx.save();
    
    // Khống chế quầng sáng chỉ hiển thị trong lòng quả đá
    ctx.beginPath();
    ctx.arc(stone.x, stone.y, stone.radius, 0, Math.PI * 2);
    ctx.clip();

    const gemX = stone.x + stone.gemCore.offsetX;
    const gemY = stone.y + stone.gemCore.offsetY;
    const distToGem = Math.hypot(this.x - gemX, this.y - gemY);

    if (distToGem < stone.gemCore.size + this.radius) {
      const gemData = stone.colors[stone.gemCore.quality];
      const intensity = Math.max(0, 1 - distToGem / (stone.gemCore.size + this.radius));

      // Quầng sáng thấu quang (Subsurface Glow)
      const grad = ctx.createRadialGradient(
        this.x, this.y, 2,
        this.x, this.y, this.radius
      );
      
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, gemData.glow);
      grad.addColorStop(0.6, gemData.inner);
      grad.addColorStop(1, 'transparent');

      ctx.globalAlpha = intensity * 0.9;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Hiện mờ vân ngọc khi đèn rọi trúng
      stone.veins.forEach(v => {
        ctx.beginPath();
        ctx.moveTo(gemX, gemY);
        const endX = gemX + Math.cos(v.angle) * v.length;
        const endY = gemY + Math.sin(v.angle) * v.length;
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gemData.glow;
        ctx.lineWidth = v.width + 1;
        ctx.globalAlpha = intensity * 0.4;
        ctx.stroke();
      });
    }

    ctx.restore();
  }
}

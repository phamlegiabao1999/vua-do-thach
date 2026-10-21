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
    
    ctx.beginPath();
    ctx.arc(stone.x, stone.y, stone.radius, 0, Math.PI * 2);
    ctx.clip();

    const gemX = stone.x + stone.gemCore.offsetX;
    const gemY = stone.y + stone.gemCore.offsetY;
    const distToGem = Math.hypot(this.x - gemX, this.y - gemY);

    if (distToGem < stone.gemCore.size + this.radius) {
      const gemData = stone.colors[stone.gemCore.quality];
      const intensity = Math.max(0, 1 - distToGem / (stone.gemCore.size + this.radius));

      const grad = ctx.createRadialGradient(
        this.x, this.y, 5,
        this.x, this.y, this.radius
      );
      
      grad.addColorStop(0, gemData.glow);
      grad.addColorStop(0.5, gemData.core);
      grad.addColorStop(1, 'transparent');

      ctx.globalAlpha = intensity * 0.85;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
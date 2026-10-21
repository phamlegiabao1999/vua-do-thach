export class Cutter {
  constructor() {
    this.startPoint = null;
    this.endPoint = null;
    this.isDrawing = false;
  }

  startLine(x, y) {
    this.startPoint = { x, y };
    this.endPoint = { x, y };
    this.isDrawing = true;
  }

  updateLine(x, y) {
    if (this.isDrawing) {
      this.endPoint = { x, y };
    }
  }

  stopLine() {
    this.isDrawing = false;
  }

  hasValidLine() {
    if (!this.startPoint || !this.endPoint) return false;
    const dist = Math.hypot(this.endPoint.x - this.startPoint.x, this.endPoint.y - this.startPoint.y);
    return dist > 30; // Đường vạch dài hơn 30px mới hợp lệ
  }

  reset() {
    this.startPoint = null;
    this.endPoint = null;
    this.isDrawing = false;
  }

  render(ctx) {
    if (!this.startPoint || !this.endPoint) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.startPoint.x, this.startPoint.y);
    ctx.lineTo(this.endPoint.x, this.endPoint.y);
    
    // Đường nét đứt màu đỏ nhấp nháy định vị đường cưa
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.stroke();

    // Vẽ 2 điểm neo ở đầu đường cắt
    ctx.fillStyle = '#ff4d4d';
    ctx.beginPath();
    ctx.arc(this.startPoint.x, this.startPoint.y, 5, 0, Math.PI * 2);
    ctx.arc(this.endPoint.x, this.endPoint.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
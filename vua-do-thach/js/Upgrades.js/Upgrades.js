export class Upgrades {
  constructor() {
    this.items = {
      flashlight: {
        name: 'Đèn Pin Siêu Sáng',
        icon: '🔦',
        level: 1,
        maxLevel: 3,
        costs: [0, 500, 1500],
        radii: [55, 75, 95],
        desc: ['Bán kính quầng sáng 55px', 'Bán kính quầng sáng 75px (Mở rộng)', 'Bán kính quầng sáng 95px (Toàn cảnh)']
      },
      saw: {
        name: 'Lưỡi Cưa Kim Cương',
        icon: '🪚',
        level: 1,
        maxLevel: 3,
        costs: [0, 800, 2000],
        multipliers: [1.0, 1.15, 1.30],
        desc: ['Mặt cắt chuẩn (+0% giá trị)', 'Mặt cắt kim cương (+15% giá trị)', 'Mặt cắt Laser Laser (+30% giá trị)']
      },
      microscope: {
        name: 'Kính Hiển Vi Thẩm Định',
        icon: '🔬',
        level: 0,
        maxLevel: 2,
        costs: [600, 1800],
        desc: ['Chưa sở hữu', 'Hiển thị dự báo chất lượng đá', 'Hiển thị chính xác tỷ lệ rớt ngọc']
      }
    };
  }

  getFlashlightRadius() {
    const level = this.items.flashlight.level;
    return this.items.flashlight.radii[level - 1];
  }

  getSawMultiplier() {
    const level = this.items.saw.level;
    return this.items.saw.multipliers[level - 1];
  }

  getMicroscopeLevel() {
    return this.items.microscope.level;
  }

  upgrade(key, economy) {
    const item = this.items[key];
    if (item.level >= item.maxLevel) return false;

    const nextCost = item.costs[item.level];
    if (economy.deduct(nextCost)) {
      item.level += 1;
      return true;
    }
    return false;
  }
}
export class Shop {
  constructor(economy, sounds) {
    this.economy = economy;
    this.sounds = sounds;

    // Trạng thái cấp độ nâng cấp ban đầu
    this.levels = {
      flashlight: 1, // Cấp 1 -> 4
      saw: 1,        // Cấp 1 -> 4
      lens: 0        // Cấp 0 (Chưa có) -> 2
    };

    // Cấu hình chỉ số & giá tiền các gói nâng cấp
    this.catalog = {
      flashlight: {
        name: 'Đèn Pin Siêu Sáng 🔦',
        desc: 'Mở rộng quầng sáng soi xuyên thấu khối đá.',
        configs: [
          { level: 1, radius: 55, cost: 0, title: 'Cấp 1 (Chuẩn)' },
          { level: 2, radius: 75, cost: 300, title: 'Cấp 2 (Đèn LED Quang Học)' },
          { level: 3, radius: 95, cost: 800, title: 'Cấp 3 (Đèn Tia Tử Ngoại UV)' },
          { level: 4, radius: 120, cost: 2000, title: 'Cấp 4 (Đèn X-Ray Chuyên Dụng)' }
        ]
      },
      saw: {
        name: 'Lưỡi Cưa Kim Cương 🪚',
        desc: 'Đường cắt ngọt hơn, tăng giá trị ngọc khi chế tác.',
        configs: [
          { level: 1, bonus: 0.0, cost: 0, title: 'Cấp 1 (Lưỡi Thép Thường)' },
          { level: 2, bonus: 0.15, cost: 400, title: 'Cấp 2 (Lưỡi Hợp Kim)' },
          { level: 3, bonus: 0.35, cost: 1000, title: 'Cấp 3 (Lưỡi Phủ Kim Cương)' },
          { level: 4, bonus: 0.60, cost: 2500, title: 'Cấp 4 (Cắt Laser Siêu Âm)' }
        ]
      },
      lens: {
        name: 'Kính Thẩm Định Phỉ Thúy 🔍',
        desc: 'Hiển thị gợi ý tỷ lệ % phẩm chất ngọc ẩn khi soi.',
        configs: [
          { level: 0, active: false, cost: 0, title: 'Chưa Sở Hữu' },
          { level: 1, active: true, accuracy: 0.7, cost: 500, title: 'Cấp 1 (Kính Phóng Đại 10x)' },
          { level: 2, active: true, accuracy: 1.0, cost: 1500, title: 'Cấp 2 (Máy Phân Tích Quang Phổ)' }
        ]
      }
    };
  }

  loadLevels(savedLevels) {
    if (savedLevels) {
      this.levels = { ...this.levels, ...savedLevels };
    }
  }

  // Lấy chỉ số hiện tại của Đèn pin
  getFlashlightRadius() {
    const config = this.catalog.flashlight.configs.find(c => c.level === this.levels.flashlight);
    return config ? config.radius : 55;
  }

  // Lấy tỷ lệ thưởng cộng thêm từ Lưỡi cưa
  getSawBonus() {
    const config = this.catalog.saw.configs.find(c => c.level === this.levels.saw);
    return config ? config.bonus : 0;
  }

  // Kiểm tra có Kính thẩm định hay chưa
  getLensStatus() {
    const config = this.catalog.lens.configs.find(c => c.level === this.levels.lens);
    return config || { active: false };
  }

  // Mua nâng cấp
  buyUpgrade(itemKey) {
    const currentLvl = this.levels[itemKey];
    const configs = this.catalog[itemKey].configs;
    const nextConfig = configs.find(c => c.level === currentLvl + 1);

    if (!nextConfig) return { success: false, msg: 'Đã đạt cấp độ tối đa!' };

    if (!this.economy.canAfford(nextConfig.cost)) {
      return { success: false, msg: 'Không đủ tiền mua nâng cấp này!' };
    }

    this.economy.deduct(nextConfig.cost);
    this.levels[itemKey] += 1;
    this.sounds.playCoinChime();

    return { success: true, msg: `Đã nâng cấp lên ${nextConfig.title}!` };
  }
}
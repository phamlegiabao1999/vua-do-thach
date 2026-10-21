export class Storage {
  static SAVE_KEY = 'VUA_DO_THACH_SAVE_V1';

  static save(data) {
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Không thể lưu tiến trình game:', e);
    }
  }

  static load() {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Không thể nạp dữ liệu cũ:', e);
      return null;
    }
  }

  static reset() {
    localStorage.removeItem(this.SAVE_KEY);
  }
}
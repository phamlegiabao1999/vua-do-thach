export class Haptics {
  static isSupported() {
    return 'vibrate' in navigator;
  }

  // Rung nhẹ khi soi đèn trúng ngọc hoặc vạch đường
  static light() {
    if (this.isSupported()) {
      navigator.vibrate(15);
    }
  }

  // Rung vừa khi chuyển chế độ hoặc bấm nút
  static medium() {
    if (this.isSupported()) {
      navigator.vibrate(35);
    }
  }

  // Rung mạnh theo nhịp khi xẻ cưa đá thành công
  static heavyPattern() {
    if (this.isSupported()) {
      // Rung 40ms, nghỉ 30ms, rung 80ms
      navigator.vibrate([40, 30, 80]);
    }
  }
}
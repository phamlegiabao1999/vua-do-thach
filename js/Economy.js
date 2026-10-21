export class Economy {
  constructor(initialCash = 1000) {
    this.cash = initialCash;
    this.cashDisplay = document.getElementById('cash-display');
  }

  canAfford(amount) {
    return this.cash >= amount;
  }

  deduct(amount) {
    if (this.canAfford(amount)) {
      this.cash -= amount;
      this.updateUI();
      return true;
    }
    return false;
  }

  add(amount) {
    this.cash += amount;
    this.updateUI();
  }

  updateUI() {
    if (this.cashDisplay) {
      this.cashDisplay.innerText = `$${this.cash.toLocaleString()}`;
    }
  }
}
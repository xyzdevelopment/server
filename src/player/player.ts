// CLASS THAT MANAGE THE USER BALANCE
export class PlayerManager {
  user: any = [];
  public updateBalance(betWin: number, userId: string, type: string) {
    let user = this.user.find((e: { user: string }) => e.user == userId);
    if (type === "add") {
      user.balance += betWin;
    } else {
      user.balance -= betWin;
    }
    console.log(this.user);
  }
  public getBalance(userId: string) {
    return this.user.find((e: { user: string }) => e.user == userId);
  }
  public setBalance(balance: number, userId: string) {
    this.user.push({ user: userId, balance: balance });
  }
}
export const Player = new PlayerManager();

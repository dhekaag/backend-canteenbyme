export class OrderIdGenerator {
  private currentId: number;
  private readonly maxId: number;

  constructor(maxId: number = 100) {
    this.currentId = 0;
    this.maxId = maxId;
  }

  public nextId(): number {
    this.currentId++;
    if (this.currentId > this.maxId) {
      this.currentId = 1;
    }
    return this.currentId;
  }
}

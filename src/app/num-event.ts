export class NumEvent {
  cellLoc: string;
  isPencil: boolean;
  num: number;
  constructor(cellLoc: string, isPencil: boolean, num: number) {
    this.cellLoc = cellLoc;
    this.isPencil = isPencil;
    this.num = num;
  }
}

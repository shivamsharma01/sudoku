export class NumEvent {
  cellLoc: string;
  font: string;
  isPencil: boolean;
  num: number;
  constructor(cellLoc: string, font: string, isPencil: boolean, num: number) {
    this.cellLoc = cellLoc;
    this.font = font;
    this.isPencil = isPencil;
    this.num = num;
  }
}

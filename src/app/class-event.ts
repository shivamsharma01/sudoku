export class ClassEvent {
  type: string;
  obj: EventObject;
  constructor(type: string, obj: EventObject) {
    this.type = type;
    this.obj = obj;
  }
}

export class EventObject {
  cellLoc: string;
  num: number;
  constructor(cellLoc: string, num: number) {
    this.cellLoc = cellLoc;
    this.num = num;
  }
}

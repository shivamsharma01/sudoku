import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { NumEvent } from './num-event';
import { ClassEvent, EventObject } from './class-event';

@Injectable({ providedIn: 'root' })
export class SudokuService {
  private numSubject: Subject<NumEvent> = new Subject<NumEvent>();
  private classSubject: Subject<ClassEvent> = new Subject<ClassEvent>();
  private helperSubject: Subject<boolean> = new Subject<boolean>();
  private solved: number[][];
  private unfilledCellsCount = 81;
  puzzle: number[][];
  runningPuzzle: number[][];
  runningSolved: number[][];
  helperArr: boolean[][][];
  isPencilClicked: boolean;
  maxMistakes: number;
  countMistakes: number;
  hintsRemaining: number;
  clickedCell: string;

  init(): void {
    this.hintsRemaining = 3;
    this.unfilledCellsCount = 81;
    this.maxMistakes = 3;
    this.countMistakes = 0;
    this.isPencilClicked = false;
    // this.puzzle = [
    //   [3, 0, 0, 8, 0, 1, 0, 0, 2],
    //   [2, 0, 1, 0, 3, 0, 6, 0, 4],
    //   [0, 0, 0, 2, 0, 4, 0, 0, 0],
    //   [8, 0, 9, 0, 0, 0, 1, 0, 6],
    //   [0, 6, 0, 0, 0, 0, 0, 5, 0],
    //   [7, 0, 2, 0, 0, 0, 4, 0, 9],
    //   [0, 0, 0, 5, 0, 9, 0, 0, 0],
    //   [9, 0, 4, 0, 8, 0, 7, 0, 5],
    //   [6, 0, 0, 1, 0, 7, 0, 0, 3],
    // ];
    // this.puzzle = [
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
    // ];
    this.puzzle = [
      [2, 9, 0, 0, 0, 0, 0, 6, 0],
      [6, 0, 0, 0, 0, 1, 5, 0, 3],
      [0, 0, 0, 0, 0, 5, 0, 7, 0],
      [0, 0, 2, 5, 0, 0, 0, 0, 0],
      [0, 0, 9, 3, 2, 6, 4, 0, 0],
      [0, 0, 0, 0, 0, 8, 3, 0, 0],
      [0, 6, 0, 9, 0, 0, 0, 0, 0],
      [1, 0, 4, 6, 0, 0, 0, 0, 8],
      [0, 2, 0, 0, 0, 0, 0, 5, 1],
    ];
    this.runningPuzzle = [];
    this.runningSolved = [];
    this.helperArr = [];
    for (let i = 0; i < 9; i++) {
      this.runningPuzzle[i] = this.puzzle[i].slice();
      this.runningSolved[i] = this.puzzle[i].slice();
      this.helperArr[i] = [];

      for (let j = 0; j < 9; j++) {
        if (this.puzzle[i][j] != 0) {
          this.helperArr[i].push([]);
        } else {
          this.helperArr[i].push([
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
          ]);
        }
      }
    }
    this.solve();
  }

  solve() {
    this.solved = [];
    for (let i = 0; i < 9; i++) {
      this.solved[i] = this.puzzle[i].slice();
    }
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.solved[i][j] != 0) this.unfilledCellsCount--;
      }
    }
    this.solveBackTrack(0, 0);
  }

  solveBackTrack(i: number, j: number): boolean {
    if (j == 9) {
      if (i == 8) return true;
      return this.solveBackTrack(i + 1, 0);
    }
    if (this.solved[i][j] != 0) return this.solveBackTrack(i, j + 1);
    else {
      for (let num = 1; num <= 9; num++) {
        let result = this.check(this.solved, i, j, num, false);
        if (result) {
          this.solved[i][j] = num;
          result = this.solveBackTrack(i, j + 1);
          if (result) return result;
        }
        this.solved[i][j] = 0;
      }
      return false;
    }
  }

  check(
    sudoku: number[][],
    i: number,
    j: number,
    num: number,
    emitEvent: boolean
  ) {
    if (!emitEvent) {
      if (this.checkRow(sudoku, i, num, emitEvent)) {
        if (this.checkCol(sudoku, j, num, emitEvent)) {
          return this.checkBox(sudoku, i, j, num, emitEvent);
        }
      }
    } else {
      let result = this.checkRow(sudoku, i, num, emitEvent);
      result = this.checkCol(sudoku, j, num, emitEvent) && result;
      result = this.checkBox(sudoku, i, j, num, emitEvent) && result;
      return result;
    }
    return false;
  }

  checkRow(
    sudoku: number[][],
    row: number,
    num: number,
    emitEvent: boolean
  ): boolean {
    for (let i = 0; i < 9; i++) {
      if (sudoku[row][i] == num) {
        if (emitEvent && !this.isPencilClicked)
          this.sendZoomEvent(row + ':' + i);
        return false;
      }
    }
    return true;
  }

  checkCol(
    sudoku: number[][],
    col: number,
    num: number,
    emitEvent: boolean
  ): boolean {
    for (let i = 0; i < 9; i++) {
      if (sudoku[i][col] == num) {
        if (emitEvent) this.sendZoomEvent(i + ':' + col);
        return false;
      }
    }
    return true;
  }

  checkBox(
    sudoku: number[][],
    row: number,
    col: number,
    num: number,
    emitEvent: boolean
  ): boolean {
    row = Math.floor(row / 3);
    col = Math.floor(col / 3);
    for (let i = row * 3; i < row * 3 + 3; i++) {
      for (let j = col * 3; j < col * 3 + 3; j++) {
        if (sudoku[i][j] == num) {
          if (emitEvent) this.sendZoomEvent(i + ':' + j);
          return false;
        }
      }
    }
    return true;
  }

  handleKeyPress(key: string): void {
    if (!this.clickedCell || this.maxMistakes == this.countMistakes) return;
    let split = this.clickedCell.split(':');
    const row = +split[0];
    const col = +split[1];
    if (this.runningSolved[row][col] == this.solved[row][col]) return;
    if (key >= '1' && key <= '9') {
      const val = +key;
      if (!this.isPencilClicked) {
        this.runningPuzzle[row][col] = val;
        this.sendNumEvent(val);
        if (val != this.solved[row][col]) {
          this.countMistakes++;
          this.sendZoomEvent(this.clickedCell);
          this.sendErrorEvent(val);
        } else {
          this.runningSolved[row][col] = val;
          this.unfilledCellsCount--;
          this.updateFill(row, col);
        }
        this.sendNumber(
          this.isPencilClicked,
          val,
          val != this.solved[row][col]
        );
      } else {
        const result = this.check(this.runningSolved, row, col, val, true);
        if (result) this.sendNumber(this.isPencilClicked, val, false);
      }
    } else if (key == 'Backspace') {
      this.runningPuzzle[row][col] = 0;
      this.clearCell(this.isPencilClicked);
    }
    if (this.unfilledCellsCount == 0) console.log('sudoku solved');
  }

  sendNumber(isPencil: boolean, num: number, isError: boolean) {
    this.numSubject.next(new NumEvent(this.clickedCell, isPencil, num));
    this.sendNumEvent(num);
    if (isError) this.sendErrorEvent(num);
    else this.sendClearErrorEvent();
  }

  getNumber(): Observable<NumEvent> {
    return this.numSubject.asObservable();
  }

  clearCell(isPencil: boolean) {
    if (!isPencil) this.sendBackspaceEvent();
    this.numSubject.next(new NumEvent(this.clickedCell, isPencil, 0));
  }

  sendClick(cellLoc: string) {
    this.clickedCell = cellLoc;
    this.sendSelectEvent();
    let split = this.clickedCell.split(':');
    const row = +split[0];
    const col = +split[1];
    this.sendNumEvent(+this.runningPuzzle[row][col]);
    const num = this.runningPuzzle[row][col];
    if (this.solved[row][col] != num) this.sendErrorEvent(num);
  }

  sendBackspaceEvent() {
    this.sendClassEvent('backspace');
  }

  sendClearErrorEvent() {
    this.sendClassEvent('clear-error');
  }

  sendZoomEvent(cellLoc: string) {
    this.sendClassEvent('zoom');
  }

  sendSelectEvent() {
    this.sendClassEvent('select');
  }

  sendNumEvent(num: number) {
    this.sendClassEvent('num', num);
  }

  sendErrorEvent(num: number) {
    if (num == 0) return;
    const arr = this.clickedCell.split(':');
    let row = +arr[0];
    let col = +arr[1];
    const sudoku = this.runningPuzzle;
    const errorLocSet = new Set<string>();
    for (let i = 0; i < 9; i++) {
      if (sudoku[row][i] == num) {
        errorLocSet.add(row + ':' + i);
      }
    }

    for (let i = 0; i < 9; i++) {
      if (sudoku[i][col] == num) {
        errorLocSet.add(i + ':' + col);
      }
    }

    row = Math.floor(row / 3);
    col = Math.floor(col / 3);
    for (let i = row * 3; i < row * 3 + 3; i++) {
      for (let j = col * 3; j < col * 3 + 3; j++) {
        if (sudoku[i][j] == num) {
          errorLocSet.add(i + ':' + j);
        }
      }
    }
    for (const value of errorLocSet) {
      console.log(value);
      this.sendClassEventToOther('error', value);
    }
  }

  hasError(cellLoc: string): boolean {
    const arr = cellLoc.split(':');
    let row = +arr[0];
    let col = +arr[1];
    const sudoku = this.runningPuzzle;
    const num = sudoku[row][col];

    for (let i = 0; i < 9; i++) {
      if (col != i && sudoku[row][i] == num) {
        return true;
      }
    }
    for (let i = 0; i < 9; i++) {
      if (row != i && sudoku[i][col] == num) {
        return true;
      }
    }

    const rowStart = Math.floor(row / 3);
    const colStart = Math.floor(col / 3);
    for (let i = rowStart * 3; i < rowStart * 3 + 3; i++) {
      for (let j = colStart * 3; j < colStart * 3 + 3; j++) {
        if (sudoku[i][j] == num && !(i == row && j == col)) {
          return true;
        }
      }
    }
    return false;
  }

  sendClassEvent(event: string, num?: number) {
    this.classSubject.next(
      new ClassEvent(event, new EventObject(this.clickedCell, num))
    );
  }

  sendClassEventToOther(event: string, cellLoc: string) {
    this.classSubject.next(
      new ClassEvent(event, new EventObject(cellLoc, null))
    );
  }

  getClassEvent(): Observable<ClassEvent> {
    return this.classSubject.asObservable();
  }

  getHelperArr(): Observable<boolean> {
    return this.helperSubject.asObservable();
  }

  fillPencil(): void {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.helperArr[i][j].length == 0) continue;
        for (let num = 1; num <= 9; num++) {
          if (this.check(this.runningSolved, i, j, num, false)) {
            this.helperArr[i][j][num - 1] = true;
          } else {
            this.helperArr[i][j][num - 1] = false;
          }
        }
      }
    }
    this.helperSubject.next(true);
  }

  updateFill(row: number, col: number): void {
    this.helperArr[row][col] = [];
    const val = this.runningSolved[row][col];
    for (let i = 0; i < 9; i++) {
      if (this.helperArr[row][i].length != 0) {
        this.helperArr[row][i][val - 1] = false;
      }
    }
    for (let i = 0; i < 9; i++) {
      if (this.helperArr[i][col].length != 0) {
        this.helperArr[i][col][val - 1] = false;
      }
    }
    row = Math.floor(row / 3);
    col = Math.floor(col / 3);
    for (let i = row * 3; i < row * 3 + 3; i++) {
      for (let j = col * 3; j < col * 3 + 3; j++) {
        if (this.helperArr[i][col].length != 0) {
          this.helperArr[i][j][val - 1] = false;
        }
      }
    }
  }

  clearPencil(): void {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        this.helperArr[i][j] = [];
      }
    }
    this.helperSubject.next(true);
  }

  erase() {
    if (this.clickedCell == '') return;
    const arr = this.clickedCell.split(':');
    const row = +arr[0];
    const col = +arr[1];
    if (this.runningSolved[row][col] != 0) return;
    this.runningSolved[row][col] = 0;
    this.sendNumber(false, 0, false);
  }

  hint() {
    if (this.clickedCell == '' || this.hintsRemaining == 0) return;
    const arr = this.clickedCell.split(':');
    const row = +arr[0];
    const col = +arr[1];
    if (this.runningSolved[row][col] != 0) return;
    this.runningSolved[row][col] = this.solved[row][col];
    this.sendNumber(false, this.solved[row][col], false);
    this.helperSubject.next(true);
    this.hintsRemaining--;
  }
}

import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { NumEvent } from './num-event';
import { ClickEvent } from './click-event';
import { ClassEvent } from './class-event';

@Injectable({ providedIn: 'root' })
export class SudokuService {
  private numSubject: Subject<NumEvent> = new Subject<NumEvent>();
  private clickSubject: Subject<ClickEvent> = new Subject<ClickEvent>();
  private zoomSubject: Subject<ClassEvent> = new Subject<ClassEvent>();
  private helperSubject: Subject<boolean> = new Subject<boolean>();
  private solved: number[][];
  private runningSolved: number[][];
  private unfilledCellsCount = 81;
  puzzle: number[][];
  runningPuzzle: number[][];
  helperArr: boolean[][][];
  isPencilClicked: boolean;
  maxMistakes: number;
  countMistakes: number;
  hintsRemaining: number;

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
        if (this.puzzle[i][j] == 0) {
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
    isZoom: boolean
  ) {
    if (!isZoom) {
      if (this.checkRow(sudoku, i, num, isZoom)) {
        if (this.checkCol(sudoku, j, num, isZoom)) {
          return this.checkBox(sudoku, i, j, num, isZoom);
        }
      }
    } else {
      let result = this.checkRow(sudoku, i, num, isZoom);
      result = this.checkCol(sudoku, j, num, isZoom) && result;
      result = this.checkBox(sudoku, i, j, num, isZoom) && result;
      return result;
    }
    return false;
  }

  checkRow(
    sudoku: number[][],
    row: number,
    num: number,
    isZoom: boolean
  ): boolean {
    for (let i = 0; i < 9; i++) {
      if (sudoku[row][i] == num) {
        if (isZoom) this.sendZoom(row + ':' + i);
        return false;
      }
    }
    return true;
  }

  checkCol(
    sudoku: number[][],
    col: number,
    num: number,
    isZoom: boolean
  ): boolean {
    for (let i = 0; i < 9; i++) {
      if (sudoku[i][col] == num) {
        if (isZoom) this.sendZoom(i + ':' + col);
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
    isZoom: boolean
  ): boolean {
    row = Math.floor(row / 3);
    col = Math.floor(col / 3);
    for (let i = row * 3; i < row * 3 + 3; i++) {
      for (let j = col * 3; j < col * 3 + 3; j++) {
        if (sudoku[i][j] == num) {
          if (isZoom) this.sendZoom(i + ':' + j);
          return false;
        }
      }
    }
    return true;
  }

  handleKeyPress(cellLoc: string, key: string): void {
    if (this.maxMistakes == this.countMistakes) return;
    let split = cellLoc.split(':');
    const row = +split[0];
    const col = +split[1];
    if (this.runningSolved[row][col] == this.solved[row][col]) return;
    if (key >= '1' && key <= '9') {
      const val = +key;
      let font;
      if (!this.isPencilClicked) {
        if (val != this.solved[row][col]) {
          this.countMistakes++;
          font = 'red';
        } else {
          font = 'blue';
          this.runningSolved[row][col] = val;
          this.unfilledCellsCount--;
          this.helperArr[row][col] = [];
          this.fillPencil();
        }
        this.sendNumber(cellLoc, font, this.isPencilClicked, val);
      } else {
        const result = this.check(this.runningSolved, row, col, val, true);
        if (result) this.sendNumber(cellLoc, font, this.isPencilClicked, val);
      }
    } else if (key == 'Backspace') {
      this.clearCell(cellLoc, this.isPencilClicked);
    }
    if (this.unfilledCellsCount == 0) console.log('sudoku solved');
  }

  sendNumber(cellLoc: string, font: string, isPencil: boolean, num: number) {
    this.numSubject.next(new NumEvent(cellLoc, font, isPencil, num));
  }

  getNumber(): Observable<NumEvent> {
    return this.numSubject.asObservable();
  }

  clearCell(cellLoc: string, isPencil: boolean) {
    this.numSubject.next(new NumEvent(cellLoc, '', isPencil, 0));
  }

  sendClick(cellLoc: string) {
    this.clickSubject.next(new ClickEvent(cellLoc));
  }

  getClick(): Observable<ClickEvent> {
    return this.clickSubject.asObservable();
  }

  sendZoom(cellLoc: string) {
    this.zoomSubject.next(new ClassEvent(cellLoc, 'zoom'));
  }

  getZoom(): Observable<ClassEvent> {
    return this.zoomSubject.asObservable();
  }

  getHelperArr(): Observable<boolean> {
    return this.helperSubject.asObservable();
  }

  fillPencil(): void {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        this.helperArr[i][j] = [];
        if (this.runningSolved[i][j] != this.solved[i][j]) {
          for (let num = 1; num <= 9; num++) {
            if (this.check(this.runningSolved, i, j, num, false)) {
              this.helperArr[i][j].push(true);
            } else {
              this.helperArr[i][j].push(false);
            }
          }
        }
      }
    }
    this.helperSubject.next(true);
  }

  clearPencil(): void {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        this.helperArr[i][j] = [];
      }
    }
    this.helperSubject.next(true);
  }

  hint(cellLoc: string) {
    if (this.hintsRemaining == 0) return;
    const arr = cellLoc.split(':');
    const row = +arr[0];
    const col = +arr[1];
    if (this.runningSolved[row][col] != 0) return;
    this.runningSolved[row][col] = this.solved[row][col];
    this.sendNumber(cellLoc, 'blue', false, this.solved[row][col]);
    this.helperSubject.next(true);
    this.hintsRemaining--;
  }
}

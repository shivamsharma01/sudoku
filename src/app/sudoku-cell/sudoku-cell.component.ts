import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SudokuService } from '../sudoku.service';

@Component({
  selector: 'sudoku-cell',
  templateUrl: './sudoku-cell.component.html',
  styleUrls: ['./sudoku-cell.component.scss'],
})
export class SudokuCellComponent implements OnInit, OnDestroy {
  @Input() num: number;
  @Input() cellLocation: string;
  cellNum: number;
  helperArr: boolean[];
  subscription: Subscription[];
  isError: boolean;
  isNum: boolean;
  isSelected: boolean;
  isZoom: boolean;
  puzzle: number[][];
  runningSolved: number[][];
  row: number;
  col: number;

  constructor(private _sudokuService: SudokuService) {}

  ngOnInit(): void {
    this.cellNum = this.num;
    this.isZoom = false;
    this.helperArr = [];
    this.subscription = [];
    const arr = this.cellLocation.split(':');
    this.row = +arr[0];
    this.col = +arr[1];
    this.subscription.push(
      this._sudokuService.getNumber().subscribe((event) => {
        this.puzzle = this._sudokuService.puzzle;
        this.runningSolved = this._sudokuService.runningSolved;
        this.helperArr = this._sudokuService.helperArr[this.row][this.col];
        if (this.cellLocation == event.cellLoc) {
          const num = event.num;
          if (num == 0) {
            this.cellNum = 0;
            this.helperArr = <boolean[]>(
              Array.apply(null, Array(9)).map((v) => false)
            );
          } else if (event.isPencil) {
            this.helperArr[num - 1] = !this.helperArr[num - 1];
          } else {
            this.cellNum = num;
            this.helperArr = <boolean[]>(
              Array.apply(null, Array(9)).map((v) => false)
            );
          }
        }
      })
    );
    this.subscription.push(
      this._sudokuService.getClassEvent().subscribe((event) => {
        if (event.type == 'backspace' && this.cellNum != 0) {
          this.isNum = false;
          if (
            this.isError &&
            this.runningSolved[this.row][this.col] == this.cellNum
          ) {
            this.isError = this._sudokuService.hasError(this.cellLocation);
          }
        } else if (event.type == 'clear-error') {
          this.isError = false;
        } else if (event.type == 'error') {
          const obj = event.obj;
          this.isError = this.isError || obj.cellLoc == this.cellLocation;
        } else if (event.type == 'num') {
          const obj = event.obj;
          this.isNum = obj.num == this.cellNum;
          this.isZoom = this.isNum;
          this.isError = this.isError && this.isNum;
        } else if (event.type == 'select') {
          const obj = event.obj;
          this.isSelected = obj.cellLoc == this.cellLocation;
        } else if (event.type == 'zoom') {
          const obj = event.obj;
          this.isZoom = obj.cellLoc == this.cellLocation;
        }
      })
    );
    this.subscription.push(
      this._sudokuService.getHelperArr().subscribe((event) => {
        const arr = this.cellLocation.split(':');
        const row = +arr[0];
        const col = +arr[1];
        this.helperArr = this._sudokuService.helperArr[row][col];
      })
    );
  }

  saveState(): void {
    this._sudokuService.sendClick(this.cellLocation);
  }

  ngOnDestroy() {
    this.subscription.forEach((e) => e.unsubscribe());
  }
}

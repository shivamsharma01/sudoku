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
  font: string;
  clickState: boolean;
  helperArr: boolean[];
  subscription: Subscription[];
  isZoom: boolean;

  constructor(private _sudokuService: SudokuService) {}

  ngOnInit(): void {
    this.clickState = false;
    this.cellNum = this.num;
    this.font = 'black';
    this.isZoom = false;
    this.helperArr = [];
    this.subscription = [];
    this.subscription.push(
      this._sudokuService.getNumber().subscribe((event) => {
        const arr = this.cellLocation.split(':');
        const row = +arr[0];
        const col = +arr[1];
        this.helperArr = this._sudokuService.helperArr[row][col];
        if (this.cellLocation == event.cellLoc) {
          const num = event.num;
          this.font = event.font;
          if (this.font == 'red') this.isZoom = true;
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
      this._sudokuService.getClick().subscribe((event) => {
        this.clickState = this.cellLocation == event.cellLoc;
      })
    );
    this.subscription.push(
      this._sudokuService.getZoom().subscribe((event) => {
        if (this.cellLocation == event.cellLoc) {
          this.isZoom = this.cellLocation == event.cellLoc;
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
    this.clickState = true;
    this._sudokuService.sendClick(this.cellLocation);
  }

  ngOnDestroy() {
    this.subscription.forEach((e) => e.unsubscribe());
  }
}

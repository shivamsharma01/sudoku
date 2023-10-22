import { Component, OnInit, OnDestroy } from '@angular/core';
import { HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { SudokuService } from '../sudoku.service';

@Component({
  selector: 'sudoku-board',
  templateUrl: './sudoku-board.component.html',
  styleUrls: ['./sudoku-board.component.scss'],
})
export class SudokuBoardComponent implements OnInit, OnDestroy {
  puzzle: number[][];
  runningPuzzle: number[][];
  clickedCell: string;
  isPencilClicked: boolean;
  subscription: Subscription;

  constructor(private _sudokuService: SudokuService) {}

  ngOnInit(): void {
    this._sudokuService.init();
    this.puzzle = this._sudokuService.puzzle;
    this.runningPuzzle = this._sudokuService.runningPuzzle;
    this.clickedCell = '';
    this.subscription = this._sudokuService.getClick().subscribe((event) => {
      this.clickedCell = event.cellLoc;
    });
  }

  clickButton(): void {
    this.isPencilClicked = !this.isPencilClicked;
    this._sudokuService.isPencilClicked = this.isPencilClicked;
  }

  fillPencil(): void {
    this._sudokuService.fillPencil();
  }

  clearPencil(): void {
    this._sudokuService.clearPencil();
  }

  hint(): void {
    if (this.clickedCell == '') return;
    this._sudokuService.hint(this.clickedCell);
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.clickedCell != '') {
      this._sudokuService.handleKeyPress(this.clickedCell, event.key);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

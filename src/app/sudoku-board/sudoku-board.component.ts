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
  isPencilClicked: boolean;
  subscription: Subscription;

  constructor(private _sudokuService: SudokuService) {}

  ngOnInit(): void {
    this._sudokuService.init();
    this.puzzle = this._sudokuService.puzzle;
    this.runningPuzzle = this._sudokuService.runningPuzzle;
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

  erase(): void {
    this._sudokuService.erase();
  }

  hint(): void {
    this._sudokuService.hint();
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this._sudokuService.handleKeyPress(event.key);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SudokuCellComponent } from './sudoku-cell/sudoku-cell.component';
import { SudokuBoardComponent } from './sudoku-board/sudoku-board.component';

@NgModule({
  declarations: [
    AppComponent,
    SudokuCellComponent,
    SudokuBoardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProblemListPage } from './problem-list';

@NgModule({
  declarations: [
    ProblemListPage,
  ],
  imports: [
    IonicPageModule.forChild(ProblemListPage),
  ],
})
export class ProblemListPageModule {}

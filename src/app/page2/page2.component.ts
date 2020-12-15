import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatPaginator, MatTableDataSource} from '@angular/material';
import { HttpClient } from '@angular/common/http';
import {Question} from '../model/question';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CommentDialogComponent} from '../comment-dialog/comment-dialog.component';
import {QuestionsService} from '../questions.service';

@Component({
  selector: 'app-page2',
  templateUrl: './page2.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./page2.component.css']
})
export class Page2Component implements OnInit, AfterViewInit  {
  @Output() pageToShowEvent = new EventEmitter<number>();
  dataSource: MatTableDataSource<Question>;
  questions: Question[];

  displayedColumns: string[] = ['number', 'name', 'estimate', 'comment'];

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private questionsService: QuestionsService) { }

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  isMobile: boolean;

  ngAfterViewInit() {
  }

  ngOnInit() {
    this.questionsService.questionsReplaySubject.subscribe(questions => {
      this.questions = questions;
      setTimeout(() => {
        this.dataSource = new MatTableDataSource(questions);
        this.dataSource.paginator = this.paginator;
      }, 0);
    });
  }

  sendResult() {
    if (this.questions.every(question => question.estimate)) {
      const body = JSON.stringify(this.questions);
      this.http.post('https://5b3943cfcda47d5c7885c5e06e3d8361.m.pipedream.net', body)
        .subscribe(response => {
          const message = 'Анкету получил. Готовь попку, детка))';
          const action = 'Успешно!';
          if (response) {
            this.snackBar.open(message, action, {
              duration: 3000,
            });
            this.pageToShowEvent.emit(0);
          }
        });
    } else {
      this.openSnackBar();
    }

  }

  onValChange(value: any, question: Question) {
    question.estimate = value;
  }

  openSnackBar() {
    const unsignedQ = this.questions.filter(question => question.estimate === undefined);
    const message = 'Остались вопросы: ' + unsignedQ.map(q => q.id);
    const action = 'Attention';
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }

  goToComment(question: Question) {
    this.openDialog(question);
  }

  openDialog(question: Question) {
    let commentDialogRef = this.dialog.open(CommentDialogComponent, {
      disableClose: true,
      data: question.comment
    });
    commentDialogRef.afterClosed().subscribe(result => {
      if (result || result === '') {
        question.comment = result;
      }
      commentDialogRef = null;
    });
  }

  goToPage1() {
    this.questionsService.questionsReplaySubject.next(this.questions);
    this.pageToShowEvent.emit(1);
  }
}

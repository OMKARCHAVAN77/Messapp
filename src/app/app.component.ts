import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { filter, Observable } from 'rxjs';
import { LoaderService } from './Shared/Services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
  
})
export class AppComponent implements OnInit {
  loading$!: Observable<boolean>;

  constructor(private loaderService: LoaderService) {}

 ngOnInit() {
  setTimeout(() => {
    this.loading$ = this.loaderService.loading$;
  });
}
}

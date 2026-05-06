import { Directive, HostListener } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Directive({
  selector: '[appAutoLoaderButton]'
})
export class AutoLoaderButtonDirective {

 constructor(private loader: NgxUiLoaderService) {}

  @HostListener('click')
  onClick() {
    this.loader.start();
    setTimeout(() => this.loader.stop(), 1300); }
}

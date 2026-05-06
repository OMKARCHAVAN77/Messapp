import { Component, EventEmitter, HostListener, Output } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {

  @Output() toggleSidebar = new EventEmitter<void>();


  onToggle() {
    this.toggleSidebar.emit();
  }
}

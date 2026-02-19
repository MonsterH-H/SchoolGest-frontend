import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root', // Service singleton disponible dans toute l'app
})
export class SidebarService {
  // Comportement observable de l'état ouvert/fermé de la sidebar
  private sidebarOpen$ = new BehaviorSubject<boolean>(true);

  // Observable que les composants vont souscrire
  isSidebarOpen$ = this.sidebarOpen$.asObservable();

  open() {
    this.sidebarOpen$.next(true);
  }

  close() {
    this.sidebarOpen$.next(false);
  }

  toggle() {
    this.sidebarOpen$.next(!this.sidebarOpen$.value);
  }
}

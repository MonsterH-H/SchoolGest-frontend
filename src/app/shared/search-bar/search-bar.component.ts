import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Input() placeholder: string = 'Rechercher...'; // Added Input property
  @Output() search = new EventEmitter<string>();
  searchTerm = '';

  onSearchChange(event: any): void { // Renamed and updated method
    this.searchTerm = event.target.value;
    this.search.emit(this.searchTerm);
  }
}
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-filter-page',
  templateUrl: './filter-page.component.html',
  styleUrl: './filter-page.component.css'
})
export class FilterPageComponent {
 ratings = ['Any', '3.5', '4.0', '4.5', '5.0'];
  foodTypes = ['Both', 'Veg', 'Non-veg'];
  selectedRating: string = 'Any';
  selectedFoodType: string = 'Both';

  constructor(
    public dialogRef: MatDialogRef<FilterPageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  selectRating(rating: string): void {
    this.selectedRating = rating;
  }

  selectFoodType(foodType: string): void {
    this.selectedFoodType = foodType;
  }

  applyFilters(): void {
    this.dialogRef.close({
      rating: this.selectedRating,
      foodType: this.selectedFoodType === 'Both' ? 'all' : 
               this.selectedFoodType === 'Veg' ? 'veg' : 'Non-veg'
    });
  }

  resetFilters(): void {
    this.selectedRating = 'Any';
    this.selectedFoodType = 'Both';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

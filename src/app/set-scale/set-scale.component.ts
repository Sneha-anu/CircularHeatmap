import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-set-scale',
  templateUrl: './set-scale.component.html',
})
export class SetScaleComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SetScaleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

}

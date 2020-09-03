import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CircularHeatmapComponent } from './circular-heatmap/circular-heatmap.component';


import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { SetScaleComponent } from './set-scale/set-scale.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule} from '@angular/material/checkbox'
import { CommonModule } from '@angular/common';
import { PlotlyViaWindowModule } from 'angular-plotly.js';

@NgModule({
  declarations: [
    AppComponent,
    CircularHeatmapComponent,
    SetScaleComponent
  ],
  imports: [
    BrowserModule,
    MatMenuModule,
    MatButtonModule,MatCheckboxModule,
    MatInputModule,
    MatDialogModule,
    MatNativeDateModule,
    FormsModule,
    CommonModule,
    PlotlyViaWindowModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

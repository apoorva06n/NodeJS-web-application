import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatTabsModule, MatDialogModule } from '@angular/material';
import { AppComponent,weatherdialog }  from './app.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChartsModule } from 'ng2-charts';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

const routes: Routes = [];

@NgModule({
  imports: [
	    RouterModule.forRoot(routes),
	    FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        HttpClientModule,
        MatTabsModule,
        MatTooltipModule,
        BrowserAnimationsModule,
    	ChartsModule,
      MatDialogModule,
      MatAutocompleteModule
    ],
  providers: [],
  bootstrap: [
        AppComponent,
        weatherdialog
  ],
  exports: [
  		RouterModule,
  		FormsModule,
      ReactiveFormsModule,
      BrowserModule
    ]
})
export class AppRoutingModule { 
}

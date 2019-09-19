import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {UploadComponent} from './upload/upload.component';
import {NotfoundComponent} from './notfound/notfound.component';

const routes: Routes = [ 
  { path: 'upload', component: UploadComponent },
  { path: '',   redirectTo: '/upload', pathMatch: 'full' },
  { path: '**', component: NotfoundComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule { }
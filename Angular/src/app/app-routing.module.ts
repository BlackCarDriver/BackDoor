import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {UploadComponent} from './upload/upload.component';
import {NotfoundComponent} from './notfound/notfound.component';
import {LinuxstatComponent} from './linuxstat/linuxstat.component';
import {LogshowComponent} from './logshow/logshow.component';

const routes: Routes = [ 
  { path: 'upload', component: UploadComponent },
  { path: 'linstat', component:LinuxstatComponent},
  { path: 'log', component:LogshowComponent},
  { path: '',   redirectTo: '/upload', pathMatch: 'full' },
  { path: '**', component: NotfoundComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule { }
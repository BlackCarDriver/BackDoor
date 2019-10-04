import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http';
import { AppComponent } from './app.component';
import { UploadComponent } from './upload/upload.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { LinuxstatComponent } from './linuxstat/linuxstat.component';
import { LogshowComponent } from './logshow/logshow.component';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    NotfoundComponent,
    LinuxstatComponent,
    LogshowComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

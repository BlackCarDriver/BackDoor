import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule} from '@angular/common/http';
import { AppComponent } from './app.component';
import { UploadComponent } from './upload/upload.component';
import { AppRoutingModule } from './app-routing.module';
import { NotfoundComponent } from './notfound/notfound.component';
import { FormsModule } from '@angular/forms';
import { LinuxstatComponent } from './linuxstat/linuxstat.component';
import { LogshowComponent } from './logshow/logshow.component';
import { GenerateComponent } from './generate/generate.component';
import { FeedbackComponent } from './feedback/feedback.component';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    NotfoundComponent,
    LinuxstatComponent,
    LogshowComponent,
    GenerateComponent,
    FeedbackComponent,
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

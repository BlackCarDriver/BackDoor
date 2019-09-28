import { Component, OnInit } from '@angular/core';
import { ServerService, RequestProto } from '../server.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-logshow',
  templateUrl: './logshow.component.html',
  styleUrls: ['./logshow.component.css']
})
export class LogshowComponent implements OnInit {
  logsList:string[];
  logsDetail:string;
  nowShowing:string;
  constructor(
    private server: ServerService,
    private app: AppComponent,
  ) { }

  ngOnInit() {
    this.getLogList();
  }

  getLogList(){
    let postdata: RequestProto = {
      api: "logslist",
      token: this.app.token,
    }
    this.server.PostApi(postdata).subscribe(result => {
      if(result.status!=0){
        alert(result.status+" fail : "+result.msg);
        return;
      }
      this.logsList = result.data;
    }, err=>{alert("Get logsList fail: "+err)});
  }

  getLogDetail(name?:string){
    this.nowShowing = name;
    if(this.nowShowing==""){
      return;
    }
    let postdata: RequestProto = {
      api: "logsDetail",
      token: this.app.token,
      data:name,
    }
    this.server.PostApi(postdata).subscribe(result => {
      if(result.status!=0){
        alert(result.status+" fail : "+result.msg);
        return;
      }
      this.logsDetail = result.data;
    }, err=>{alert("Get getLogDetail fail: "+err)});
  }

  refresh(){
    this.getLogList();
    this.getLogDetail(this.nowShowing);
  }

  clearLog(){
    let postdata: RequestProto = {
      api: "clearlogs",
      token: this.app.token,
      data:this.nowShowing,
    }
    this.server.PostApi(postdata).subscribe(result => {
      if(result.status!=0){
        alert(result.status+" fail : "+result.msg);
        return;
      }
      alert("clear success!")
      this.refresh();
    }, err=>{alert("Get clearLog fail: "+err)});
  }

  delLog(){
    let postdata: RequestProto = {
      api: "deletelogs",
      token: this.app.token,
      data:this.nowShowing,
    }
    this.server.PostApi(postdata).subscribe(result => {
      if(result.status!=0){
        alert(result.status+" fail : "+result.msg);
        return;
      }
      alert("delete success!");
      this.nowShowing = "";
      this.refresh();
    }, err=>{alert("delete logs fail: "+err)});
  }
}


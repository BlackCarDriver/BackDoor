import { Component, OnInit } from '@angular/core';
import { ServerService, RequestProto } from '../server.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-logshow',
  templateUrl: './logshow.component.html',
  styleUrls: ['./logshow.component.css']
})
export class LogshowComponent implements OnInit {
  session = "go";     //to identify which kind of logs is broswing.
  title = "Logger";
  logsList:string[];
  logsDetail:string;
  nowShowing:string;
  constructor(
    private server: ServerService,
    private app: AppComponent,
  ) { }

  ngOnInit() {
    //init session by url
    let tmp = this.server.LastSection();
    if (tmp=="/nginxlog"){
      this.session = "nginx";
      this.title = "Nginx Logs";
    }else if (tmp == "/log") {
      this.session = "go";
      this.title = "GoLogger";
    }else{
      alert("Unsuppose session: " + tmp);
    }
    if (this.app.token!="") {
      this.refresh();
    }
  }

  refresh(){
    this.getLogList();
    this.getLogDetail(this.nowShowing);
  }

  getLogList(){
    let postdata: RequestProto = {
      token: this.app.token,
    }
    if(this.session=="nginx") postdata.api = "nginxloglist";
    if(this.session=="go") postdata.api = "logslist";
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
      token: this.app.token,
      data:name,
    }
    if(this.session=="go") postdata.api = "logsDetail";
    if(this.session=="nginx") postdata.api = "nginxlogsdetail";
    this.server.PostApi(postdata).subscribe(result => {
      if(result.status!=0){
        alert(result.status+" fail : "+result.msg);
        return;
      }
      this.logsDetail = result.data;
    }, err=>{alert("Get getLogDetail fail: "+err)});
  }
  //clear the content of select log file
  clearLog(){
    if (!confirm("Are you sure to clear "+this.nowShowing+"?")){
      return;
    }
    let postdata: RequestProto = {
      token: this.app.token,
      data:this.nowShowing,
    }
    if(this.session=="go") postdata.api = "clearlogs";
    if(this.session=="nginx") postdata.api = "nginxcls";
    this.server.PostApi(postdata).subscribe(result => {
      if(result.status!=0){
        alert(result.status+" fail : "+result.msg);
        return;
      }
      alert("clear success!")
      this.refresh();
    }, err=>{alert("Get clearLog fail: "+err)});
  }
  //delete the log file
  delLog(){
    if (!confirm("Are you sure to delete "+this.nowShowing+"?")){
      return;
    }
    let postdata: RequestProto = {
      token: this.app.token,
      data:this.nowShowing,
    }
    if(this.session=="go") postdata.api = "deletelogs";
    if(this.session=="nginx") postdata.api = "nginxdel";
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


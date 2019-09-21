import { Component, OnInit } from '@angular/core';
import {ServerService} from '../server.service';
import {RequestProto, ReplyProto} from '../server.service';
import {AppComponent} from '../app.component';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})

export class UploadComponent implements OnInit {
  constructor(
    private app : AppComponent,
    private server: ServerService
  ) { }
  result_status = 0;
  result_msg = "";
  ngOnInit() { }

  test(){
    //get and check the value from input form 
    let pid =  (<HTMLInputElement>document.getElementById('pid')).value;
    let tag =  (<HTMLInputElement>document.getElementById('tag')).value;
    if(pid=="") {
      this.result_status = -1;
      this.result_msg = "Please input the id of problem!";
      return
    }
    let fileName =  (<HTMLInputElement>document.getElementById('file')).value; 
    const osReg = /.+os/;
    if( fileName =="" || osReg.test(fileName)==false){
      this.result_status = -1;
      this.result_msg = "Please select a os file to upload!";
      return
    }
    //collect data into form
    let form = new FormData();
    form.append('api', "pluginupdate"); 
    form.append('token', this.app.token); 
    form.append('pid', pid); 
    form.append('tag', tag); 
    form.append('osfile', (<HTMLInputElement>document.getElementById('file')).files[0]);
    //post the request
    this.server.PostForm(form).subscribe(result=>{
      console.log(result);
      if(result.status==0){
        alert("响应成功");
      }else{
        alert("Result.msg: "+result.status + result.msg);
      }
      this.result_status = result.status;
      this.result_msg = result.msg;
    }, error=>{"发送错误："+alert(error);});
  }

  
}

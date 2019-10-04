import { Component, OnInit } from '@angular/core';
import { ServerService, RequestProto } from '../server.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.css']
})
export class GenerateComponent implements OnInit {
  data : Map[] = [];

  constructor(
    private server: ServerService,
    private app: AppComponent,
  ) { }

  ngOnInit() {
    this.getData()
  }

  getData(){
    let postdata: RequestProto = {
      api: "staticdata",
      token: this.app.token,
    }
    this.server.PostApi2(postdata).subscribe(result=>{
        if(result.status==0){
          this.data = result.data;
        }else{
          alert("Get static data fail: "+ result.msg);
        }
    })
  }
}

type Map = {
    key:string,
    value:any,
}
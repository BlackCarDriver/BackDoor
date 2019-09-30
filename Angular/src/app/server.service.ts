import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  // private addr = "";
  // private addr = "http://192.168.100.129:8083";
  private addr = "http://localhost:8093";
  private addr2 = "http://localhost:4747";
  public token = "";
  constructor(private http: HttpClient) { }

  PostApi(request:RequestProto){
    var url = this.addr + "/backdoor/api"; 
    return this.http.post<ReplyProto>(url, JSON.stringify(request));
  }
  PostApi2(request:RequestProto){
    var url = this.addr2 + "/public"; 
    return this.http.post<ReplyProto>(url, JSON.stringify(request));
  }
  PostForm(form:FormData){
    var url = this.addr + "/backdoor/form"; 
    return this.http.post<ReplyProto>(url, form);
  }
  LastSection(){
    let rawStr = window.location.pathname;
    let lastSlash = rawStr.lastIndexOf("/");
    let result = rawStr.substring(lastSlash);
    return result;
   }
}

export class RequestProto{
  api?:string;
  token?:string;
  data?:any;
}

export class ReplyProto{
  status?:number;
  msg?:string;
  data?:any;
}

import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private addr = "/server";
  public token = "testtoken";
  constructor(private http: HttpClient) { }

  PostApi(request:RequestProto){
    var url = this.addr + "/backdoor/api"; 
    return this.http.post<ReplyProto>(url, JSON.stringify(request), {withCredentials: true});
  }
  PostForm(form:FormData){
    var url = this.addr + "/backdoor/form"; 
    return this.http.post<ReplyProto>(url, form, {withCredentials: true});
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

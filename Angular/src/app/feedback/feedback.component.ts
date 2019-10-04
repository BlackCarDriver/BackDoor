import { Component, OnInit } from '@angular/core';
import { ServerService, RequestProto } from '../server.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  pageNumber = 1;
  presentPage = 1;
  targetImg = "";
  describes = "";
  location = "";
  rowPrePage = 20; //how many row show in table in a page
  fbdata: rows[] = [];

  constructor(
    private server: ServerService,
  ) { }

  ngOnInit() {
    this.getFeedBackData(0);
  }

  // //get data from database, ofs specified how many rows will be skip
  getFeedBackData(ofs: number) {
    let postdata: RequestProto = {
      api: "getfeedback",
      data: ofs,
    }
    this.server.PostApi2(postdata).subscribe(result => {
      if (result.status != 0) {
        alert(result.msg);
        return;
      } else {
        this.fbdata = result.data;
        console.log(this.fbdata)
        this.pageNumber = Math.ceil(this.fbdata.length / this.rowPrePage);
        console.log(this.fbdata);
      }
    }, err => { "Request feedbackdata fail" + err });
  }

  //after a feedback record have been read, update it record's state to 1
  updateState(fbid: number) {
    let postdata: RequestProto = {
      api: "setfbisread",
      data: fbid,
    }
    this.server.PostApi2(postdata).subscribe(result => {
      if (result.status != 0) {
        alert(result.msg);
        return;
      }
    }, err => { "Request update state fail:" + err });
  }

  //####################### tools function ############################

  setUpDesPanCont(imgurl: string, describes: string, location: string) {
    this.targetImg = imgurl;
    this.describes = describes;
    this.location = location;
    this.showDesPan();
  }
  hideDesPan() {
    let pan = (<HTMLInputElement>document.getElementById('showPan'));
    pan.style.display = "none";
  }
  showDesPan() {
    let pan = (<HTMLInputElement>document.getElementById('showPan'));
    pan.style.display = "initial";
  }
  nextPage() {
    if (this.presentPage >= this.pageNumber) return;
    this.presentPage += 1;
    this.getFeedBackData((this.presentPage - 1) * this.rowPrePage);
  }
  leastPage() {
    if (this.presentPage <= 0) return;
    this.presentPage -= 1;
    this.getFeedBackData((this.presentPage - 1) * this.rowPrePage);
  }
}

type rows = {
  id: number;
  userid: string;
  email: string;
  time: string;
  status: number;
  fbtype: string;
  location: string;
  describess: string;
  imgurl: string;
}
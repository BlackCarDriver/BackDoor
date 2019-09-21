import { Component, OnInit } from '@angular/core';
import { ServerService, RequestProto, ReplyProto } from '../server.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-linuxstat',
  templateUrl: './linuxstat.component.html',
  styleUrls: ['./linuxstat.component.css']
})
export class LinuxstatComponent implements OnInit {
  mM : MemStat;
  mC : CpuStat;
  mH = "";

  constructor(
    private server: ServerService,
    private app: AppComponent,
  ) { }

  ngOnInit() {
    this.display()
  }

  display() {
    let postdata: RequestProto = {
      api: "linuxstat",
      token: this.app.token,
    }
    this.server.PostApi(postdata).subscribe(result => {
      if (result.status != 0) {
        alert("Request linuxstat data fail:" + result.msg);
        return;
      }
      let tmp: hostStat = result.data;
      this.mM = tmp.menState;
      this.mC = tmp.cpuState;
      this.mH = tmp.vmState;
      this.getEle('vmstatbox').innerHTML = this.mH;
      this.getEle('total').style.borderLeft = this.getCss(this.mM.total);
      this.getEle('used').style.borderLeft = this.getCss(this.mM.used);
      this.getEle('free').style.borderLeft = this.getCss(this.mM.free);
      this.getEle('shared').style.borderLeft = this.getCss(this.mM.shared);
      this.getEle('cache').style.borderLeft = this.getCss(this.mM.cache);
      this.getEle('avail').style.borderLeft = this.getCss(this.mM.available);
    }, err => {
      alert("Get hoststate fail: " + err);
    })
  }

  getEle(id: string) {
    return (<HTMLInputElement>document.getElementById(id));
  }
  getCss(n: number) {
    return Math.ceil(n / this.mM.total * 380) + "px solid"
  }
}


//virtual memory statistics
type MemStat = {
  total: number;
  used: number;
  free: number;
  shared: number;
  cache: number;
  available: number;
}
//message of System load averages
type CpuStat = {
  omin: number;
  fmin: number;
  ftmin: number;
}

//includ menory message, load message and vm-state message
type hostStat = {
  cpuState: CpuStat,
  menState: MemStat,
  vmState: string,
}


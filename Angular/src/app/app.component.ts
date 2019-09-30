import { Component } from '@angular/core';
import {ServerService} from '../app/server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor(
    private server: ServerService
  ) { }
  //function lists
  choices : choice[] = [
    {name:"plugin-upload", routerline:"/upload"},
    {name:"linux-stat", routerline:"/linstat"},
    {name:"logger", routerline:"/log"},
    {name:"generate", routerline:"/generate"},
    {name:"feedback", routerline:"/feedback"},
    {name:"testing", routerline:"/test"},
  ];
  //the function which is displying
  chosing = "/upload";
  //the token used by all function and set by user
  public token = ""; 
  ngOnInit(){
    this.chosing = this.server.LastSection();
  }
  setChoice(c:string){
    this.chosing = c;
  }
}

type choice = {
  name:string;
  routerline:string;
} 
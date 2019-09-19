import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  //function lists
  choices : choice[] = [
    {name:"plugin-upload", routerline:"/upload"},
    {name:"display-state", routerline:"/healty"},
    {name:"testing", routerline:"/test"},
  ];
  //the function which is displying
  chosing = "plugin-upload";
  //the token used by all function and set by user
  public token = "testtoken"; 

  setChoice(c:string){
    this.chosing = c;
  }
}

type choice = {
  name:string;
  routerline:string;
} 
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogshowComponent } from './logshow.component';

describe('LogshowComponent', () => {
  let component: LogshowComponent;
  let fixture: ComponentFixture<LogshowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogshowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinuxstatComponent } from './linuxstat.component';

describe('LinuxstatComponent', () => {
  let component: LinuxstatComponent;
  let fixture: ComponentFixture<LinuxstatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinuxstatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinuxstatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetScaleComponent } from './set-scale.component';

describe('SetScaleComponent', () => {
  let component: SetScaleComponent;
  let fixture: ComponentFixture<SetScaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetScaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

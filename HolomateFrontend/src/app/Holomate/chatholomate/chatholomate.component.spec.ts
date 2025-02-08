import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatholomateComponent } from './chatholomate.component';

describe('ChatholomateComponent', () => {
  let component: ChatholomateComponent;
  let fixture: ComponentFixture<ChatholomateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatholomateComponent]
    });
    fixture = TestBed.createComponent(ChatholomateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

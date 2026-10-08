import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormActualizar } from './form-actualizar';

describe('FormActualizar', () => {
  let component: FormActualizar;
  let fixture: ComponentFixture<FormActualizar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormActualizar],
    }).compileComponents();

    fixture = TestBed.createComponent(FormActualizar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

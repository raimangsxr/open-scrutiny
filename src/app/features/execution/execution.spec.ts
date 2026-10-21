import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../../app.routes';
import { VoteService } from '../../core/services/vote.service';
import { ExecutionComponent } from './execution';

describe('ExecutionComponent', () => {
  let fixture: ComponentFixture<ExecutionComponent>;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ExecutionComponent],
      providers: [provideRouter(routes), VoteService],
    }).compileComponents();

    router = TestBed.inject(Router);
    await router.navigateByUrl('/execution');
    fixture = TestBed.createComponent(ExecutionComponent);
  });

  it('redirects to config when there is no election configuration', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/config']);
  });

  it('shows storage error UI when config data is corrupt', async () => {
    localStorage.setItem('vote_app_data', '<<<');
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ExecutionComponent],
      providers: [provideRouter(routes), VoteService],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    await router.navigateByUrl('/execution');

    const corruptFixture = TestBed.createComponent(ExecutionComponent);
    corruptFixture.detectChanges();
    await corruptFixture.whenStable();

    const el = corruptFixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Datos de elección no disponibles');
    expect(navigateSpy).not.toHaveBeenCalledWith(['/config']);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { routes } from '../../app.routes';
import { VoteService } from '../../core/services/vote.service';
import { ExecutionComponent } from './execution';

function seedConfig() {
  const config = {
    title: 'Test',
    description: 'Desc',
    logoUrl: null,
    votingItems: [
      {
        id: 'item-1',
        question: 'Q1',
        options: [
          { id: 'opt-a', label: 'A', count: 0 },
          { id: 'opt-b', label: 'B', count: 0 },
        ],
      },
    ],
  };
  localStorage.setItem('vote_app_data', JSON.stringify(config));
}

describe('ExecutionComponent', () => {
  let fixture: ComponentFixture<ExecutionComponent>;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ExecutionComponent],
      providers: [provideRouter(routes), VoteService, provideNoopAnimations()],
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
      providers: [provideRouter(routes), VoteService, provideNoopAnimations()],
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

  it('requires every pregunta selected before confirming papeleta', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ExecutionComponent],
      providers: [provideRouter(routes), VoteService, provideNoopAnimations()],
    }).compileComponents();

    const voteService = TestBed.inject(VoteService);
    voteService.saveConfig({
      title: 'Test',
      description: '',
      logoUrl: null,
      votingItems: [
        {
          id: 'item-1',
          question: 'Q1',
          options: [{ id: 'opt-a', label: 'A', count: 0 }],
        },
      ],
    });

    await TestBed.inject(Router).navigateByUrl('/execution');
    fixture = TestBed.createComponent(ExecutionComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.canConfirmBallot).toBe(false);
    fixture.componentInstance.selectOption('item-1', 'opt-a');
    expect(fixture.componentInstance.canConfirmBallot).toBe(true);
  });

  it('opens corrección de totales dialog on Ctrl+Shift+E', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ExecutionComponent],
      providers: [provideRouter(routes), VoteService, provideNoopAnimations()],
    }).compileComponents();

    TestBed.inject(VoteService).saveConfig({
      title: 'Test',
      description: '',
      logoUrl: null,
      votingItems: [
        {
          id: 'item-1',
          question: 'Q1',
          options: [{ id: 'opt-a', label: 'A', count: 0 }],
        },
      ],
    });

    await TestBed.inject(Router).navigateByUrl('/execution');
    fixture = TestBed.createComponent(ExecutionComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const openSpy = vi.spyOn(fixture.componentInstance, 'openExecutionOptionsDialog');

    fixture.componentInstance.onKeyDown(
      new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'e' })
    );

    expect(openSpy).toHaveBeenCalled();
  });

  it('shows shortcut hint for corrección de totales', async () => {
    seedConfig();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ExecutionComponent],
      providers: [provideRouter(routes), VoteService, provideNoopAnimations()],
    }).compileComponents();
    await TestBed.inject(Router).navigateByUrl('/execution');
    fixture = TestBed.createComponent(ExecutionComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Opciones de ejecución: Ctrl+Shift+E');
  });
});

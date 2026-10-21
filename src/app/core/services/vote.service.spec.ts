import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ElectionConfig, VoteService } from './vote.service';

const CONFIG_KEY = 'vote_app_data';
const VOTES_KEY = 'vote_app_counts';
const LAST_BALLOT_KEY = 'vote_app_last_ballot';

function sampleConfig(): ElectionConfig {
  return {
    title: 'Elección de prueba',
    description: 'Descripción',
    logoUrl: null,
    votingItems: [
      {
        id: 'item-1',
        question: '¿Aprueba?',
        options: [
          { id: 'opt-si', label: 'SI', count: 0 },
          { id: 'opt-no', label: 'NO', count: 0 },
        ],
      },
    ],
  };
}

function twoQuestionConfig(): ElectionConfig {
  return {
    title: 'Dos preguntas',
    description: '',
    logoUrl: null,
    votingItems: [
      {
        id: 'item-1',
        question: 'P1',
        options: [{ id: 'a1', label: 'A', count: 0 }],
      },
      {
        id: 'item-2',
        question: 'P2',
        options: [{ id: 'b1', label: 'B', count: 0 }],
      },
    ],
  };
}

describe('VoteService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts with no config when storage is empty', async () => {
    const service = TestBed.inject(VoteService);
    const config = await firstValueFrom(service.config$);
    expect(config).toBeNull();
  });

  it('saveConfig persists definition with zero counts and clears vote storage', () => {
    const service = TestBed.inject(VoteService);
    const config = sampleConfig();
    config.votingItems[0].options[0].count = 5;

    service.saveConfig(config);

    const stored = JSON.parse(localStorage.getItem(CONFIG_KEY)!);
    expect(stored.votingItems[0].options[0].count).toBe(0);
    expect(localStorage.getItem(VOTES_KEY)).toBeNull();
    expect(localStorage.getItem(LAST_BALLOT_KEY)).toBeNull();
  });

  it('saveVote increments count and persists votes separately', async () => {
    const service = TestBed.inject(VoteService);
    service.saveConfig(sampleConfig());

    service.saveVote('item-1', 'opt-si');
    service.saveVote('item-1', 'opt-si');

    const config = await firstValueFrom(service.config$);
    expect(config!.votingItems[0].options[0].count).toBe(2);

    const votes = JSON.parse(localStorage.getItem(VOTES_KEY)!);
    expect(votes['item-1']['opt-si']).toBe(2);
  });

  it('commitBallot increments all preguntas and stores last papeleta', async () => {
    const service = TestBed.inject(VoteService);
    service.saveConfig(twoQuestionConfig());

    const ok = service.commitBallot({ 'item-1': 'a1', 'item-2': 'b1' });
    expect(ok).toBe(true);

    const config = await firstValueFrom(service.config$);
    expect(config!.votingItems[0].options[0].count).toBe(1);
    expect(config!.votingItems[1].options[0].count).toBe(1);

    const last = JSON.parse(localStorage.getItem(LAST_BALLOT_KEY)!);
    expect(last).toEqual({ 'item-1': 'a1', 'item-2': 'b1' });
  });

  it('commitBallot rejects incomplete papeleta', () => {
    const service = TestBed.inject(VoteService);
    service.saveConfig(twoQuestionConfig());

    expect(service.commitBallot({ 'item-1': 'a1' })).toBe(false);
    expect(service.canUndoLastBallot()).toBe(false);
  });

  it('undoLastBallot reverts last contabilizada papeleta', async () => {
    const service = TestBed.inject(VoteService);
    service.saveConfig(twoQuestionConfig());
    service.commitBallot({ 'item-1': 'a1', 'item-2': 'b1' });
    service.commitBallot({ 'item-1': 'a1', 'item-2': 'b1' });

    expect(service.undoLastBallot()).toBe(true);

    const config = await firstValueFrom(service.config$);
    expect(config!.votingItems[0].options[0].count).toBe(1);
    expect(config!.votingItems[1].options[0].count).toBe(1);
    expect(service.canUndoLastBallot()).toBe(false);
  });

  it('undoLastBallot survives reload', async () => {
    const first = TestBed.inject(VoteService);
    first.saveConfig(sampleConfig());
    first.commitBallot({ 'item-1': 'opt-si' });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(VoteService);

    expect(reloaded.canUndoLastBallot()).toBe(true);
    expect(reloaded.undoLastBallot()).toBe(true);
    const config = await firstValueFrom(reloaded.config$);
    expect(config!.votingItems[0].options[0].count).toBe(0);
  });

  it('applyManualCorrection clears undo and sets absolute counts', async () => {
    const service = TestBed.inject(VoteService);
    service.saveConfig(twoQuestionConfig());
    service.commitBallot({ 'item-1': 'a1', 'item-2': 'b1' });

    service.applyManualCorrection({
      'item-1': { a1: 10 },
      'item-2': { b1: 3 },
    });

    expect(service.canUndoLastBallot()).toBe(false);
    const config = await firstValueFrom(service.config$);
    expect(config!.votingItems[0].options[0].count).toBe(10);
    expect(config!.votingItems[1].options[0].count).toBe(3);
  });

  it('reloads config and vote counts from localStorage in a new instance', async () => {
    const first = TestBed.inject(VoteService);
    first.saveConfig(sampleConfig());
    first.saveVote('item-1', 'opt-no');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    const reloaded = TestBed.inject(VoteService);
    const config = await firstValueFrom(reloaded.config$);

    expect(config!.title).toBe('Elección de prueba');
    expect(config!.votingItems[0].options.find((o) => o.id === 'opt-no')!.count).toBe(1);
  });

  it('reset clears storage and emits null config', async () => {
    const service = TestBed.inject(VoteService);
    service.saveConfig(sampleConfig());
    service.reset();

    expect(localStorage.getItem(CONFIG_KEY)).toBeNull();
    expect(localStorage.getItem(VOTES_KEY)).toBeNull();
    expect(localStorage.getItem(LAST_BALLOT_KEY)).toBeNull();
    const config = await firstValueFrom(service.config$);
    expect(config).toBeNull();
  });

  it('reports storage error when config JSON is corrupt', async () => {
    localStorage.setItem(CONFIG_KEY, '{not valid json');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    const service = TestBed.inject(VoteService);
    const error = await firstValueFrom(service.storageError$);
    const config = await firstValueFrom(service.config$);

    expect(error).toContain('configuración');
    expect(config).toBeNull();
  });

  it('reports storage error when votes JSON is corrupt', async () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(sampleConfig()));
    localStorage.setItem(VOTES_KEY, '{bad votes');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    const service = TestBed.inject(VoteService);
    const error = await firstValueFrom(service.storageError$);

    expect(error).toContain('votos');
  });

  it('setOptionCount sets absolute count and persists', async () => {
    const service = TestBed.inject(VoteService);
    service.saveConfig(sampleConfig());
    service.setOptionCount('item-1', 'opt-si', 42);

    const config = await firstValueFrom(service.config$);
    expect(config!.votingItems[0].options[0].count).toBe(42);

    const votes = JSON.parse(localStorage.getItem(VOTES_KEY)!);
    expect(votes['item-1']['opt-si']).toBe(42);
  });

  it('setOptionCount clamps negative values to zero', async () => {
    const service = TestBed.inject(VoteService);
    service.saveConfig(sampleConfig());
    service.setOptionCount('item-1', 'opt-si', -5);

    const config = await firstValueFrom(service.config$);
    expect(config!.votingItems[0].options[0].count).toBe(0);
  });
});

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface VotingOption {
    id: string;
    label: string;
    count: number;
}

export interface VotingItem {
    id: string;
    question: string;
    options: VotingOption[];
}

export interface ElectionConfig {
    title: string;
    description: string;
    logoUrl: string | null;
    votingItems: VotingItem[];
}

const CONFIG_KEY = 'vote_app_data';
const VOTES_KEY = 'vote_app_counts';

@Injectable({
    providedIn: 'root'
})
export class VoteService {
    private configSubject = new BehaviorSubject<ElectionConfig | null>(null);
    private storageErrorSubject = new BehaviorSubject<string | null>(null);

    config$ = this.configSubject.asObservable();
    storageError$ = this.storageErrorSubject.asObservable();

    constructor() {
        this.loadFromStorage();
    }

    getStorageError(): string | null {
        return this.storageErrorSubject.value;
    }

    private loadFromStorage() {
        this.clearStorageError();
        const configData = localStorage.getItem(CONFIG_KEY);
        const votesData = localStorage.getItem(VOTES_KEY);

        if (!configData) {
            this.configSubject.next(null);
            return;
        }

        let config: ElectionConfig;
        try {
            config = JSON.parse(configData);
        } catch {
            this.failStorage(
                'No se pudo leer la configuración guardada (datos corruptos). Vuelva a configurar la elección.'
            );
            return;
        }

        if (!this.isValidConfig(config)) {
            this.failStorage(
                'La configuración guardada no es válida o está incompleta. Vuelva a configurar la elección.'
            );
            return;
        }

        if (votesData) {
            try {
                const votes = JSON.parse(votesData);
                this.applyVotesToConfig(config, votes);
            } catch {
                this.failStorage(
                    'No se pudieron leer los votos guardados (datos corruptos). Vuelva a configurar la elección.'
                );
                return;
            }
        }

        this.configSubject.next(config);
    }

    private failStorage(message: string) {
        this.storageErrorSubject.next(message);
        this.configSubject.next(null);
    }

    private clearStorageError() {
        this.storageErrorSubject.next(null);
    }

    private isValidConfig(config: unknown): config is ElectionConfig {
        if (!config || typeof config !== 'object') {
            return false;
        }
        const c = config as ElectionConfig;
        if (typeof c.title !== 'string' || !Array.isArray(c.votingItems) || c.votingItems.length === 0) {
            return false;
        }
        return c.votingItems.every(
            (item) =>
                typeof item.id === 'string' &&
                typeof item.question === 'string' &&
                Array.isArray(item.options) &&
                item.options.length > 0 &&
                item.options.every(
                    (opt) =>
                        typeof opt.id === 'string' &&
                        typeof opt.label === 'string' &&
                        typeof opt.count === 'number'
                )
        );
    }

    private applyVotesToConfig(config: ElectionConfig, votes: Record<string, Record<string, number>>) {
        if (!votes) return;

        config.votingItems.forEach(item => {
            if (votes[item.id]) {
                item.options.forEach(option => {
                    if (votes[item.id][option.id] !== undefined) {
                        const n = votes[item.id][option.id];
                        option.count = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : option.count;
                    }
                });
            }
        });
    }

    saveConfig(config: ElectionConfig) {
        const configToSave = JSON.parse(JSON.stringify(config));
        configToSave.votingItems.forEach((i: VotingItem) =>
            i.options.forEach((o) => (o.count = 0))
        );
        localStorage.setItem(CONFIG_KEY, JSON.stringify(configToSave));
        localStorage.removeItem(VOTES_KEY);
        this.clearStorageError();
        this.configSubject.next(config);
    }

    saveVote(itemId: string, optionId: string) {
        const currentConfig = this.configSubject.value;
        if (!currentConfig) return;

        const itemIndex = currentConfig.votingItems.findIndex(i => i.id === itemId);
        if (itemIndex > -1) {
            const optionIndex = currentConfig.votingItems[itemIndex].options.findIndex(o => o.id === optionId);
            if (optionIndex > -1) {
                currentConfig.votingItems[itemIndex].options[optionIndex].count++;
                this.saveVotesToStorage(currentConfig);
                this.configSubject.next({ ...currentConfig });
            }
        }
    }

    setOptionCount(itemId: string, optionId: string, count: number) {
        const currentConfig = this.configSubject.value;
        if (!currentConfig) return;

        const safeCount = Math.max(0, Math.floor(Number(count)) || 0);
        const item = currentConfig.votingItems.find((i) => i.id === itemId);
        const option = item?.options.find((o) => o.id === optionId);
        if (!option) return;

        option.count = safeCount;
        this.saveVotesToStorage(currentConfig);
        this.configSubject.next({ ...currentConfig });
    }

    private saveVotesToStorage(config: ElectionConfig) {
        const votes: Record<string, Record<string, number>> = {};
        config.votingItems.forEach(item => {
            votes[item.id] = {};
            item.options.forEach(option => {
                votes[item.id][option.id] = option.count;
            });
        });
        localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
    }

    reset() {
        localStorage.removeItem(CONFIG_KEY);
        localStorage.removeItem(VOTES_KEY);
        this.clearStorageError();
        this.configSubject.next(null);
    }
}

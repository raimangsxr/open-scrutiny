import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

const STORAGE_KEY = 'vote_app_data';

@Injectable({
    providedIn: 'root'
})
export class VoteService {
    private configSubject = new BehaviorSubject<ElectionConfig | null>(null);
    config$ = this.configSubject.asObservable();

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            try {
                const config = JSON.parse(data);
                this.configSubject.next(config);
            } catch (e) {
                console.error('Error parsing local storage data', e);
                this.configSubject.next(null);
            }
        } else {
            this.configSubject.next(null);
        }
    }

    saveConfig(config: ElectionConfig) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        this.configSubject.next(config);
    }

    getConfig(): ElectionConfig | null {
        return this.configSubject.value;
    }

    saveVote(itemId: string, optionId: string) {
        const currentConfig = this.configSubject.value;
        if (!currentConfig) return;

        const itemIndex = currentConfig.votingItems.findIndex(i => i.id === itemId);
        if (itemIndex > -1) {
            const optionIndex = currentConfig.votingItems[itemIndex].options.findIndex(o => o.id === optionId);
            if (optionIndex > -1) {
                currentConfig.votingItems[itemIndex].options[optionIndex].count++;
                this.saveConfig(currentConfig);
            }
        }
    }

    reset() {
        localStorage.removeItem(STORAGE_KEY);
        this.configSubject.next(null);
    }
}

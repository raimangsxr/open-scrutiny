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

const CONFIG_KEY = 'vote_app_data';
const VOTES_KEY = 'vote_app_counts';

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
        const configData = localStorage.getItem(CONFIG_KEY);
        const votesData = localStorage.getItem(VOTES_KEY);

        if (configData) {
            try {
                const config = JSON.parse(configData);

                // Load votes if available and merge into config
                if (votesData) {
                    try {
                        const votes = JSON.parse(votesData);
                        this.applyVotesToConfig(config, votes);
                    } catch (e) {
                        console.error('Error parsing votes data', e);
                    }
                }

                this.configSubject.next(config);
            } catch (e) {
                console.error('Error parsing local storage data', e);
                this.configSubject.next(null);
            }
        } else {
            this.configSubject.next(null);
        }
    }

    private applyVotesToConfig(config: ElectionConfig, votes: any) {
        if (!votes) return;

        config.votingItems.forEach(item => {
            if (votes[item.id]) {
                item.options.forEach(option => {
                    if (votes[item.id][option.id] !== undefined) {
                        option.count = votes[item.id][option.id];
                    }
                });
            }
        });
    }

    saveConfig(config: ElectionConfig) {
        // Save config definition (resetting counts in the stored definition to keep it clean)
        const configToSave = JSON.parse(JSON.stringify(config));
        configToSave.votingItems.forEach((i: any) => i.options.forEach((o: any) => o.count = 0));
        localStorage.setItem(CONFIG_KEY, JSON.stringify(configToSave));

        // If this is a new config save (from Config mode), we effectively reset the current state
        // We also clear the votes storage because a new config implies a new election
        localStorage.removeItem(VOTES_KEY);

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
                // Save votes to separate storage
                this.saveVotesToStorage(currentConfig);
                // Notify subscribers
                this.configSubject.next(currentConfig);
            }
        }
    }

    private saveVotesToStorage(config: ElectionConfig) {
        const votes: any = {};
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
        this.configSubject.next(null);
    }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VoteService, ElectionConfig } from '../../core/services/vote.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './config.html',
  styleUrl: './config.css'
})
export class ConfigComponent {
  configForm: FormGroup;
  logoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private voteService: VoteService,
    private router: Router
  ) {
    this.configForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      logoUrl: [null],
      votingItems: this.fb.array([])
    });

    // Add initial voting item
    this.addVotingItem();
  }

  get votingItems() {
    return this.configForm.get('votingItems') as FormArray;
  }

  getOptions(itemIndex: number) {
    return this.votingItems.at(itemIndex).get('options') as FormArray;
  }

  addVotingItem() {
    const item = this.fb.group({
      id: [uuidv4()],
      question: ['', Validators.required],
      options: this.fb.array([])
    });
    this.votingItems.push(item);

    // Add initial options
    this.addOption(this.votingItems.length - 1);
    this.addOption(this.votingItems.length - 1);
  }

  removeVotingItem(index: number) {
    this.votingItems.removeAt(index);
  }

  addOption(itemIndex: number) {
    const option = this.fb.group({
      id: [uuidv4()],
      label: ['', Validators.required],
      count: [0]
    });
    this.getOptions(itemIndex).push(option);
  }

  removeOption(itemIndex: number, optionIndex: number) {
    this.getOptions(itemIndex).removeAt(optionIndex);
  }

  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
        this.configForm.patchValue({ logoUrl: this.logoPreview });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.configForm.valid) {
      const config: ElectionConfig = this.configForm.value;
      this.voteService.saveConfig(config);
      this.router.navigate(['/execution']);
    }
  }
}

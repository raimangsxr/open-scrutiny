import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VoteService, ElectionConfig } from '../../core/services/vote.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
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

    // Add pre-configured options: SI, NO, N/C
    const itemIndex = this.votingItems.length - 1;
    this.addPreconfiguredOption(itemIndex, 'SI');
    this.addPreconfiguredOption(itemIndex, 'NO');
    this.addPreconfiguredOption(itemIndex, 'N/C');
  }

  addPreconfiguredOption(itemIndex: number, label: string) {
    const option = this.fb.group({
      id: [uuidv4()],
      label: [label, Validators.required],
      count: [0]
    });
    this.getOptions(itemIndex).push(option);
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
    const options = this.getOptions(itemIndex);
    // Allow removing if at least 1 option will remain
    if (options.length > 1) {
      options.removeAt(optionIndex);
    }
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

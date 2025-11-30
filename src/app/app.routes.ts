import { Routes } from '@angular/router';
import { ConfigComponent } from './features/config/config';
import { ExecutionComponent } from './features/execution/execution';

export const routes: Routes = [
    { path: '', redirectTo: 'execution', pathMatch: 'full' },
    { path: 'config', component: ConfigComponent },
    { path: 'execution', component: ExecutionComponent }
];

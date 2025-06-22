import { LitElement } from 'lit';

export abstract class OnboardingStep extends LitElement {
  abstract saveData(): Promise<void>;
} 
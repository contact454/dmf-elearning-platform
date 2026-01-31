/**
 * Degrade Mode (Chế độ Giảm tải)
 * 
 * Auto-degrade mode for handling overload situations.
 */

export type DegradeMode = 'normal' | 'degraded' | 'manual_override';

export interface DegradeState {
  mode: DegradeMode;
  activatedAt?: string;
  activatedBy?: string;
  reason?: string;
  autoActions: {
    hardGateDisabledScopes: Array<{
      scope: 'course' | 'lesson';
      scopeId: string;
    }>;
    reviewTypesDowngraded: string[]; // Evidence types that no longer require review
  };
}

class DegradeModeRegistry {
  private state: DegradeState = {
    mode: 'normal',
    autoActions: {
      hardGateDisabledScopes: [],
      reviewTypesDowngraded: [],
    },
  };

  /**
   * Get current degrade state
   */
  getState(): DegradeState {
    return { ...this.state };
  }

  /**
   * Activate degrade mode
   */
  activate(activatedBy: string, reason?: string, autoActions?: DegradeState['autoActions']): void {
    this.state = {
      mode: 'degraded',
      activatedAt: new Date().toISOString(),
      activatedBy,
      reason,
      autoActions: autoActions || {
        hardGateDisabledScopes: [],
        reviewTypesDowngraded: [],
      },
    };
  }

  /**
   * Deactivate degrade mode
   */
  deactivate(_deactivatedBy: string): void {
    this.state = {
      mode: 'normal',
      autoActions: {
        hardGateDisabledScopes: [],
        reviewTypesDowngraded: [],
      },
    };
  }

  /**
   * Set manual override
   */
  setManualOverride(activatedBy: string, reason?: string, autoActions?: DegradeState['autoActions']): void {
    this.state = {
      mode: 'manual_override',
      activatedAt: new Date().toISOString(),
      activatedBy,
      reason,
      autoActions: autoActions || {
        hardGateDisabledScopes: [],
        reviewTypesDowngraded: [],
      },
    };
  }

  /**
   * Check if degrade mode is active
   */
  isActive(): boolean {
    return this.state.mode === 'degraded' || this.state.mode === 'manual_override';
  }
}

// Singleton instance
let registryInstance: DegradeModeRegistry | null = null;

export function getDegradeModeRegistry(): DegradeModeRegistry {
  if (!registryInstance) {
    registryInstance = new DegradeModeRegistry();
  }
  return registryInstance;
}

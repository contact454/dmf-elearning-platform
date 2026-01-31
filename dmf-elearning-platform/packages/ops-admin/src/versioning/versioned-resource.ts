/**
 * Versioned Resource Abstraction (Trừu tượng Tài nguyên Có Phiên bản)
 * 
 * Generic versioning interface for config, policy, content, etc.
 */

export interface VersionedResource<T> {
  id: string;
  version: number;
  payload: T;
  createdAt: string;
  createdBy: string;
}

export interface VersionHistory<T> {
  resourceId: string;
  versions: VersionedResource<T>[];
  currentVersion: number;
}

/**
 * Generic versioned resource store
 */
export class VersionedResourceStore<T> {
  private resources = new Map<string, VersionedResource<T>>(); // Current version
  private histories = new Map<string, VersionedResource<T>[]>(); // All versions

  /**
   * Create or update resource (creates new version)
   */
  createVersion(
    id: string,
    payload: T,
    createdBy: string
  ): VersionedResource<T> {
    const existing = this.resources.get(id);
    const newVersion = existing ? existing.version + 1 : 1;

    const versioned: VersionedResource<T> = {
      id,
      version: newVersion,
      payload,
      createdAt: new Date().toISOString(),
      createdBy,
    };

    // Store current version
    this.resources.set(id, versioned);

    // Store version history
    const history = this.histories.get(id) || [];
    history.push({ ...versioned });
    this.histories.set(id, history);

    return versioned;
  }

  /**
   * Get current version
   */
  getCurrent(id: string): VersionedResource<T> | null {
    return this.resources.get(id) || null;
  }

  /**
   * Get version history
   */
  getHistory(id: string): VersionedResource<T>[] {
    return this.histories.get(id) || [];
  }

  /**
   * Get specific version
   */
  getVersion(id: string, version: number): VersionedResource<T> | null {
    const history = this.histories.get(id);
    if (!history) {
      return null;
    }

    return history.find((v) => v.version === version) || null;
  }

  /**
   * Rollback to specific version (does not delete versions)
   */
  rollback(id: string, targetVersion: number, actorUserId: string): VersionedResource<T> | null {
    const target = this.getVersion(id, targetVersion);
    if (!target) {
      return null;
    }

    // Create new version with payload from target version
    const newVersion: VersionedResource<T> = {
      id,
      version: target.version + 1, // Increment version
      payload: { ...target.payload }, // Copy payload
      createdAt: new Date().toISOString(),
      createdBy: actorUserId,
    };

    // Update current version
    this.resources.set(id, newVersion);

    // Add to history
    const history = this.histories.get(id) || [];
    history.push(newVersion);
    this.histories.set(id, history);

    return newVersion;
  }
}

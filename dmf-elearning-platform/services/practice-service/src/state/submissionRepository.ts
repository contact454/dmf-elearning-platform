/**
 * Submission Repository (Kho lưu trữ Submission)
 * Owned by practice-service - no cross-service access
 */

import type { Submission, SubmissionId } from '../domain/submission';

interface SubmissionRepository {
  findById(id: SubmissionId): Promise<Submission | null>;
  save(submission: Submission): Promise<Submission>;
  delete(id: SubmissionId): Promise<void>;
  create(data: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'> | (Omit<Submission, 'createdAt' | 'updatedAt'> & { id: SubmissionId })): Promise<Submission>;
}

class InMemorySubmissionRepository implements SubmissionRepository {
  private submissions: Map<SubmissionId, Submission> = new Map();

  async findById(id: SubmissionId): Promise<Submission | null> {
    return this.submissions.get(id) || null;
  }

  async save(submission: Submission): Promise<Submission> {
    submission.updatedAt = new Date();
    this.submissions.set(submission.id, submission);
    return submission;
  }

  async delete(id: SubmissionId): Promise<void> {
    this.submissions.delete(id);
  }

  async create(data: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'> | (Omit<Submission, 'createdAt' | 'updatedAt'> & { id: SubmissionId })): Promise<Submission> {
    const submission: Submission = {
      ...data,
      id: 'id' in data ? data.id : (crypto.randomUUID() as SubmissionId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.save(submission);
    return submission;
  }
}

export const submissionRepository = new InMemorySubmissionRepository();

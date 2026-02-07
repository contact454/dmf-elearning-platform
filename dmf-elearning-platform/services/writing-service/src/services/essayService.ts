import { prisma } from '../database/connection';

export class EssayService {
  async createEssay(userId: string, promptId: string | null, content: string) {
    const wordCount = this.countWords(content);

    const essay = await prisma.essay.create({
      data: {
        userId,
        promptId,
        content,
        wordCount,
        status: 'draft',
      },
    });

    return essay;
  }

  async updateEssay(
    essayId: string,
    userId: string,
    data: {
      content?: string;
      errorCount?: number;
      writingTimeSeconds?: number;
      status?: string;
    }
  ) {
    // Verify ownership
    const essay = await prisma.essay.findFirst({
      where: { id: essayId, userId },
    });

    if (!essay) {
      throw new Error('Essay not found or access denied');
    }

    const wordCount = data.content ? this.countWords(data.content) : undefined;

    const updated = await prisma.essay.update({
      where: { id: essayId },
      data: {
        content: data.content,
        wordCount,
        errorCount: data.errorCount,
        writingTimeSeconds: data.writingTimeSeconds,
        status: data.status,
      },
    });

    return updated;
  }

  async getEssay(essayId: string, userId: string) {
    const essay = await prisma.essay.findFirst({
      where: { id: essayId, userId },
      include: {
        prompt: true,
        grammarErrors: {
          orderBy: { offset: 'asc' },
        },
      },
    });

    if (!essay) {
      throw new Error('Essay not found or access denied');
    }

    return essay;
  }

  async listEssays(userId: string, limit: number = 20, offset: number = 0) {
    const [essays, total] = await Promise.all([
      prisma.essay.findMany({
        where: { userId },
        include: { prompt: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.essay.count({ where: { userId } }),
    ]);

    return { essays, total };
  }

  async deleteEssay(essayId: string, userId: string) {
    // Verify ownership
    const essay = await prisma.essay.findFirst({
      where: { id: essayId, userId },
    });

    if (!essay) {
      throw new Error('Essay not found or access denied');
    }

    await prisma.essay.delete({ where: { id: essayId } });
  }

  countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }
}

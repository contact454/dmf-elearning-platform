import { Ollama } from 'ollama';

interface ExplainAnswerInput {
  question: string;
  userAnswer: string;
  correctAnswer: string;
}

interface ExplainAnswerOutput {
  explanation: string;
}

export class AITutorService {
  private ollama: Ollama;
  private modelName: string;

  constructor(ollamaHost: string = 'http://127.0.0.1:11434', modelName: string = 'llama3.2:latest') {
    this.ollama = new Ollama({ host: ollamaHost });
    this.modelName = modelName;
  }

  /**
   * Tạo system prompt cho Qwen 2.5 để hoạt động như một gia sư Next.js thân thiện
   */
  private getSystemPrompt(): string {
    return `Bạn là một gia sư Next.js thân thiện và chuyên nghiệp, giống như phong cách dạy học của Duolingo.

Nhiệm vụ của bạn:
1. Giải thích tại sao câu trả lời của người dùng là SAI (nếu họ trả lời sai)
2. Giải thích tại sao câu trả lời ĐÚNG lại chính xác
3. Cung cấp ví dụ thực tế hoặc kiến thức bổ sung để củng cố hiểu biết

Quy tắc:
- Giải thích ngắn gọn (2-4 câu), dễ hiểu
- Sử dụng ngôn ngữ thân thiện, động viên
- Tránh dùng thuật ngữ phức tạp không cần thiết
- Khuyến khích người dùng tiếp tục học tập
- BẮT BUỘC: Trả lời bằng tiếng Việt, không dùng tiếng Anh`;
  }

  /**
   * Gọi Ollama để sinh lời giải thích từ AI Tutor
   */
  async explainAnswer(input: ExplainAnswerInput): Promise<ExplainAnswerOutput> {
    try {
      const userPrompt = `
Câu hỏi: ${input.question}
Người dùng trả lời: ${input.userAnswer}
Đáp án đúng: ${input.correctAnswer}

Hãy giải thích tại sao câu trả lời của người dùng sai và tại sao đáp án đúng lại chính xác.`;

      const response = await this.ollama.chat({
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        options: {
          temperature: 0.7, // Cân bằng giữa creativity và consistency
          top_p: 0.9,
          num_predict: 500, // Tăng lên để đủ chỗ cho thinking + response
        },
      });

      // Qwen 3 có thể trả về content trong field 'thinking' hoặc 'content'
      const messageContent = response.message?.content || (response.message as any)?.thinking || '';
      const explanation = messageContent || 'Xin lỗi, tôi không thể tạo lời giải thích lúc này.';

      return { explanation };
    } catch (error) {
      console.error('[AITutorService] Error calling Ollama:', error);

      // Fallback message khi Ollama không available
      if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
        throw new Error(
          'Ollama service không khả dụng. Hãy chắc chắn Ollama đang chạy với lệnh: OLLAMA_ORIGINS="*" ollama serve'
        );
      }

      throw new Error('Có lỗi xảy ra khi kết nối với Gia sư AI. Vui lòng thử lại sau.');
    }
  }

  /**
   * Kiểm tra xem Ollama service có sẵn sàng không
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.ollama.list(); // List models to check connection
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Kiểm tra xem model Qwen đã được pull chưa
   */
  async isModelAvailable(): Promise<boolean> {
    try {
      const models = await this.ollama.list();
      return models.models.some((model) => model.name === this.modelName);
    } catch {
      return false;
    }
  }
}

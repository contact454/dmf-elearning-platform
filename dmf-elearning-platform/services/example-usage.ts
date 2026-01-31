/**
 * Example Usage of Service Handlers
 * Ví dụ sử dụng Service Handlers
 * 
 * This file demonstrates how to call service handlers manually.
 * File này minh họa cách gọi service handlers thủ công.
 * 
 * Usage (if there's a local dev entry point):
 * import { RegisterUserHandler } from './onboarding/handlers/register-user.handler';
 * import { NoOpEventBus } from './shared/event-bus';
 * 
 * const eventBus = new NoOpEventBus();
 * const handler = new RegisterUserHandler(eventBus);
 * 
 * const result = await handler.execute({
 *   email: 'user@example.com',
 *   role: UserRole.LEARNER,
 *   targetLanguage: LanguageCode.DE
 * });
 * 
 * console.log('User registered:', result.userId);
 */

// This is a documentation file only - not meant to be executed
// Đây chỉ là file tài liệu - không được thiết kế để thực thi

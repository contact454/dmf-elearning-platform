import { UserId, UserRole, LanguageCode, DomainEvent } from '@dmf/shared';
import { EventBus } from '../../shared/event-bus';
import placementSchema from '../../../contracts/commands/onboarding/registerUser.input.schema.json' assert { type: 'json' };
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: false });
const validateInput = ajv.compile(placementSchema);

/**
 * RegisterUserInput
 * Input for user registration command
 * Đầu vào cho lệnh đăng ký người dùng
 */
export interface RegisterUserInput {
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    targetLanguage?: LanguageCode;
}

/**
 * RegisterUserOutput
 * Output from user registration command
 * Đầu ra từ lệnh đăng ký người dùng
 */
export interface RegisterUserOutput {
    userId: UserId;
    email: string;
    role: UserRole;
    createdAt: string; // ISO 8601
}

/**
 * RegisterUserHandler
 * Handler for user registration command
 * Bộ xử lý lệnh đăng ký người dùng
 */
export class RegisterUserHandler {
    constructor(private readonly eventBus: EventBus) {}

    /**
     * Execute user registration command
     * Thực thi lệnh đăng ký người dùng
     */
    async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
        // Validate input against JSON schema / Kiểm tra dữ liệu đầu vào
        const valid = validateInput(input);
        if (!valid) {
            throw new Error('Invalid input: ' + ajv.errorsText(validateInput.errors));
        }
        // TODO: Check if user already exists
        // TODO: Kiểm tra người dùng đã tồn tại chưa

        // TODO: Create user in database
        // TODO: Tạo người dùng trong cơ sở dữ liệu
        const userId: UserId = 'generated-user-id'; // Placeholder
        const createdAt = new Date().toISOString();

        // Emit domain event / Phát domain event
        const event: DomainEvent<'system.user.registered', { userId: UserId; targetLanguage?: LanguageCode }> = {
            event_name: 'system.user.registered',
            timestamp: createdAt,
            user_id: userId,
            payload: {
                userId,
                targetLanguage: input.targetLanguage,
            },
        };

        await this.eventBus.emit(event, { idempotencyKey: input.email });

        return {
            userId,
            email: input.email,
            role: input.role,
            createdAt,
        };
    }
}

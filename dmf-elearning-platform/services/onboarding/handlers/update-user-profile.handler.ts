import { UserId, LanguageCode } from '@dmf/shared';
import { DomainEvent } from '@dmf/shared';
import { EventBus } from '../../shared/event-bus';
import inputSchema from '../../../contracts/commands/onboarding/updateUserProfile.input.schema.json' assert { type: 'json' };
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: false });
const validateInput = ajv.compile(inputSchema);

/**
 * UpdateUserProfileInput
 * Input for user profile update command
 * Đầu vào cho lệnh cập nhật hồ sơ người dùng
 */
export interface UpdateUserProfileInput {
    userId: UserId; // From context / Từ ngữ cảnh
    firstName?: string;
    lastName?: string;
    targetLanguage?: LanguageCode;
}

/**
 * UpdateUserProfileOutput
 * Output from user profile update
 * Đầu ra từ lệnh cập nhật hồ sơ người dùng
 */
export interface UpdateUserProfileOutput {
    userId: UserId;
    updatedFields: string[]; // List of updated fields / Danh sách các trường đã cập nhật
}

/**
 * UpdateUserProfileHandler
 * Handler for user profile update command
 * Bộ xử lý lệnh cập nhật hồ sơ người dùng
 */
export class UpdateUserProfileHandler {
    constructor(private readonly eventBus: EventBus) {}

    /**
     * Execute user profile update command
     * Thực thi lệnh cập nhật hồ sơ người dùng
     */
    async execute(input: UpdateUserProfileInput): Promise<UpdateUserProfileOutput> {
        const valid = validateInput(input);
        if (!valid) {
            throw new Error('Invalid input: ' + ajv.errorsText(validateInput.errors));
        }
        // TODO: Update user in database
        // TODO: Cập nhật người dùng trong cơ sở dữ liệu

        const updatedFields: string[] = [];
        if (input.firstName !== undefined) updatedFields.push('firstName');
        if (input.lastName !== undefined) updatedFields.push('lastName');
        if (input.targetLanguage !== undefined) updatedFields.push('targetLanguage');

        const timestamp = new Date().toISOString();

        // Emit domain event / Phát domain event
        const event: DomainEvent<'system.profile.updated', { userId: UserId }> = {
            event_name: 'system.profile.updated',
            timestamp,
            user_id: input.userId,
            payload: {
                userId: input.userId,
            },
        };

        await this.eventBus.emit(event, {
            idempotencyKey: input.userId,
            correlationId: input.userId,
        });

        return {
            userId: input.userId,
            updatedFields,
        };
    }
}

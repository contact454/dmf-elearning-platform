import { UserId } from '../ids';
import { LanguageCode } from '../enums';
import { DomainEvent } from './envelope';

/**
 * System/User Domain Event Payloads
 */

export interface UserRegisteredPayload {
    userId: UserId;
    targetLanguage?: LanguageCode;
}

export interface UserLoginPayload {
    userId: UserId;
}

export interface ProfileUpdatedPayload {
    userId: UserId;
}

/**
 * System Domain Events
 */
export type SystemEvent =
    | DomainEvent<'system.user.registered', UserRegisteredPayload>
    | DomainEvent<'system.user.login', UserLoginPayload>
    | DomainEvent<'system.profile.updated', ProfileUpdatedPayload>;

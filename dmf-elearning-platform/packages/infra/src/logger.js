/**
 * Logger interface (Giao diện Ghi log)
 *
 * This interface enforces PII redaction (no email, no tokens, no raw answers).
 * All log methods accept IDs only.
 */
/**
 * Log level (Mức độ log)
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (LogLevel = {}));
//# sourceMappingURL=logger.js.map
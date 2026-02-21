# Feature Flags

## Overview
Feature flags allow enabling or disabling features at runtime without redeployment. This system supports per-environment configuration for gradual rollouts.

## Schema
Feature flag definitions follow the JSON Schema in `flags.schema.json`. Each flag is a boolean property within the `features` object.

## Default Configuration
See `flags.default.json` for the default flag values. All new flags should default to `false` (disabled).

## Current Flags
| Flag | Default | Description |
|------|---------|-------------|
| `new_dashboard` | `false` | New redesigned learner dashboard |
| `ai_tutor` | `false` | AI-powered tutoring assistant |

## Adding a New Feature Flag

1. Add the flag to `flags.default.json`:
   ```json
   {
     "features": {
       "your_new_flag": false
     }
   }
   ```

2. Reference the flag in your service code:
   ```typescript
   import flags from '@configs/feature-flags/flags.default.json';

   if (flags.features.your_new_flag) {
     // New feature code
   } else {
     // Existing behavior
   }
   ```

3. To enable per-environment, create environment-specific override files:
   - `flags.staging.json` - Override flags for staging
   - `flags.production.json` - Override flags for production

## Rollout Strategy
1. Add new flag with `false` default
2. Enable on local development for testing
3. Enable on staging for QA validation
4. Enable on production (gradual rollout if applicable)
5. Once fully rolled out, remove the flag and dead code

## Future Improvements
- Runtime flag toggling via admin API
- Percentage-based rollouts (e.g., enable for 10% of users)
- User-segment targeting (e.g., beta testers only)
- Flag analytics and usage tracking

# Layered Architecture Overview

The DMF E-Learning Platform strictly follows a layered architecture to ensure Separation of Concerns (SoC) and maintainability.

## High-Level Layers

### L1: Infrastructure (`infra/`)
Base layer handling deployment, storage, media processing, and physical security. This layer is unaware of business rules.

### L2/L3: Applications (`apps/`)
Presentation layer. Contains web and mobile clients.
*   **Role**: Consumes services via contracts.
*   **Rule**: NO business logic. Only UI state and display logic.

### L4: Services (`services/`)
Core domain logic. Implementation of business capabilities.
*   **Role**: Exposes APIs via Gateway. Manages specific domains (User, Curriculum, etc.).
*   **Rule**: Services own their data. No direct DB access across service boundaries.

### L5: Education Engine (`education/`)
Detailed pedagogy logic.
*   **Role**: Handles learning standards (CEFR), rubric evaluation, and curriculum progression rules.
*   **Rule**: Pure logic layer, often invoked by Services to validate or process educational data.

### L6: AI Layer (`ai/`)
Intelligence and automation.
*   **Role**: Provides probabilistic services (recommendations, grading assistance) to L4/L5.
*   **Rule**: Helper role. Does not make final decisions on user progress without L4/L5 confirmation.

### L7: Observability (`observability/`)
Cross-cutting layer for monitoring, logging, and audit trails.

## Shared Data & Contracts
*   **`data/`**: Centralized definitions for schemas and migration logic (though physical data is owned by services).
*   **`contracts/`**: The "Law" of the system. API specs (OpenAPI), Event definitions (AsyncAPI/JSON Schema), and shared Data types.
*   **`packages/`**: Shared stateless code (Types, Utils) to prevent code duplication.

## Dependency Rule
Dependencies points inwards or downwards.
`Apps` -> `Services` -> `Education` / `AI` -> `contracts` / `packages`
L1 (Infra) supports all.

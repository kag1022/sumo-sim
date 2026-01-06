---
description: # Workflow: Feature Implementation (Chain of Thought & Reflection)This workflow ensures high-quality code generation through iterative self-correction.
---

## Step 1: Requirement Analysis & Decomposition
**Agent Action**:
- Read the user's feature request (e.g., "Create a double-jump mechanic").
- Break it down into technical sub-tasks:
  1. Input detection logic.
  2. Physics application.
  3. Animation state handling.
  4. Audio/VFX triggering.
  5. Exposed parameters for designers (jump force, count).

## Step 2: Implementation (Drafting)
**Agent Action**:
- Generate the initial code based on the decomposed tasks.
- Create/Update script files.
- **Constraint**: Focus on functionality first.

## Step 3: Reflection (Self-Review)
**Agent Action**:
- Act as a "Code Reviewer". Critique the generated code against the [Coding Standards].
- Checklist:
  - Is `Update` loop optimized?
  - Are inputs hardcoded? (Should use Input System).
  - Are variables serialized properly for the Inspector?
  - Is there null checking for components (Rigidbody/CharacterController)?

## Step 4: Refinement & Final Output
**Agent Action**:
- Rewrite the code based on the critique from Step 3.
- Output the final files.
- Generate a summary of changes and instructions for setting up in the Editor (e.g., "Attach script to Player, assign Jump SFX").


パターンB: 複雑なシステム設計フロー (Orchestrator-Workers)
レベルデザインや大規模なシステム構築など、複数の専門知識が必要な場合に使用します。
# Workflow: Complex System Architecture (Orchestrator-Workers)

Use this for large tasks like "Build an Inventory System" or "Create an Enemy AI Manager".

## Step 1: Orchestrator (Lead Architect)
**Agent Role**: System Architect
**Action**:
- Receive the high-level goal.
- Define the architecture and interfaces.
- Create a `JSON` task list for worker agents.
- Example Task List for Inventory:
  - Worker A: Data Structure (ScriptableObjects for items).
  - Worker B: UI Manager (Grid layout, drag-and-drop).
  - Worker C: Interaction Logic (Pickup, Drop, Use).

## Step 2: Workers (Parallel Execution)
**Agent Role**: Specialist Developers
**Action**:
- **Worker A** implements the Item Database and Data classes.
- **Worker B** implements the Inventory UI view logic.
- **Worker C** implements the backend logic connecting Data and UI.
- *Note*: Each worker must strictly follow the interfaces defined by the Orchestrator.

## Step 3: Integrator (Synthesizer)
**Agent Role**: Tech Lead
**Action**:
- Collect outputs from all workers.
- Write the "Glue Code" (Managers/Controllers) to connect components.
- Check for interface mismatches.
- Validate that the combined system meets the original requirements.

## Step 4: Final Validation
**Action**:
- Generate Unit Tests (EditMode/PlayMode) for the new system.
- Ensure no circular dependencies were introduced.
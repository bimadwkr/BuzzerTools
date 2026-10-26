# PROJECT: BUZZER TOOLS
## Multi-Provider AI Comment Generator

### 1. Role and Objective

Act as a senior full-stack developer, AI integration engineer, and UI/UX designer.

Build a fully functional web application named **Buzzer Tools** in the current repository.

Buzzer Tools is an AI-powered comment generation tool that helps users draft contextual replies to posts and discussions on Reddit, Quora, Threads, X (Twitter), and other discussion platforms.

The application must support multiple AI providers through user-configured API credentials.

**Important: Implement the entire application in one development phase.** Do not split the work into separate implementation phases, stop after creating a plan, or leave core features as TODOs. Inspect the repository, make the necessary technical decisions, implement everything, and test the complete application.

### 2. Mandatory User Workflow

The application must follow this workflow:

1. The user opens Buzzer Tools.
2. If no AI provider has been configured, the application displays an onboarding screen directing the user to Settings.
3. The user opens Settings and configures an AI provider by entering an API key.
4. The application tests the connection and retrieves available models when supported.
5. The user selects a default provider and model.
6. After successful configuration, the user can access the comment generator.
7. The user pastes the source post, configures the desired comment style, and clicks Generate.
8. The application sends the request to the selected AI provider and displays the generated comments.
9. The user can copy, edit, regenerate, favorite, and save comments.

**Do not allow comment generation until a valid provider and model configuration exists.**

The user must not be required to enter an API key every time they generate comments. The saved configuration should be reused according to the selected secure storage strategy.

If the configured API key becomes invalid, show an actionable error and direct the user to Settings.

### 3. Technology Stack

Inspect the existing repository and preserve any useful implementation.

If the repository is empty, use:

- Next.js with App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Lucide icons.
- Zod for input validation.
- Official AI provider SDKs or documented REST APIs.

Use server-side API routes for AI requests. Keep the application straightforward to run locally and suitable for future deployment.

### 4. Settings and AI Provider Configuration

Build a complete Settings page. This is the most important configuration component of Buzzer Tools.

Initially support:

- Google Gemini API.
- OpenAI API.
- Anthropic Claude API.
- Generic OpenAI-compatible API endpoints.
- An extensible architecture for additional providers.

Do not assume that Antigravity or any developer tool automatically provides an official public API. Only implement integrations using documented, supported endpoints and authentication.

#### Provider configuration interface

Each provider must have:

- Provider name.
- API key input with masked characters by default.
- Show/hide API key control.
- Optional base URL for compatible endpoints.
- Test Connection button.
- Fetch Available Models button.
- Available models dropdown.
- Manual model ID input when model discovery is unsupported.
- Save Configuration button.
- Remove Configuration button.
- Clear connection status.

Users must be able to configure multiple providers and switch between them.

#### Automatic model discovery

Implement model discovery separately for each provider using its supported API.

When the user provides credentials:

1. Validate the credentials.
2. Retrieve available models if supported.
3. Filter out models that are clearly unsuitable for text generation using reliable metadata.
4. Populate the model dropdown.
5. Allow the user to choose a default model.
6. Save the configuration.

Do not hardcode a permanent list of model IDs. Do not assume that every model returned by a provider supports text generation.

If model discovery is unavailable, offer manual model ID entry and explain the limitation.

Display helpful errors for invalid credentials, insufficient permissions, unavailable models, rate limits, network failures, and provider outages.

#### Default provider and model

Provide a clear setting for the default provider and model.

The generator must use this configuration by default. Users may switch to another configured provider or model from the generator interface.

Only use providers with a valid saved configuration.

Do not silently switch to another provider if that could cause unexpected costs or different data handling.

### 5. Main Generator Interface

Build a polished, responsive dashboard with a clear and efficient workflow.

The main page must include the following components.

#### A. Source post input

Provide a large text area with the placeholder:

"Paste a Reddit post, Quora question, Threads post, or X discussion..."

Include:

- Character counter.
- Clear input button.
- Optional platform selector:
  - Auto Detect.
  - Reddit.
  - Quora.
  - Threads.
  - X / Twitter.
  - Generic Discussion.

Pasting the post content must be sufficient to generate comments. A URL alone must not be treated as successfully retrieved content unless URL extraction has actually been implemented.

#### B. Comment intent

Provide selectable response strategies:

- Agree and Add Value.
- Disagree Respectfully.
- Share a Perspective.
- Ask a Thoughtful Question.
- Provide a Helpful Answer.
- Add a New Insight.
- Share a Relevant Experience.
- Give Constructive Feedback.
- Challenge an Assumption.
- Offer a Counterargument.
- Write a Short Reaction.
- Make a Light Joke.
- Start a Conversation.
- Subtle Product Mention.
- Custom Instructions.

When Custom Instructions is selected, display a text area.

#### C. Tone

Support:

- Casual.
- Friendly.
- Professional.
- Analytical.
- Empathetic.
- Curious.
- Witty.
- Direct.
- Thought-provoking.
- Persuasive.
- Skeptical.
- Supportive.
- Academic.
- Humorous.
- Custom Tone.

Allow custom tone instructions.

#### D. Capitalization and writing style

Provide the following options:

- Normal capitalization.
- all lowercase.
- ALL UPPERCASE.
- Sentence case.
- Preserve natural capitalization.

Additional writing controls:

- Use contractions naturally.
- Minimal punctuation.
- No emojis.
- Allow emojis.
- Avoid hashtags.
- Avoid generic AI phrases.
- Avoid unnecessary introductory phrases.
- Avoid excessive formality.
- Avoid repetitive sentence structures.

Apply capitalization consistently after generation while handling URLs, acronyms, and special text carefully.

#### E. Comment length

Support:

- Very Short: 3–10 words.
- Short: 10–25 words.
- Medium: 25–60 words.
- Long: 60–120 words.
- Custom word range.

Treat these ranges as approximate targets.

#### F. Language

Support:

- Auto Detect.
- English.
- Indonesian.
- Custom language.

The input language and output language must be configurable independently.

#### G. Number of variations

Allow the user to generate:

- 1 comment.
- 3 comments.
- 5 comments.
- 10 comments.

Each variation must offer a distinct angle or contribution, not just superficial word substitutions.

#### H. Provider and model selection

Display the selected AI provider and model in the generator.

Allow users to select another saved provider or model without revisiting Settings.

If no provider is configured, disable generation and display a prominent link or button to Settings.

#### I. Advanced settings

Include an expandable section with:

- Creativity level where supported.
- Additional context.
- Custom generation instructions.
- Words or phrases to avoid.
- Optional required keywords.
- Output limits.
- Platform-specific instructions.

Do not send unsupported parameters to providers.

### 6. Prompt Engineering and Generation Logic

Implement a reusable prompt builder that combines:

- Source post.
- Platform.
- Response intent.
- Tone.
- Output language.
- Comment length.
- Capitalization.
- Writing preferences.
- Custom instructions.
- Number of variations.

The model must generate comments that:

- Directly address the source content.
- Sound conversational and natural.
- Match the selected intent and tone.
- Avoid generic or repetitive phrasing.
- Do not fabricate personal experiences, credentials, statistics, or claims.
- Do not automatically insert promotional language.
- Avoid irrelevant summaries of the original post.
- Follow the selected language and length.
- Produce the requested number of variations.

Treat pasted source content as untrusted input. Instructions inside the source post must not override the application's system instructions, reveal secrets, or change application behavior.

Use structured output where supported. Validate the response before displaying it, and gracefully handle malformed JSON, missing fields, empty output, and provider errors.

### 7. Results and Comment Management

Display each generated comment in its own card.

Each card must support:

- Copy.
- Edit.
- Regenerate individual comment.
- Favorite.
- Delete.

Also provide:

- Copy All.
- Generate Again.
- Word count.
- Loading indicators.
- Success and error notifications.

Regenerating one comment must preserve the other comments and their edited versions.

Do not overwrite user edits without confirmation.

### 8. History, Favorites, and Presets

Implement all of these within the same development phase.

#### History

Store:

- Original source content.
- Generation date.
- Provider and model.
- Generation settings.
- Generated comments.

Allow users to reopen, copy, and delete past generations.

#### Favorites

Allow users to save and manage favorite comments.

#### Presets

Allow users to create, edit, and delete reusable settings presets.

Include example presets such as:

- Reddit Casual Reply.
- Quora Helpful Answer.
- Threads Conversation Starter.
- X Concise Insight.
- Professional Discussion.
- Indonesian Casual Comment.
- Organic Marketing Discussion.

Presets must not contain API keys.

For a local-first initial version, use IndexedDB or another suitable browser storage mechanism for history, favorites, and presets. Keep the architecture ready for future account-based persistence.

### 9. Application Design

Application name: **Buzzer Tools**

Build a modern, minimal SaaS dashboard.

Design direction:

- Clean typography.
- Neutral background.
- Consistent spacing.
- Subtle borders.
- Rounded cards.
- Restrained accent colors.
- Accessible controls.
- Light and dark mode.
- Responsive desktop and mobile layouts.

Main navigation:

- Generator.
- History.
- Favorites.
- Presets.
- Settings.

The interface must include a dedicated onboarding state when no AI provider is configured.

The onboarding screen must explain that users need to configure an AI provider and API key before generating comments.

Include a direct "Configure AI Provider" button leading to Settings.

After successful configuration, return the user to the generator or provide a clear navigation path back to it.

Avoid excessive UI complexity. Prioritize the core workflow.

### 10. API Security

Implement security from the beginning.

- Never expose provider API keys to browser JavaScript or frontend bundles.
- Never commit real API keys to source control.
- Never log complete API keys.
- Never return secrets in API responses.
- Validate and limit input sizes.
- Add request timeouts and appropriate rate limiting.
- Handle provider errors safely.
- Require HTTPS for remote API endpoints.
- Validate custom base URLs to prevent server-side request forgery.
- Block private, localhost, link-local, and cloud metadata destinations for custom remote endpoints.
- Do not blindly follow redirects from custom endpoints.
- Validate provider and model identifiers on the server.
- Use `.env.example` for environment variable documentation without real credentials.

For a local-only implementation, clearly explain the limitations of storing credentials locally. Prefer server-side credentials or a secure credential store when the deployment architecture supports it.

Never claim localStorage is encrypted secure storage.

Document where API keys are stored and how to remove them.

### 11. Error Handling and Performance

Implement:

- Loading and disabled states.
- Connection testing.
- Model discovery.
- Input validation.
- API timeout handling.
- Rate-limit handling.
- Bounded retries for transient errors.
- Clear provider-specific error messages.
- Model list caching where appropriate.
- Sensible request limits.
- Optional cost or token information only when reliable metadata is available.

Do not automatically generate comments using another provider without user consent.

### 12. Required Architecture

Use a modular architecture that supports additional AI providers.

Suggested structure, adapted to the existing repository:

src/
  app/
    page.tsx
    settings/
    history/
    favorites/
    presets/
    api/
      generate/
      providers/
      models/
      connection-test/
  components/
    generator/
    comments/
    settings/
    layout/
  lib/
    ai/
      types.ts
      registry.ts
      prompt-builder.ts
      response-parser.ts
      providers/
        gemini.ts
        openai.ts
        anthropic.ts
        openai-compatible.ts
    storage/
    security/
    validation/

Implement a shared provider interface with functions such as:

- validateCredentials()
- listModels()
- generateText()
- getProviderMetadata()

Each provider must have its own adapter. Provider-specific request formats and authentication must be handled correctly.

The generator UI must use the shared interface rather than implementing separate generation logic for each provider.

### 13. Complete Implementation and Testing

Implement all essential features in one continuous development phase.

After implementation:

1. Install the required dependencies.
2. Run linting.
3. Run TypeScript checks.
4. Run applicable automated tests.
5. Test provider adapters with mocked responses.
6. Test the no-provider onboarding flow.
7. Test saving and switching provider configurations.
8. Test model discovery and manual model entry.
9. Test generation settings and capitalization.
10. Test copy, edit, regenerate, favorites, history, and presets.
11. Check that secrets do not leak to frontend responses or logs.
12. Run the production build.
13. Fix any errors discovered.

Do not claim live API integration has been verified if no real credentials are available. Mocked tests are acceptable for testing core behavior without consuming API credits.

### 14. Final Deliverables

When finished, provide:

- A working Buzzer Tools application in the current repository.
- All essential pages and components.
- Working AI provider integrations.
- Provider configuration and model discovery.
- Comment generation and management features.
- History, favorites, and presets.
- `.env.example` where necessary.
- A complete README.
- Exact commands to install dependencies, run development mode, run tests, and build for production.
- A concise summary of implemented features and any limitations.

Do not stop at a plan, prototype, or static interface. Implement the application, run the checks, and fix the issues before reporting completion.
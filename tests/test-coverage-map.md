# Playwright Test Coverage Map

This document is the source of truth for automated testers (human or AI) when authoring Playwright coverage for Optimal Dashboard V2. Start here to understand what features exist today, which journeys matter most, and the prerequisites or mocks you will need before driving the browser.

## Using This Guide
- Treat every bullet as a candidate test scenario or assertion cluster; expand as individual Playwright tests or steps.
- Keep tests resilient: prefer data-testid hooks where available, otherwise rely on stable copy and role attributes.
- Assume Supabase auth and financial data APIs are backed by test fixtures. If they are unavailable, use Playwright route mocking to return canned payloads that match `lib/chart-data` types.
- Stripe purchases and real AI calls are out of scope for automated runs; mock their network traffic or surface level status indicators instead.

## Environment Notes & Test Data
- Seed a Supabase test user plus sample categories, sources, and transactions so financial views render charts and tables. `sample-transactions.csv` shows the expected shape.
- Provide Playwright with env vars that mimic `.env.local` (Supabase URL/key, mock AI endpoints). Without them, many hooks gate the UI and render "log in" messaging.
- When testing auth or password recovery, run against a disposable Supabase project or intercept the `auth/v1/*` calls to simulate success.
- Credit claims and purchases hit `/api/claim-daily-credits` and Stripe endpoints respectively; intercept to emulate 200/4xx responses.

## Core Smoke Spine (must stay green)
- Launch desktop shell → open Menu Bar → start a financial app window → close it via the window frame.
- Authenticate via Supabase modal (mocked) and confirm the desktop updates the Taskbar welcome text.
- Open Transaction Manager with seeded data → verify summary metrics → paginate and edit a row → persist the update via mock.
- Trigger AI Chat console → confirm provider/model selectors populate → send a mocked response and deduct credits in the UI.

## Feature Coverage

### Desktop Shell & Navigation
- Menu Bar: Apple/system menu opens Desktop Settings, category menus hide desktop-selected app, login button toggles Supabase window when signed out.
- Window Management: launch apps, focus via Taskbar buttons, close through the frame `X`, verify minimized windows re-open and z-index prioritizes the active window.
- Desktop Mode: toggle in Desktop Settings, pick a background app, reload to assert persistence from `desktop-service-store`, ensure selected app is removed from menu lists.
- Taskbar & Theme: confirm Theme switcher flips light/dark tokens across the shell, Taskbar reflects open windows and logged-in email.

### Authentication & Access Control
- Supabase Login: render Auth UI, handle happy path login, surface loading state, and show signed-in card with "Update Password" and "Log Out".
- Access Gates: unauthenticated users opening CSV Parser, Transaction Manager, AI Chat, or Credits Manager should see inline prompts rather than app content.
- Password Reset Route: simulate recovery hash in URL fragment, validate form toggles (show/hide), enforce min length and matching passwords, assert success banner and redirect timer.
- Daily Credit Claim: from Menu Bar button and Credits Manager primary CTA, verify enabled/disabled states (mock remaining cooldown) and success toast.

### Financial Management Suite
- Transaction Manager: summary cards reflect seeded income/expense totals, date filters narrow results, pagination controls update range text, inline edit saves via mocked Supabase update, auto-categorize button shows loading state and triggers reload notice.
- Category Trends: with data, check chart renders, visualization type switcher flips between line/bar/matrix, "Hide All/Show All" toggles dataset visibility, statistics panel tallies categories, fall back to test data when API returns empty.
- Payment Source Balances: tabs swap between balances/utilization, threshold slider updates KPI paydown text, "Use test data" toggle populates chart without Supabase data, API display section lists raw sources, errors/logging do not break layout.

### Data Tools
- CSV Parser: drag-and-drop + file picker populate the selected file state, parse button drives validation output, checklist badges update, upload button disabled until validation passes, delete-all clears state, helper tabs (categories/sources) switch content.
- CSV Combiner: accept up to five files, display list with remove buttons, combine action shows progress bar and success alert, download button enabled after processing while respecting mocked backend.

### AI & Credits
- AI Chat Console: provider dropdown reflects `/api/ai/providers` mock, model select populates per provider, offline banner appears when `providerConnected` is false, history sidebar selects/deletes conversations, voice toggle disables when credits exhausted, send flow appends user + assistant messages.
- Credits Manager: summary section shows total/lifetime/daily messaging, claim button honours cooldown, "Purchase" tab lists packages firing mocked checkout intent, "History" tab renders transaction list with empty state fallback, error/success alerts render conditionally.

### Calculators & System Apps
- Mortgage Calculator: modify home price/down payment/term, toggle taxes & costs checkbox to reveal cost grid, run calculation and confirm results card shows amortization + breakdown, FAQ accordion expands/collapses entries.
- Service App: "Banking" menu transitions into analytics/import subapps and back, "Investment" and "Credit" services load respective standalone analytics, "Voice Assistant" shows disabled placeholder.
- Volume & Clock: volume dropdown slider updates icon and mute state, settings button surfaces placeholder alert, clock ticks in Menu Bar (tolerate time drift by snapshotting format).

### Regression & Stability Checks
- Persisted Stores: reload preserves desktop mode selection and window positions (within reason), ensure `window-store` resets minimized state on restore.
- Network Failures: simulate 500s from financial data endpoints and verify components show friendly error states instead of crashing.
- Accessibility Spot Checks: critical dialogs (login, password reset) expose labels and focus states so keyboard navigation remains viable.

## Out of Scope (Documented for Clarity)
- Real Stripe checkout, webhook handling, and receipt flows remain stub-only until backend is complete.
- Advanced AI analytics, contextual financial prompts, and long-running chat persistence are not yet implemented—limit tests to current UI behaviour.
- Mobile/touch gestures are immature; desktop viewport coverage is the priority for now.
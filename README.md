# Open Scrutiny - Vote Counting App

![Execution Mode](/Users/rromanit/.gemini/antigravity/brain/97fcd9da-4085-46db-8e27-dfa371e4c53b/final_execution_mode_1764543930417.png)

This is a standalone Angular application designed for simple vote counting and real-time visualization of results. It uses Angular Material for the UI and NGX-Charts for displaying vote counts.

## Features

-   **Configuration Mode** (`/config`):
    -   Set election title and description.
    -   Upload a logo (optional).
    -   Define multiple voting items (questions).
    -   For each item, configure voting options (defaults to SI, NO, N/C, but fully customizable).
    -   All configuration is saved to `localStorage` (`vote_app_data`).

-   **Execution Mode** (`/execution`):
    -   Displays election details and logo.
    -   Shows horizontal cards for each voting item with bar charts visualizing the votes.
    -   Provides buttons for each option to cast votes.
    -   Includes manual input fields to set vote counts directly.
    -   A central "Contabilizar Voto" button saves all selected votes simultaneously.
    -   Vote counts are stored separately in `localStorage` (`vote_app_counts`) and persist across sessions.
    -   Charts update in real-time as votes are counted.
    -   Y-axis on charts displays only integer values.

## Tech Stack

-   Angular 21 (Standalone Components)
-   Angular Material
-   NGX-Charts
-   TypeScript
-   LocalStorage for data persistence

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4201/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory.

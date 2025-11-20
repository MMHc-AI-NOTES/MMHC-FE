# MMHC Frontend

A React + TypeScript frontend application built with Vite, featuring modern UI components from Radix UI, styling with Tailwind CSS, and state management with Redux.

## Getting Started

### Prerequisites

- Node.js (see `.nvmrc` for the required version)
- npm

### Installation

```bash
npm install
```

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

Build the application for production:

```bash
npm run build
```

### Preview

Preview the production build locally:

```bash
npm run preview
```

### Linting & Formatting

Lint the codebase:

```bash
npm run lint
```

Format code with Prettier:

```bash
npm run format
```

## Project Structure

- `src/` - Source code
- `public/` - Static assets
- `build/` - Build output
- `.github/workflows/` - CI/CD workflows

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Form Handling**: Formik + Yup
- **Routing**: React Router
- **Code Quality**: ESLint + Prettier + Husky

## Environment Variables

Copy `.env.example` to `.env` and configure as needed.

## License

ISC

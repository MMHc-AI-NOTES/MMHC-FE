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

## Deployment

### S3 + CloudFront Deployment

When deploying to S3 + CloudFront, ensure CloudFront is configured for SPA routing:

1. **Configure Custom Error Responses** in CloudFront:
   - Error Code: `403` → Response Page Path: `/index.html`, Response Code: `200`
   - Error Code: `404` → Response Page Path: `/index.html`, Response Code: `200`

2. **Or use the provided script**:
   ```bash
   python3 scripts/configure-cloudfront-spa.py <distribution-id>
   ```

This ensures that when users hard refresh on any route (e.g., `/dashboard`), CloudFront serves `index.html` instead of a 404 error, allowing React Router to handle the routing client-side.

### Troubleshooting 503 Errors on Hard Refresh

If you're experiencing 503 errors when hard refreshing pages (e.g., errors like `GET /assets/ConfirmationDialog-XXX.js net::ERR_ABORTED 503`):

**Root Cause**: When you hard refresh on a route like `/dashboard`, CloudFront tries to serve `/dashboard` as a file. Since it doesn't exist, CloudFront returns an error, and subsequent asset requests also fail with 503 errors.

**Solution**: Configure CloudFront custom error responses (see above). This will:

- ✅ Fix all 503 errors on asset files (JS chunks, CSS, etc.)
- ✅ Allow hard refresh to work on any route
- ✅ Ensure `index.html` is served for all routes, allowing React Router to handle routing

**Additional Checks** (if errors persist after CloudFront configuration):

1. Verify CloudFront custom error responses are configured (see above)
2. Ensure all assets are properly uploaded to S3
3. Check CloudFront cache invalidation status
4. Verify S3 bucket permissions allow public read access to assets
5. Wait 15-20 minutes for CloudFront changes to propagate

## License

ISC

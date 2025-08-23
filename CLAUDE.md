# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (opens http://localhost:3000)
- `npm run build` - Build production application with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Architecture Overview

This is a Next.js 15.5.0 application using the App Router architecture with:

- **Framework**: Next.js with App Router (src/app/ directory structure)
- **TypeScript**: Strict TypeScript configuration with path mapping (@/* → ./src/*)
- **Styling**: Tailwind CSS v4 with PostCSS integration
- **Fonts**: Geist Sans and Geist Mono fonts from Google Fonts
- **React**: Version 19.1.0

### Project Structure

- `src/app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with font configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global CSS with Tailwind imports
- `src/components/` - Reusable React components (currently empty)
- `src/lib/` - Utility functions and shared logic (currently empty)

### Key Configuration Files

- `next.config.ts` - Next.js configuration (minimal default setup)
- `tsconfig.json` - TypeScript config with strict mode and path aliases
- `eslint.config.mjs` - ESLint with Next.js core-web-vitals and TypeScript rules
- `postcss.config.mjs` - PostCSS configured for Tailwind CSS v4
- `package.json` - Uses Turbopack for faster builds and development



This is a fresh Next.js project created with create-next-app, so most directories (components, lib) are empty and ready for development.
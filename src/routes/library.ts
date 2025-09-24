import { createFileRoute } from '@tanstack/react-router';
import { LibraryPage } from '../pages/library';

export const Route = createFileRoute('/library' as any)({
  component: LibraryPage,
});

export const libraryRoute = Route;
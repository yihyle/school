import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CoursesClient from './CoursesClient';

export default function CoursesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CoursesClient />
    </Suspense>
  );
}

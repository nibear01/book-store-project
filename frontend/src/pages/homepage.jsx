import { memo, lazy, Suspense } from "react";

// Code-split homepage sections to avoid loading everything upfront.
// Each chunk loads when HomePage mounts, reducing initial bundle size.
const Hero = lazy(() => import("@/components/homeComponents/Hero"));
const Category = lazy(() => import("@/components/homeComponents/category"));
const Feature = lazy(() => import("@/components/homeComponents/Feature"));
const Deals = lazy(() => import("@/components/homeComponents/Deals"));
const NewReleases = lazy(() => import("@/components/homeComponents/NewReleases"));
const Join = lazy(() => import("@/components/homeComponents/Join"));

// Lightweight skeletons for each section
const HeroSkeleton = () => (
  <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10 animate-[shimmer_2s_infinite]" />
  </div>
);

const CategorySkeleton = () => (
  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-28 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
    ))}
  </div>
);

const FeatureSkeleton = () => (
  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
    ))}
  </div>
);

const DealsSkeleton = () => (
  <div className="mt-6 flex gap-4 overflow-hidden">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="w-40 sm:w-48 h-56 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
    ))}
  </div>
);

const ReleasesSkeleton = () => (
  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="h-44 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
    ))}
  </div>
);

const JoinSkeleton = () => (
  <div className="mt-8 h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
);

const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      <Suspense fallback={<HeroSkeleton />}>
        <Hero fullWidth={false} />
      </Suspense>
      <Suspense fallback={<CategorySkeleton />}>
        <Category />
      </Suspense>
      <Suspense fallback={<FeatureSkeleton />}>
        <Feature />
      </Suspense>
      <Suspense fallback={<DealsSkeleton />}>
        <Deals />
      </Suspense>
      <Suspense fallback={<ReleasesSkeleton />}>
        <NewReleases />
      </Suspense>
      <Suspense fallback={<JoinSkeleton />}>
        <Join />
      </Suspense>
    </div>
  );
};

export default memo(HomePage);

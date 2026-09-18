export default function Loading() {
  return (
    <div className="min-h-screen font-sans selection:bg-red-600/20 selection:text-black overflow-x-hidden bg-white">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-white/90 border-b-2 border-brand-black px-4 py-4 md:py-6 flex justify-between items-center">
        <div className="w-10 h-10 bg-zinc-200 animate-pulse rounded-full hidden md:block"></div>
        <div className="w-48 h-10 bg-zinc-200 animate-pulse mx-auto md:mx-0"></div>
        <div className="w-10 h-10 bg-zinc-200 animate-pulse rounded-full hidden md:block"></div>
      </div>
      
      {/* Date/Nav Bar Skeleton */}
      <div className="w-full h-12 bg-zinc-100 border-b border-zinc-200 animate-pulse"></div>

      <main className="relative overflow-hidden bg-white text-black pb-20 lg:pb-0 pt-8" role="main">
        {/* Ad Skeleton */}
        <div className="w-full max-w-4xl h-22.5 mx-auto bg-zinc-100 animate-pulse mb-8 border border-zinc-200"></div>

        <div className="max-w-[1600px] mx-auto border-x border-zinc-200">
          
          {/* Hero Skeleton */}
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-0 border-b-2 border-zinc-100 min-h-[60vh]">
            <div className="lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
              <div className="w-24 h-4 bg-zinc-200 animate-pulse mb-4"></div>
              <div className="w-full h-10 lg:h-16 bg-zinc-200 animate-pulse mb-3"></div>
              <div className="w-4/5 h-10 lg:h-16 bg-zinc-200 animate-pulse mb-6"></div>
              <div className="w-2/3 h-4 bg-zinc-200 animate-pulse mb-2"></div>
              <div className="w-1/2 h-4 bg-zinc-200 animate-pulse"></div>
            </div>
            <div className="lg:col-span-5 bg-zinc-200 animate-pulse min-h-[30vh]"></div>
          </div>

          {/* Grid Skeleton */}
          <div className="px-4 md:px-6 pt-12">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-3/4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <div className="aspect-4/3 bg-zinc-200 animate-pulse rounded-sm"></div>
                      <div className="w-16 h-3 bg-zinc-200 animate-pulse"></div>
                      <div className="w-full h-5 bg-zinc-200 animate-pulse"></div>
                      <div className="w-4/5 h-5 bg-zinc-200 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Skeleton */}
              <div className="lg:w-1/4 hidden lg:block">
                <div className="w-full h-62.5 bg-zinc-100 animate-pulse border border-zinc-200 mb-8"></div>
                <div className="w-32 h-6 bg-zinc-200 animate-pulse mb-6"></div>
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 bg-zinc-200 animate-pulse rounded-full shrink-0"></div>
                      <div className="space-y-2 w-full">
                        <div className="w-full h-4 bg-zinc-200 animate-pulse"></div>
                        <div className="w-2/3 h-4 bg-zinc-200 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function NoteLoading() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-3" />
                <Skeleton className="h-4 w-24" />
            </div>

            {/* Note header skeleton */}
            <div className="space-y-1">
                <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-2/3" />
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                </div>
                <div className="flex items-start justify-between gap-4">
                    <Skeleton className="h-6 w-1/3 mt-1" />
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </div>

            {/* Editor skeleton */}
            <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-7 w-28" />
                </div>
                <div className="border border-border rounded-md">
                    {/* Toolbar skeleton */}
                    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border">
                        {Array.from({ length: 18 }).map((_, i) => (
                            <Skeleton key={i} className="h-8 w-8" />
                        ))}
                    </div>
                    {/* Content skeleton */}
                    <div className="px-4 py-3 space-y-3 min-h-[400px]">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="pt-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            </div>
        </div>
    );
}

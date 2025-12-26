import { getExploreFilterOptions, getExploreNotesWithSchoolFilter } from "@/app/actions";
import { ExploreContent } from "./components/ExploreContent";

interface SearchParams {
    q?: string;
    page?: string;
    schools?: string;
    classes?: string;
    teachers?: string;
    view?: string;
}

export default async function ExplorePage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;

    // Parse filters from URL
    const search = params.q || "";
    const page = parseInt(params.page || "1", 10);
    const schools = params.schools?.split(",").filter(Boolean) || [];
    const classes = params.classes?.split(",").filter(Boolean) || [];
    const teachers = params.teachers?.split(",").filter(Boolean) || [];
    const view = (params.view as "grid" | "list") || "grid";

    // Fetch filter options and notes in parallel
    const [filterOptions, notesResult] = await Promise.all([
        getExploreFilterOptions(),
        getExploreNotesWithSchoolFilter({
            search,
            schools: schools.length > 0 ? schools : undefined,
            classes: classes.length > 0 ? classes : undefined,
            teachers: teachers.length > 0 ? teachers : undefined,
            page,
            limit: 18,
        }),
    ]);

    return (
        <div className="min-h-screen bg-[#1a1b26] pt-24 pb-12">
            <div className="container px-4 md:px-6 mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Explore Public Notes
                    </h1>
                    <p className="text-lg text-[#a9b1d6] max-w-2xl mx-auto">
                        Discover study notes shared by the community. Filter by school, class, or teacher.
                    </p>
                </div>

                {/* Content with Filters */}
                <ExploreContent
                    notes={notesResult.notes}
                    totalCount={notesResult.totalCount}
                    currentPage={notesResult.page}
                    totalPages={notesResult.totalPages}
                    filterOptions={filterOptions}
                    initialFilters={{
                        search,
                        schools,
                        classes,
                        teachers,
                        view,
                    }}
                />
            </div>
        </div>
    );
}

export const metadata = {
    title: "Explore Public Notes - Law Maxxing",
    description: "Discover and learn from study notes shared by the community. Filter by school, class, or teacher.",
};

import { notFound } from "next/navigation";
import { getProfileByUsername, getAllUserPublicNotes, getUserPublicNotesCount, getUserPublicFolders } from "@/app/actions";
import { User, GraduationCap, FileText } from "lucide-react";
import { ProfileContent } from "./components/ProfileContent";

interface PageProps {
    params: Promise<{ username: string }>;
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function UserProfilePage({ params, searchParams }: PageProps) {
    const { username } = await params;
    await searchParams; // Await to satisfy Next.js requirement

    const profile = await getProfileByUsername(username);

    if (!profile) {
        notFound();
    }

    const [notes, totalCount, folders] = await Promise.all([
        getAllUserPublicNotes(profile.id),
        getUserPublicNotesCount(profile.id),
        getUserPublicFolders(profile.id)
    ]);

    const displayName = profile.display_name || profile.username || "Anonymous";

    return (
        <div className="min-h-screen bg-[#1a1b26] pt-24 pb-12">
            <div className="container px-4 md:px-6 mx-auto">
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-6">
                    {/* Avatar */}
                    {profile.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={displayName}
                            className="w-14 h-14 rounded-full object-cover border-2 border-[#7aa2f7]/30 shrink-0"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-[#7aa2f7]/20 flex items-center justify-center border-2 border-[#7aa2f7]/30 shrink-0">
                            <User className="w-7 h-7 text-[#7aa2f7]" />
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-white">
                                {displayName}
                            </h1>
                            <span className="text-[#a9b1d6]">@{profile.username}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                            {profile.school && (
                                <div className="flex items-center gap-1.5 text-[#a9b1d6]">
                                    <GraduationCap className="w-4 h-4 text-[#7aa2f7]" />
                                    <span>{profile.school}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-[#565f89]">
                                <FileText className="w-4 h-4" />
                                <span>{totalCount} public {totalCount === 1 ? "note" : "notes"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes Section with Filters */}
                <ProfileContent
                    notes={notes}
                    folders={folders}
                    totalCount={totalCount}
                    username={username}
                />
            </div>
        </div>
    );
}

export async function generateMetadata({ params }: PageProps) {
    const { username } = await params;
    const profile = await getProfileByUsername(username);

    if (!profile) {
        return {
            title: "User Not Found",
        };
    }

    const displayName = profile.display_name || profile.username || "User";

    return {
        title: `${displayName} - Law Maxxing`,
        description: profile.school
            ? `View ${displayName}'s public study notes from ${profile.school}`
            : `View ${displayName}'s public study notes`,
    };
}

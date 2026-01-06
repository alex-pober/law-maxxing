import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Check if profile is already complete - if so, redirect to dashboard
    const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, username")
        .eq("id", user.id)
        .single();

    const isProfileComplete = profile?.display_name
        && profile.display_name !== 'Anonymous'
        && profile?.username;

    if (isProfileComplete) {
        return redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
            {children}
        </div>
    );
}

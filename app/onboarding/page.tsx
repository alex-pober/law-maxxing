import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Get existing profile data (may have some fields from OAuth)
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome to Law Maxxing
                </h1>
                <p className="text-muted-foreground">
                    Let&apos;s set up your profile to get started
                </p>
            </div>

            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <OnboardingForm
                    userId={user.id}
                    initialData={{
                        display_name: (profile?.display_name && profile.display_name !== 'Anonymous')
                            ? profile.display_name
                            : user.user_metadata?.full_name || user.user_metadata?.name || "",
                        username: profile?.username || "",
                        school: profile?.school || "",
                        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || "",
                    }}
                />
            </div>
        </div>
    );
}

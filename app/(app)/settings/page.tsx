import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { DeleteAccountSection } from "@/components/settings/DeleteAccountSection";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user's profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // If no profile exists, create one
    const userProfile = profile || {
        id: user.id,
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        username: "",
        avatar_url: user.user_metadata?.avatar_url || "",
        school: "",
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account and profile settings
                </p>
            </div>

            <div className="space-y-8">
                {/* Profile Section */}
                <section className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <h2 className="text-xl font-semibold text-white mb-1">Profile</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        This information will be displayed on your public notes
                    </p>
                    <ProfileSettingsForm
                        userId={user.id}
                        initialProfile={userProfile}
                        userEmail={user.email || ""}
                    />
                </section>

                {/* Account Section */}
                <section className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <h2 className="text-xl font-semibold text-white mb-1">Account</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Your account information
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p className="text-white mt-1">{user.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">User ID</label>
                            <p className="text-xs text-muted-foreground/70 mt-1 font-mono">{user.id}</p>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="p-6 rounded-xl bg-red-500/[0.02] border border-red-500/20">
                    <h2 className="text-xl font-semibold text-red-400 mb-1">Danger Zone</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Irreversible and destructive actions
                    </p>
                    <DeleteAccountSection />
                </section>
            </div>
        </div>
    );
}

import { AppLayout } from "@/components/layout/AppLayout";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Filter by user_id to only show the current user's notes and folders
    // (RLS allows reading public notes too, but we only want user's own data in the app)
    const { data: notes } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('position');
    const { data: folders } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('position');

    return (
        <AppLayout notes={notes || []} folders={folders || []} userEmail={user.email}>
            {children}
        </AppLayout>
    );
}

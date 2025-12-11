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

    const { data: notes } = await supabase.from('notes').select('*').order('position');
    const { data: folders } = await supabase.from('folders').select('*').order('position');

    return (
        <AppLayout notes={notes || []} folders={folders || []} user={user}>
            {children}
        </AppLayout>
    );
}

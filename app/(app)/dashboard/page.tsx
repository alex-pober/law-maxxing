import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: notes } = await supabase.from('notes').select('*').order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Recent Notes</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes?.slice(0, 6).map((note) => (
                    <Card key={note.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">{note.title}</CardTitle>
                            <CardDescription>{note.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {note.content_markdown}
                            </p>
                        </CardContent>
                    </Card>
                ))}
                {(!notes || notes.length === 0) && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No notes found. Use the explorer to create one!
                    </div>
                )}
            </div>
        </div>
    );
}

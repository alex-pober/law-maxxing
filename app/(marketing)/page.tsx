import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Brain, Zap } from "lucide-react";

export default function LandingPage() {
    return (
        <>
            <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                                Master Your Law Notes with Active Recall
                            </h1>
                            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                                The ultimate tool for law students. Transform your notes into powerful memory aids using our unique "Memorize Mode".
                            </p>
                        </div>
                        <div className="space-x-4">
                            <Button asChild size="lg">
                                <Link href="/login">
                                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
            <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="p-4 bg-white dark:bg-gray-900 rounded-full">
                                <Brain className="h-10 w-10 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold">Active Recall</h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Test your knowledge by hiding words and reconstructing sentences from memory.
                            </p>
                        </div>
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="p-4 bg-white dark:bg-gray-900 rounded-full">
                                <Zap className="h-10 w-10 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold">Fast & Efficient</h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Built for speed. Navigate through your cases and statutes instantly.
                            </p>
                        </div>
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="p-4 bg-white dark:bg-gray-900 rounded-full">
                                <BookOpen className="h-10 w-10 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold">Organized Library</h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Keep all your lecture notes, case briefs, and summaries in one structured place.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
                <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Law Maxxing. All rights reserved.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-xs hover:underline underline-offset-4" href="#">
                        Terms of Service
                    </Link>
                    <Link className="text-xs hover:underline underline-offset-4" href="#">
                        Privacy
                    </Link>
                </nav>
            </footer>
        </>
    );
}

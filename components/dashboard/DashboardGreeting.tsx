'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const greetings = {
    morning: [
        "Good morning! Ready to conquer some case law?",
        "Rise and shine! Time to hit the books.",
        "Morning! Let's make today productive.",
        "Good morning! Fresh mind, fresh start.",
    ],
    afternoon: [
        "Good afternoon! Keep up the great work.",
        "Afternoon! How's the studying going?",
        "Good afternoon! Stay focused, you've got this.",
        "Afternoon session! Let's dive in.",
    ],
    evening: [
        "Good evening! Burning the midnight oil?",
        "Evening! Great time for some focused study.",
        "Good evening! Wrapping up for the day?",
        "Evening study session! You're dedicated.",
    ],
    night: [
        "Working late? Don't forget to rest!",
        "Night owl! Remember to take breaks.",
        "Late night session! Stay sharp.",
        "Burning the midnight oil? You've got this.",
    ],
};

function getTimeOfDay(hour: number): keyof typeof greetings {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
}

function getRandomGreeting(hour: number): string {
    const timeOfDay = getTimeOfDay(hour);
    const greetingOptions = greetings[timeOfDay];
    return greetingOptions[Math.floor(Math.random() * greetingOptions.length)];
}

export function DashboardGreeting() {
    const [currentTime, setCurrentTime] = useState(() => new Date());
    // Use lazy initializer - runs once on mount, same value for SSR placeholder
    const [greeting] = useState(() => getRandomGreeting(new Date().getHours()));

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-1">
            <div className="flex items-baseline gap-4">
                <h1
                    suppressHydrationWarning
                    className={cn(
                        "text-4xl font-bold tracking-tight",
                        "bg-linear-to-r from-white via-white to-white/70 bg-clip-text text-transparent"
                    )}
                >
                    {formatTime(currentTime)}
                </h1>
                <span suppressHydrationWarning className="text-muted-foreground/70 text-sm font-medium">
                    {formatDate(currentTime)}
                </span>
            </div>

            <p suppressHydrationWarning className="text-lg text-muted-foreground/80 font-light">
                {greeting}
            </p>
        </div>
    );
}

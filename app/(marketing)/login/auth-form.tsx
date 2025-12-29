'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    )
}

export default function AuthForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in')
    const router = useRouter()
    const supabase = createClient()

    const getRedirectUrl = () => {
        // Use environment variable in production, fallback to location.origin
        if (process.env.NEXT_PUBLIC_SITE_URL) {
            return `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        }
        return `${location.origin}/auth/callback`
    }

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true)
        setError(null)
        setSuccess(null)

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getRedirectUrl(),
            },
        })

        if (error) {
            setError(error.message)
            setGoogleLoading(false)
        }
    }

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: getRedirectUrl(),
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSuccess('Check your email for the confirmation link.')
            setLoading(false)
        }
    }

    const switchView = (newView: 'sign-in' | 'sign-up') => {
        setView(newView)
        setError(null)
        setSuccess(null)
    }

    return (
        <Card className="overflow-hidden">
            <div className="grid grid-cols-2 border-b">
                <button
                    type="button"
                    onClick={() => switchView('sign-in')}
                    className={`py-3 text-sm font-medium transition-colors ${
                        view === 'sign-in'
                            ? 'bg-background text-foreground border-b-2 border-primary'
                            : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Sign In
                </button>
                <button
                    type="button"
                    onClick={() => switchView('sign-up')}
                    className={`py-3 text-sm font-medium transition-colors ${
                        view === 'sign-up'
                            ? 'bg-background text-foreground border-b-2 border-primary'
                            : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Sign Up
                </button>
            </div>
            <CardContent className="pt-6 space-y-4">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                >
                    {googleLoading ? (
                        'Connecting...'
                    ) : (
                        <>
                            <GoogleIcon className="h-5 w-5 mr-2" />
                            Continue with Google
                        </>
                    )}
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with email
                        </span>
                    </div>
                </div>

                <form onSubmit={view === 'sign-in' ? handleSignIn : handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder={view === 'sign-up' ? 'Create a password' : 'Enter your password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={view === 'sign-up' ? 6 : undefined}
                        />
                        {view === 'sign-up' && (
                            <p className="text-xs text-muted-foreground">
                                Must be at least 6 characters
                            </p>
                        )}
                    </div>
                    {error && (
                        <div className="text-sm text-red-500 font-medium rounded-md bg-red-50 dark:bg-red-950/50 p-3">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium rounded-md bg-green-50 dark:bg-green-950/50 p-3">
                            {success}
                        </div>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Loading...' : view === 'sign-in' ? 'Sign In' : 'Create Account'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

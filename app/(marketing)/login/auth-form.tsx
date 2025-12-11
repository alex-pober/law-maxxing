'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in')
    const router = useRouter()
    const supabase = createClient()

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

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

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setError('Check your email for the confirmation link.')
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={view === 'sign-in' ? handleSignIn : handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <div className="text-sm text-red-500 font-medium">
                            {error}
                        </div>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Loading...' : view === 'sign-in' ? 'Sign In' : 'Sign Up'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center border-t p-4">
                <Button
                    variant="link"
                    className="text-sm text-muted-foreground"
                    onClick={() => {
                        setView(view === 'sign-in' ? 'sign-up' : 'sign-in')
                        setError(null)
                    }}
                >
                    {view === 'sign-in'
                        ? "Don't have an account? Sign Up"
                        : "Already have an account? Sign In"}
                </Button>
            </CardFooter>
        </Card>
    )
}

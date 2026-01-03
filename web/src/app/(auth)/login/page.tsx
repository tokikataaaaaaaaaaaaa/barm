'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { signInWithEmail, signUpWithEmail, signInWithApple, signInAsGuest, isDevelopment } from '@/lib/firebase/auth'
import { LoadingSpinner } from '@/components/shared/loading-spinner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
      router.push('/')
    } catch (err) {
      console.error('Auth error:', err)
      setError(isSignUp ? 'アカウント作成に失敗しました' : 'ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signInWithApple()
      router.push('/')
    } catch (err) {
      console.error('Apple Sign In error:', err)
      setError('Apple でのログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signInAsGuest()
      router.push('/')
    } catch (err) {
      console.error('Guest Sign In error:', err)
      setError('ゲストログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">BARM</CardTitle>
          <CardDescription>Be A Real Man</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Apple Sign In (production) */}
          <Button
            variant="primary"
            size="lg"
            className="w-full bg-black text-white hover:bg-zinc-800"
            onClick={handleAppleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            )}
            Apple でサインイン
          </Button>

          {/* Development Email Auth */}
          {isDevelopment() && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-300 dark:border-zinc-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                    開発用
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                <Input
                  type="email"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  {isSignUp ? 'アカウント作成' : 'ログイン'}
                </Button>
              </form>

              <button
                type="button"
                className="w-full text-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp
                  ? 'すでにアカウントをお持ちの方'
                  : 'アカウントを作成する'}
              </button>
            </>
          )}

          {error && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-300 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                または
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="lg"
            className="w-full text-zinc-500"
            onClick={handleSkipLogin}
            disabled={isLoading}
          >
            スキップしてお試し
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-xs text-zinc-400">
            続行することで利用規約に同意したことになります
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

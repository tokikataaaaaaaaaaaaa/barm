'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { useUpdateUser } from '@/lib/hooks/use-user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Footer } from '@/components/shared/footer'

const APP_VERSION = '0.1.0'

export default function SettingsPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const updateUser = useUpdateUser()

  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [nickname, setNickname] = useState(user?.displayName ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveNickname = async () => {
    if (!nickname.trim() || !user) return

    setIsSaving(true)
    try {
      await updateUser.mutateAsync({
        userId: user.id,
        data: { displayName: nickname.trim() },
      })
      setIsEditingNickname(false)
    } catch (error) {
      console.error('Failed to update nickname:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.replace('/login')
  }

  const handleDeleteAccount = () => {
    // Placeholder - will be implemented later
    alert('アカウント削除機能は準備中です。support@barm.app までお問い合わせください。')
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-center px-4">
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 p-4 pb-24">
        {/* Profile Section */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 text-2xl font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                {user?.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Nickname
                </p>
                {isEditingNickname ? (
                  <div className="mt-1 flex gap-2">
                    <Input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="h-9"
                      maxLength={20}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveNickname}
                      disabled={isSaving || !nickname.trim()}
                    >
                      {isSaving ? '...' : 'Save'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setNickname(user?.displayName ?? '')
                        setIsEditingNickname(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user?.displayName ?? 'Unknown'}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => setIsEditingNickname(true)}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Notification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notification</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Daily reminder
                </p>
              </div>
              <div className="text-sm text-zinc-400">Upcoming</div>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">App Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-zinc-600 dark:text-zinc-400">Version</p>
              <p className="font-medium">v{APP_VERSION}</p>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
            <Button
              variant="ghost"
              className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
              If you delete your account, all your data including mission progress will be permanently deleted.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

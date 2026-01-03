'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function GroupPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-center px-4">
          <h1 className="text-lg font-bold">Group</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg p-4 pb-24">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Group</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              Join a group to build habits together.
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" disabled>
                Create Group (Coming Soon)
              </Button>
              <Button variant="outline" disabled>
                Join Group (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

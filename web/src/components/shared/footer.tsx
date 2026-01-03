'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

const APP_VERSION = '0.1.0'

interface FooterProps {
  className?: string
  showVersion?: boolean
}

export function Footer({ className, showVersion = true }: FooterProps) {
  return (
    <footer
      className={cn(
        'border-t border-border bg-background py-6',
        className
      )}
    >
      <div className="container-mobile">
        <div className="flex flex-col items-center gap-4">
          {/* Legal links */}
          <div className="flex gap-6 text-body-sm">
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Copyright and version */}
          <div className="flex flex-col items-center gap-1 text-caption text-muted-foreground">
            {showVersion && <p>BARM v{APP_VERSION}</p>}
            <p>&copy; {new Date().getFullYear()} BARM. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Compact footer for pages with bottom nav
export function CompactFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        'py-4 text-center text-caption text-muted-foreground',
        className
      )}
    >
      <div className="flex justify-center gap-4">
        <Link
          href="/terms"
          className="hover:text-foreground transition-colors"
        >
          Terms
        </Link>
        <span>|</span>
        <Link
          href="/privacy"
          className="hover:text-foreground transition-colors"
        >
          Privacy
        </Link>
      </div>
    </footer>
  )
}

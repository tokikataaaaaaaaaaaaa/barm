'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Badge, DotBadge, StatusBadge } from '@/components/ui/badge'
import { Progress, CircularProgress } from '@/components/ui/progress'
import { FeedCard, LiveIndicator } from '@/components/patterns/feed-card'

// Animation variants for staggered reveals
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              currentColor 2px,
              currentColor 4px
            )`,
          }} />
        </div>

        {/* Gradient orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

        <div className="relative container-mobile py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="accent" className="mb-4">Design System</Badge>
            <h1 className="font-display text-6xl md:text-7xl tracking-tight text-foreground mb-4">
              BARM
            </h1>
            <p className="text-body-lg text-muted-foreground max-w-md">
              Be A Real Man. Premium masculine design system for building discipline.
            </p>
          </motion.div>
        </div>
      </section>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container-mobile py-12 space-y-16"
      >
        {/* Colors */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Colors" description="Dark, masculine palette with gold accents" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <ColorSwatch name="Primary" color="bg-primary" textColor="text-primary-foreground" />
            <ColorSwatch name="Secondary" color="bg-secondary" textColor="text-secondary-foreground" />
            <ColorSwatch name="Accent" color="bg-accent" textColor="text-accent-foreground" />
            <ColorSwatch name="Success" color="bg-success" textColor="text-white" />
            <ColorSwatch name="Warning" color="bg-warning" textColor="text-black" />
            <ColorSwatch name="Danger" color="bg-danger" textColor="text-white" />
            <ColorSwatch name="Muted" color="bg-muted" textColor="text-muted-foreground" />
            <ColorSwatch name="Card" color="bg-card" textColor="text-card-foreground" />
          </div>
        </motion.section>

        {/* Typography */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Typography" description="Bebas Neue for display, DM Sans for body" />
          <div className="space-y-6 mt-6">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <p className="text-caption text-muted-foreground mb-2">Display Font</p>
              <h2 className="font-display text-5xl tracking-tight">BE A REAL MAN</h2>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <p className="text-caption text-muted-foreground mb-2">Body Font</p>
              <p className="text-display-sm">Display Small</p>
              <p className="text-heading-lg">Heading Large</p>
              <p className="text-heading">Heading</p>
              <p className="text-body-lg">Body Large - Build lasting habits</p>
              <p className="text-body">Body - Regular text for descriptions</p>
              <p className="text-body-sm">Body Small - Secondary info</p>
              <p className="text-caption">Caption - Timestamps, metadata</p>
            </div>
          </div>
        </motion.section>

        {/* Buttons */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Buttons" description="Action-oriented with satisfying feedback" />
          <div className="space-y-6 mt-6">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <p className="text-caption text-muted-foreground mb-4">Variants</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border">
              <p className="text-caption text-muted-foreground mb-4">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">+</Button>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border">
              <p className="text-caption text-muted-foreground mb-4">States</p>
              <div className="flex flex-wrap gap-3">
                <Button isLoading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button leftIcon={<span>💪</span>}>With Icon</Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Cards */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Cards" description="Containers with depth and interaction" />
          <div className="grid gap-4 mt-6">
            <Card className="p-6">
              <h3 className="font-display text-xl tracking-wide mb-2">DEFAULT CARD</h3>
              <p className="text-body-sm text-muted-foreground">
                Standard card for content containers.
              </p>
            </Card>
            <Card interactive className="p-6">
              <h3 className="font-display text-xl tracking-wide mb-2">INTERACTIVE CARD</h3>
              <p className="text-body-sm text-muted-foreground">
                Hover and click me for feedback.
              </p>
            </Card>
            <div className="glass-card p-6">
              <h3 className="font-display text-xl tracking-wide mb-2">GLASS CARD</h3>
              <p className="text-body-sm text-muted-foreground">
                Frosted glass effect for overlays.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Inputs */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Inputs" description="Form controls with clear states" />
          <div className="space-y-4 mt-6 p-6 rounded-2xl bg-card border border-border">
            <Input placeholder="Text input" />
            <Input type="email" placeholder="Email address" />
            <Input placeholder="With error" error="This field is required" />
            <Input placeholder="Disabled" disabled />
            <Textarea placeholder="Multi-line text area..." rows={3} />
          </div>
        </motion.section>

        {/* Avatars */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Avatars" description="User identity representation" />
          <div className="p-6 rounded-2xl bg-card border border-border">
            <p className="text-caption text-muted-foreground mb-4">Sizes</p>
            <div className="flex items-center gap-4">
              <Avatar fallback="T" size="xs" />
              <Avatar fallback="J" size="sm" />
              <Avatar fallback="S" size="md" />
              <Avatar fallback="SH" size="lg" />
              <Avatar fallback="G" size="xl" />
            </div>
            <p className="text-caption text-muted-foreground mt-6 mb-4">With Badge</p>
            <div className="flex items-center gap-4">
              <DotBadge variant="success">
                <Avatar fallback="A" size="md" />
              </DotBadge>
              <DotBadge variant="danger" count={3}>
                <Avatar fallback="N" size="md" />
              </DotBadge>
            </div>
          </div>
        </motion.section>

        {/* Badges */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Badges" description="Labels and status indicators" />
          <div className="p-6 rounded-2xl bg-card border border-border">
            <p className="text-caption text-muted-foreground mb-4">Variants</p>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <p className="text-caption text-muted-foreground mb-4">Sizes</p>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
            <p className="text-caption text-muted-foreground mb-4">Status</p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="active" />
              <StatusBadge status="pending" />
              <StatusBadge status="completed" />
              <StatusBadge status="failed" />
            </div>
          </div>
        </motion.section>

        {/* Progress */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Progress" description="Achievement visualization" />
          <div className="space-y-6 mt-6 p-6 rounded-2xl bg-card border border-border">
            <div>
              <p className="text-caption text-muted-foreground mb-2">Linear Progress</p>
              <Progress value={30} max={100} className="mb-2" />
              <Progress value={65} max={100} className="mb-2" />
              <Progress value={100} max={100} />
            </div>
            <div>
              <p className="text-caption text-muted-foreground mb-4">Circular Progress</p>
              <div className="flex items-center gap-6">
                <CircularProgress value={25} max={100} size="sm" />
                <CircularProgress value={50} max={100} size="md" />
                <CircularProgress value={85} max={100} size="xl" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Feed Card Pattern */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Feed Card" description="Live activity pattern - the heart of BARM" />
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl tracking-wide">LIVE FEED</h3>
              <LiveIndicator />
            </div>
            <FeedCard
              user={{ name: 'Taro' }}
              mission={{ name: '腕立て伏せ', value: 50, unit: '回', icon: '💪' }}
              timeAgo="2分前"
              isNew
              index={0}
            />
            <FeedCard
              user={{ name: 'Jiro' }}
              mission={{ name: '読書', value: 30, unit: '分', icon: '📚' }}
              timeAgo="5分前"
              index={1}
            />
            <FeedCard
              user={{ name: 'Saburo' }}
              mission={{ name: 'ランニング', value: 5, unit: 'km', icon: '🏃' }}
              timeAgo="12分前"
              index={2}
            />
            <FeedCard
              user={{ name: 'Shiro' }}
              mission={{ name: '瞑想', value: 15, unit: '分', icon: '🧘' }}
              timeAgo="18分前"
              index={3}
            />
          </div>
        </motion.section>

        {/* Animations */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Motion" description="Purposeful animations for feedback" />
          <div className="p-6 rounded-2xl bg-card border border-border">
            <p className="text-caption text-muted-foreground mb-4">Hover for effects</p>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-xl bg-secondary text-center cursor-pointer"
              >
                <p className="text-body-sm">Lift on hover</p>
              </motion.div>
              <motion.div
                whileHover={{ rotate: [0, -1, 1, 0] }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-xl bg-secondary text-center cursor-pointer"
              >
                <p className="text-body-sm">Shake on hover</p>
              </motion.div>
              <motion.div
                whileHover={{ boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)' }}
                className="p-4 rounded-xl bg-secondary text-center cursor-pointer"
              >
                <p className="text-body-sm">Glow on hover</p>
              </motion.div>
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-xl bg-secondary text-center cursor-pointer active:bg-accent/20"
              >
                <p className="text-body-sm">Press to shrink</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.section variants={itemVariants} className="pb-8">
          <div className="text-center py-8 border-t border-border">
            <p className="font-display text-2xl tracking-wide text-muted-foreground">
              BUILT FOR REAL MEN
            </p>
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}

// Helper Components
function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="font-display text-3xl tracking-wide text-foreground">{title.toUpperCase()}</h2>
      <p className="text-body-sm text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

function ColorSwatch({ name, color, textColor }: { name: string; color: string; textColor: string }) {
  return (
    <div className={`${color} ${textColor} rounded-xl p-4 aspect-square flex flex-col justify-end`}>
      <p className="font-medium text-sm">{name}</p>
    </div>
  )
}

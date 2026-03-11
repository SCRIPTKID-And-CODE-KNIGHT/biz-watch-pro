import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, BarChart3, Bell, Users, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const features = [
  { icon: Package, title: 'Product Management', desc: 'Add, edit, and organize your entire inventory with SKU tracking and categories.' },
  { icon: BarChart3, title: 'Sales Tracking', desc: 'Record sales instantly with automatic inventory deduction and revenue tracking.' },
  { icon: Bell, title: 'Low Stock Alerts', desc: 'Get notified when products drop below minimum stock levels — never run out.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Add staff members with role-based access so your team can help manage inventory.' },
  { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Admins observe the dashboard while staff handle day-to-day product and sales operations.' },
  { icon: Zap, title: 'Real-Time Dashboard', desc: 'See total products, low stock items, daily sales, and inventory value at a glance.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              StockPilot
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center md:pt-32 md:pb-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <Zap className="h-3.5 w-3.5 text-accent" />
          Simple inventory management for growing businesses
        </div>
        <h1
          className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Take control of your
          <span className="text-primary"> inventory</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          StockPilot helps you track products, record sales, monitor stock levels, and manage your team — all from one clean dashboard.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="text-base px-8" asChild>
            <Link to="/auth">
              Start for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-20 md:pb-32">
        <h2
          className="text-2xl font-bold tracking-tight text-foreground text-center sm:text-3xl mb-12"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Everything you need to manage stock
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center md:py-24">
          <h2
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Ready to streamline your inventory?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Sign up in seconds. Add your products and start tracking today.
          </p>
          <Button size="lg" className="mt-8 text-base px-8" asChild>
            <Link to="/auth">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} StockPilot</span>
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" /> StockPilot
          </div>
        </div>
      </footer>
    </div>
  );
}

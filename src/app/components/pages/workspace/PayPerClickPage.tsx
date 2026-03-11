import { CreditCard, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export function PayPerClickPage() {
  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: 'var(--font-family)' }}>
      <div className="border-b border-border bg-card px-4 sm:px-6 py-4">
        <h1 className="text-foreground mb-1" style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 'var(--font-weight-bold)',
          fontFamily: 'var(--font-family)'
        }}>
          Pay Per Click
        </h1>
        <p className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
          Manage your usage-based billing and payment methods
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 custom-scrollbar">
        <div className="max-w-4xl space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-5" style={{ boxShadow: 'var(--elevation-sm)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-primary" />
                </div>
                <h3 className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                  This Month
                </h3>
              </div>
              <p className="text-foreground" style={{
                fontSize: 'var(--text-h2)',
                fontWeight: 'var(--font-weight-bold)',
                fontFamily: 'var(--font-family)'
              }}>
                2,847
              </p>
              <p className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                clicks used
              </p>
            </div>

            <div className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-5" style={{ boxShadow: 'var(--elevation-sm)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[var(--radius)] bg-accent/10 flex items-center justify-center">
                  <DollarSign size={20} className="text-accent" />
                </div>
                <h3 className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                  Current Bill
                </h3>
              </div>
              <p className="text-foreground" style={{
                fontSize: 'var(--text-h2)',
                fontWeight: 'var(--font-weight-bold)',
                fontFamily: 'var(--font-family)'
              }}>
                $284.70
              </p>
              <p className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                at $0.10 per click
              </p>
            </div>

            <div className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-5" style={{ boxShadow: 'var(--elevation-sm)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[var(--radius)] bg-destructive/10 flex items-center justify-center">
                  <Calendar size={20} className="text-destructive" />
                </div>
                <h3 className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                  Next Billing
                </h3>
              </div>
              <p className="text-foreground" style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-bold)',
                fontFamily: 'var(--font-family)'
              }}>
                March 1, 2026
              </p>
              <p className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                in 18 days
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-6" style={{ boxShadow: 'var(--elevation-sm)' }}>
            <h2 className="text-foreground mb-4" style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-family)'
            }}>
              Payment Method
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CreditCard size={24} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground mb-1" style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
                }}>
                  •••• •••• •••• 4242
                </p>
                <p className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                  Expires 12/2027
                </p>
              </div>
              <button className="px-4 py-2 min-h-[44px] bg-secondary text-foreground rounded-[var(--radius)] hover:bg-secondary/80 transition-colors" style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family)'
              }}>
                Update
              </button>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-6" style={{ boxShadow: 'var(--elevation-sm)' }}>
            <h2 className="text-foreground mb-4" style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-family)'
            }}>
              Pricing Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                  Price per click
                </span>
                <span className="text-foreground" style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
                }}>
                  $0.10
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                  Included clicks
                </span>
                <span className="text-foreground" style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
                }}>
                  1,000 / month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

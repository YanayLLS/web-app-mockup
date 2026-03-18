import { CreditCard, TrendingUp, DollarSign, Calendar, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function PayPerClickPage() {
  const totalClicks = 2847;
  const includedClicks = 1000;
  const overageClicks = totalClicks - includedClicks;
  const usagePercent = Math.min((totalClicks / 5000) * 100, 100); // visual cap at 5000

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border/60 bg-card px-4 sm:px-6 py-5">
        <h1 className="text-foreground mb-1" style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 'var(--font-weight-bold)',
        }}>
          Pay Per Click
        </h1>
        <p className="text-muted/70" style={{ fontSize: 'var(--text-sm)' }}>
          Manage your usage-based billing and payment methods
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 custom-scrollbar">
        <div className="max-w-4xl space-y-5">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* This Month */}
            <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(47,128,237,0.1)', color: '#2F80ED' }}>
                  <TrendingUp size={20} />
                </div>
                <span className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-semibold)' }}>This Month</span>
              </div>
              <p className="text-foreground text-2xl mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                {totalClicks.toLocaleString()}
              </p>
              <p className="text-xs text-muted">clicks used</p>
              {/* Usage bar */}
              <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${usagePercent}%`,
                    background: usagePercent > 80 ? 'linear-gradient(90deg, #2F80ED, #F59E0B)' : '#2F80ED',
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-muted">{includedClicks.toLocaleString()} included</span>
                <span className="text-[10px] text-[#F59E0B]" style={{ fontWeight: 'var(--font-weight-semibold)' }}>+{overageClicks.toLocaleString()} overage</span>
              </div>
            </div>

            {/* Current Bill */}
            <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(17,232,116,0.1)', color: '#0a9e4a' }}>
                  <DollarSign size={20} />
                </div>
                <span className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Current Bill</span>
              </div>
              <p className="text-foreground text-2xl mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                $284.70
              </p>
              <p className="text-xs text-muted">at $0.10 per click</p>
              {/* Breakdown mini */}
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="text-[10px] text-muted">Included: $0.00</span>
                <span className="text-[10px] text-muted">Overage: $184.70</span>
              </div>
            </div>

            {/* Next Billing */}
            <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
                  <Calendar size={20} />
                </div>
                <span className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Next Billing</span>
              </div>
              <p className="text-foreground text-lg mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                March 1, 2026
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="px-2 py-0.5 rounded-full text-[10px] bg-[#8B5CF6]/10 text-[#8B5CF6]" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  in 18 days
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-foreground mb-4 flex items-center gap-2" style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
            }}>
              <span className="w-1 h-4 rounded-full bg-primary" />
              Payment Method
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-secondary/20 border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a1f36] to-[#2d3555] flex items-center justify-center shrink-0">
                <CreditCard size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm mb-0.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  •••• •••• •••• 4242
                </p>
                <p className="text-xs text-muted">Visa · Expires 12/2027</p>
              </div>
              <button
                onClick={() => toast.success('Update payment method')}
                className="px-4 py-2 bg-card text-foreground text-xs border border-border rounded-lg hover:bg-secondary hover:border-primary/20 hover:shadow-sm transition-all"
                style={{ fontWeight: 'var(--font-weight-semibold)' }}
              >
                Update
              </button>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-foreground mb-4 flex items-center gap-2" style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
            }}>
              <span className="w-1 h-4 rounded-full bg-primary" />
              Pricing Information
            </h2>
            <div className="space-y-0">
              <div className="flex justify-between items-center py-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-[#F59E0B]" />
                  <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>Price per click</span>
                </div>
                <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>$0.10</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-[#11E874]" />
                  <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>Included clicks</span>
                </div>
                <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>1,000 / month</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-[#2F80ED]" />
                  <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>Overage rate</span>
                </div>
                <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>$0.10 / click</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

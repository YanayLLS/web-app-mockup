import { useNavigate } from 'react-router-dom';
import { Monitor, Smartphone, Glasses, ArrowRight } from 'lucide-react';
import svgPaths from "../../imports/svg-albmkprcym";

function IconLogo() {
  return (
    <svg className="block w-full h-full" fill="none" viewBox="0 0 24 24">
      <g>
        <path d={svgPaths.p2e071580} fill="currentColor" />
        <path d={svgPaths.p159c9f80} fill="currentColor" />
        <path d={svgPaths.p50fb500} fill="currentColor" />
        <path d={svgPaths.p1f65b900} fill="currentColor" />
      </g>
    </svg>
  );
}

const products = [
  {
    id: 'web',
    name: 'Web',
    description: 'Browser-based application for desktop and laptop',
    icon: Monitor,
    path: '/web/home',
    ready: true,
    color: '#2F80ED',
  },
  {
    id: 'app',
    name: 'App',
    description: 'Desktop & mobile application for all platforms',
    icon: Smartphone,
    path: '/app/knowledgebase',
    ready: true,
    color: '#8B5CF6',
  },
  {
    id: 'xr',
    name: 'XR App',
    description: 'Mixed reality application for XR headsets',
    icon: Glasses,
    path: '/xr',
    ready: true,
    color: '#00BCD4',
  },
];

export function ProductSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col items-center justify-center px-4 py-8 sm:p-8 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Logo / Title */}
        <div className="mb-10 sm:mb-14 text-center">
          <div
            className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center mx-auto mb-6 text-primary p-3"
            style={{ boxShadow: '0 8px 32px rgba(47,128,237,0.12)' }}
          >
            <IconLogo />
          </div>
          <h1 className="text-foreground mb-2" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
            Frontline.io
          </h1>
          <p className="text-muted" style={{ fontSize: 'var(--text-base)' }}>
            Select a platform to explore
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 w-full max-w-[calc(100vw-32px)] sm:max-w-3xl">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <button
                key={product.id}
                onClick={() => product.ready && navigate(product.path)}
                className={`group relative bg-card border border-border rounded-2xl px-5 py-7 sm:p-8 flex flex-col items-center gap-4 transition-all min-h-[44px]
                  ${product.ready
                    ? 'hover:border-primary/30 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                  }`}
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}
              >
                {/* Icon */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105"
                  style={{
                    backgroundColor: `${product.color}10`,
                    boxShadow: product.ready ? `0 8px 24px ${product.color}15` : undefined,
                  }}
                >
                  <Icon size={34} style={{ color: product.color }} />
                </div>

                {/* Text */}
                <h3 className="text-foreground text-lg" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {product.name}
                </h3>
                <p className="text-muted text-sm text-center leading-relaxed">
                  {product.description}
                </p>

                {/* Arrow hint on hover */}
                {product.ready && (
                  <div className="flex items-center gap-1.5 text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-y-0 translate-y-1 mt-1">
                    <span className="text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>Open</span>
                    <ArrowRight size={14} />
                  </div>
                )}

                {/* Coming soon badge */}
                {!product.ready && (
                  <span className="absolute top-3 right-3 text-[10px] bg-secondary text-muted px-2.5 py-1 rounded-full" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    Coming Soon
                  </span>
                )}

                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-1 rounded-b-full transition-all opacity-0 group-hover:opacity-100"
                  style={{ width: '40px', backgroundColor: product.color }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

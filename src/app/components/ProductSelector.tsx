import { useNavigate } from 'react-router-dom';
import { Monitor, Smartphone, Glasses } from 'lucide-react';

const products = [
  {
    id: 'web',
    name: 'Web',
    description: 'Browser-based application for desktop and laptop',
    icon: Monitor,
    path: '/web/home',
    ready: true,
  },
  {
    id: 'app',
    name: 'App',
    description: 'Mobile application for iOS and Android',
    icon: Smartphone,
    path: '/app',
    ready: false,
  },
  {
    id: 'xr',
    name: 'XR App',
    description: 'Mixed reality application for XR headsets',
    icon: Glasses,
    path: '/xr',
    ready: false,
  },
];

export function ProductSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      {/* Logo / Title */}
      <div className="mb-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
          <span className="text-primary-foreground text-2xl font-bold">F</span>
        </div>
        <h1 className="text-foreground mb-2">Frontline</h1>
        <p className="text-muted text-base">Select a platform to view the design mockup</p>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
        {products.map((product) => {
          const Icon = product.icon;
          return (
            <button
              key={product.id}
              onClick={() => product.ready && navigate(product.path)}
              className={`group relative bg-card rounded-xl p-8 flex flex-col items-center gap-4 transition-all
                shadow-elevation-sm
                ${product.ready
                  ? 'hover:shadow-elevation-md hover:-translate-y-1 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
                }`}
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors
                ${product.ready
                  ? 'bg-primary/10 group-hover:bg-primary/20'
                  : 'bg-secondary'
                }`}>
                <Icon
                  size={36}
                  className={product.ready ? 'text-primary' : 'text-muted'}
                />
              </div>
              <h3 className="text-foreground">{product.name}</h3>
              <p className="text-muted text-sm text-center">{product.description}</p>
              {!product.ready && (
                <span className="absolute top-3 right-3 text-xs bg-secondary text-muted px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

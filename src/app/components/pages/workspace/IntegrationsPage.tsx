import { useState } from 'react';
import { Search, CheckCircle2, ExternalLink, Plug } from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  isConnected: boolean;
  color: string;
  initial: string;
}

const mockIntegrations: Integration[] = [
  { id: '1', name: 'Slack', description: 'Team communication and collaboration', category: 'Communication', isConnected: true, color: '#E01E5A', initial: 'S' },
  { id: '2', name: 'Microsoft Teams', description: 'Chat, meetings, and collaboration', category: 'Communication', isConnected: false, color: '#6264A7', initial: 'T' },
  { id: '3', name: 'Salesforce', description: 'Customer relationship management', category: 'CRM', isConnected: true, color: '#00A1E0', initial: 'SF' },
  { id: '4', name: 'HubSpot', description: 'Marketing and sales platform', category: 'CRM', isConnected: false, color: '#FF7A59', initial: 'HS' },
  { id: '5', name: 'Jira', description: 'Project and issue tracking', category: 'Project Management', isConnected: true, color: '#0052CC', initial: 'Ji' },
  { id: '6', name: 'Asana', description: 'Work and project management', category: 'Project Management', isConnected: false, color: '#F06A6A', initial: 'As' },
  { id: '7', name: 'Google Drive', description: 'Cloud file storage and sharing', category: 'Storage', isConnected: true, color: '#4285F4', initial: 'G' },
  { id: '8', name: 'Dropbox', description: 'File hosting and sharing', category: 'Storage', isConnected: false, color: '#0061FF', initial: 'Db' },
];

const categoryColors: Record<string, string> = {
  'Communication': '#8B5CF6',
  'CRM': '#F59E0B',
  'Project Management': '#2F80ED',
  'Storage': '#10B981',
};

export function IntegrationsPage() {
  const [integrations] = useState<Integration[]>(mockIntegrations);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredIntegrations = integrations.filter(int => {
    const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      int.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || int.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(integrations.map(i => i.category)))];
  const connectedCount = integrations.filter(i => i.isConnected).length;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border/60 bg-card px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground mb-1" style={{
              fontSize: 'var(--text-h2)',
              fontWeight: 'var(--font-weight-bold)',
            }}>
              Integrations
            </h1>
            <p className="text-muted/70" style={{ fontSize: 'var(--text-sm)' }}>
              Connect your workspace with external tools and services
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#11E874]/8 border border-[#11E874]/15">
            <div className="w-2 h-2 rounded-full bg-[#11E874]" />
            <span className="text-[11px] text-[#0a9e4a]" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {connectedCount} connected
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="border-b border-border/40 bg-card px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-secondary/30 border border-border rounded-lg focus-within:border-primary focus-within:bg-card focus-within:shadow-sm focus-within:shadow-primary/5 transition-all">
            <Search size={15} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground outline-none ring-0 border-none placeholder:text-muted focus:outline-none focus:ring-0"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
            style={{ fontWeight: 'var(--font-weight-medium)' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredIntegrations.map((integration) => {
            const catColor = categoryColors[integration.category] || '#868d9e';
            return (
              <div
                key={integration.id}
                className={`group bg-card border rounded-xl p-5 transition-all hover:shadow-md ${
                  integration.isConnected
                    ? 'border-[#11E874]/20 hover:border-[#11E874]/35'
                    : 'border-border hover:border-primary/25'
                }`}
              >
                {/* Top: icon + status */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs shrink-0"
                    style={{ background: integration.color, fontWeight: 'var(--font-weight-bold)' }}
                  >
                    {integration.initial}
                  </div>
                  {integration.isConnected && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#11E874]/10 text-[#0a9e4a]">
                      <CheckCircle2 size={12} />
                      <span className="text-[10px]" style={{ fontWeight: 'var(--font-weight-bold)' }}>Connected</span>
                    </div>
                  )}
                </div>

                {/* Name + desc */}
                <h3 className="text-foreground text-sm mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {integration.name}
                </h3>
                <p className="text-muted text-xs mb-3 leading-relaxed">
                  {integration.description}
                </p>

                {/* Category tag */}
                <div className="mb-4">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: `${catColor}10`,
                      color: catColor,
                      fontWeight: 'var(--font-weight-semibold)',
                    }}
                  >
                    {integration.category}
                  </span>
                </div>

                {/* Action */}
                <button
                  onClick={() => toast.success(integration.isConnected ? `Managing ${integration.name}` : `Connecting ${integration.name}...`)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs transition-all ${
                    integration.isConnected
                      ? 'bg-card border border-border text-foreground hover:bg-secondary hover:border-primary/20 hover:shadow-sm'
                      : 'bg-primary text-primary-foreground hover:brightness-110 hover:shadow-md hover:shadow-primary/20'
                  }`}
                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                >
                  {integration.isConnected ? (
                    <>Manage<ExternalLink size={12} /></>
                  ) : (
                    <><Plug size={12} />Connect</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Puzzle, Search, CheckCircle2, ExternalLink } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  isConnected: boolean;
  logo?: string;
}

const mockIntegrations: Integration[] = [
  { id: '1', name: 'Slack', description: 'Team communication and collaboration', category: 'Communication', isConnected: true },
  { id: '2', name: 'Microsoft Teams', description: 'Chat, meetings, and collaboration', category: 'Communication', isConnected: false },
  { id: '3', name: 'Salesforce', description: 'Customer relationship management', category: 'CRM', isConnected: true },
  { id: '4', name: 'HubSpot', description: 'Marketing and sales platform', category: 'CRM', isConnected: false },
  { id: '5', name: 'Jira', description: 'Project and issue tracking', category: 'Project Management', isConnected: true },
  { id: '6', name: 'Asana', description: 'Work and project management', category: 'Project Management', isConnected: false },
  { id: '7', name: 'Google Drive', description: 'Cloud file storage and sharing', category: 'Storage', isConnected: true },
  { id: '8', name: 'Dropbox', description: 'File hosting and sharing', category: 'Storage', isConnected: false },
];

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
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: 'var(--font-family)' }}>
      <div className="border-b border-border bg-card px-4 sm:px-6 py-4">
        <h1 className="text-foreground mb-1" style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 'var(--font-weight-bold)',
          fontFamily: 'var(--font-family)'
        }}>
          Integrations
        </h1>
        <p className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
          Connect your workspace with external tools and services • {connectedCount} connected
        </p>
      </div>

      {/* Search and Filter */}
      <div className="border-b border-border bg-card px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-[var(--radius)] text-foreground placeholder:text-muted"
              style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-input-background border border-border rounded-[var(--radius)] text-foreground"
            style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}
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
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => (
            <div key={integration.id} className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-5 hover:border-primary/50 transition-colors" style={{ boxShadow: 'var(--elevation-sm)' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-[var(--radius)] bg-secondary flex items-center justify-center flex-shrink-0">
                  <Puzzle size={24} className="text-primary" />
                </div>
                {integration.isConnected && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-[var(--radius)]">
                    <CheckCircle2 size={14} />
                    <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                      Connected
                    </span>
                  </div>
                )}
              </div>
              
              <h3 className="text-foreground mb-2" style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-bold)',
                fontFamily: 'var(--font-family)'
              }}>
                {integration.name}
              </h3>
              
              <p className="text-muted mb-3" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                {integration.description}
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-muted text-xs px-2 py-1 bg-secondary rounded-[var(--radius)]" style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)'
                }}>
                  {integration.category}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <button className={`w-full flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] rounded-[var(--radius)] transition-colors ${
                  integration.isConnected
                    ? 'bg-secondary text-foreground hover:bg-secondary/80'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`} style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
                }}>
                  {integration.isConnected ? (
                    <>
                      <span>Manage</span>
                      <ExternalLink size={14} />
                    </>
                  ) : (
                    <span>Connect</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

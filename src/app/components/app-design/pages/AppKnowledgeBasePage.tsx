import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List, ChevronRight, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const projects = [
  {
    id: '915-i-series',
    name: '915 i Series',
    items: 27,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
    lastUpdated: '2 days ago',
  },
  {
    id: 'manufacturing-alpha',
    name: 'Manufacturing Facility Alpha',
    items: 42,
    image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=400&h=300&fit=crop',
    lastUpdated: '1 week ago',
  },
  {
    id: 'elitebook-840',
    name: 'Elitebook 840 G9',
    items: 18,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
    lastUpdated: '3 days ago',
  },
  {
    id: 'probook-450',
    name: 'ProBook 450 G10',
    items: 12,
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=300&fit=crop',
    lastUpdated: '5 days ago',
  },
  {
    id: 'zbook-studio',
    name: 'ZBook Studio G9',
    items: 8,
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop',
    lastUpdated: '1 day ago',
  },
  {
    id: 'printing-equip',
    name: 'High-Volume Printing Equipment',
    items: 35,
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=300&fit=crop',
    lastUpdated: '4 hours ago',
  },
];

export function AppKnowledgeBasePage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col overflow-y-auto" style={{ padding: '24px 28px' }}>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <h1 style={{ fontSize: '22px', fontWeight: 'var(--font-weight-bold)', color: '#36415D', margin: 0, fontFamily: 'var(--font-family)' }}>
          Projects
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative" style={{ width: '240px' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: '#7F7F7F' }} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 text-sm border-none outline-none"
              style={{ backgroundColor: '#E9E9E9', borderRadius: '10px', height: '34px', color: '#36415D' }}
            />
          </div>
          <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors" style={{ color: '#7F7F7F' }}>
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {/* Projects grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '16px',
        }}
      >
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => navigate(`/app/project/${project.id}/kb`)}
            className="cursor-pointer overflow-hidden hover:shadow-elevation-md transition-all group"
            style={{
              aspectRatio: '4 / 3',
              borderRadius: '10px',
              position: 'relative',
            }}
          >
            {/* Thumbnail */}
            <img
              src={project.image}
              alt={project.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 55%)' }}
            />
            {/* Info at bottom */}
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
              <div className="truncate" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: 'white' }}>
                {project.name}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                {project.items} Items
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { ArrowRight, AlertCircle, Users, Crown, Folder, FileText, Check, Info } from 'lucide-react';
import { useState, useMemo } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  projects: string[]; // Project IDs they have access to
  itemPermissions: Record<string, string[]>; // Project ID -> item IDs they can view
}

interface Project {
  id: string;
  name: string;
  itemCount: number;
}

interface RoleSetGroup {
  id: string;
  name: string;
  role: string;
  members: number;
  projects: string[];
  itemPermissions: Record<string, string[]>;
  description: string;
}

// Generate realistic data: 20 projects, 700 users, 6 roles
const roles = ['Owner', 'Admin', 'Operator', 'Support Agent', 'Content Creator', 'Viewer'];

const projects: Project[] = [
  { id: 'p1', name: 'Customer Portal', itemCount: 45 },
  { id: 'p2', name: 'Admin Dashboard', itemCount: 32 },
  { id: 'p3', name: 'Marketing Site', itemCount: 28 },
  { id: 'p4', name: 'Internal Tools', itemCount: 52 },
  { id: 'p5', name: 'Sales Platform', itemCount: 38 },
  { id: 'p6', name: 'Support Center', itemCount: 41 },
  { id: 'p7', name: 'Analytics Hub', itemCount: 35 },
  { id: 'p8', name: 'Content Library', itemCount: 67 },
  { id: 'p9', name: 'Training Portal', itemCount: 44 },
  { id: 'p10', name: 'Partner Portal', itemCount: 29 },
  { id: 'p11', name: 'Mobile Apps', itemCount: 51 },
  { id: 'p12', name: 'API Documentation', itemCount: 38 },
  { id: 'p13', name: 'Reports System', itemCount: 43 },
  { id: 'p14', name: 'HR Platform', itemCount: 31 },
  { id: 'p15', name: 'Finance Tools', itemCount: 27 },
  { id: 'p16', name: 'Inventory System', itemCount: 48 },
  { id: 'p17', name: 'CRM Platform', itemCount: 56 },
  { id: 'p18', name: 'Communication Hub', itemCount: 34 },
  { id: 'p19', name: 'Knowledge Base', itemCount: 62 },
  { id: 'p20', name: 'Project Management', itemCount: 49 },
];

// Helper to generate random subset
const randomSubset = <T,>(arr: T[], minSize: number, maxSize: number): T[] => {
  const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, size);
};

// Helper to generate item permissions for a project
const generateItemPermissions = (project: Project, accessLevel: number): string[] => {
  const itemCount = Math.floor((project.itemCount * accessLevel) / 100);
  return Array.from({ length: itemCount }, (_, i) => `${project.id}_item_${i + 1}`);
};

// Generate 700 users with realistic distribution
const firstNames = ['Sarah', 'Marcus', 'Priya', 'James', 'Ana', 'David', 'Lisa', 'Michael', 'Emma', 'Carlos', 'Yuki', 'Ahmed', 'Sofia', 'Chen', 'Raj', 'Maria', 'John', 'Fatima', 'Diego', 'Aisha'];
const lastNames = ['Chen', 'Johnson', 'Patel', 'Wilson', 'Rodriguez', 'Kim', 'Anderson', 'Garcia', 'Lee', 'Martinez', 'Singh', 'Brown', 'Davis', 'Lopez', 'Wang', 'Miller', 'Taylor', 'Nguyen', 'Kumar', 'Gonzalez'];

const generateUsers = (): User[] => {
  const users: User[] = [];
  for (let i = 0; i < 700; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    
    // Different roles get different project access patterns
    let projectCount = 0;
    let accessLevel = 0;
    
    if (role === 'Owner') {
      projectCount = 20; // Full access
      accessLevel = 100;
    } else if (role === 'Admin') {
      projectCount = Math.floor(Math.random() * 8) + 12; // 12-20 projects
      accessLevel = Math.floor(Math.random() * 20) + 80; // 80-100% items
    } else if (role === 'Operator') {
      projectCount = Math.floor(Math.random() * 6) + 8; // 8-14 projects
      accessLevel = Math.floor(Math.random() * 25) + 60; // 60-85% items
    } else if (role === 'Support Agent') {
      projectCount = Math.floor(Math.random() * 5) + 6; // 6-11 projects
      accessLevel = Math.floor(Math.random() * 25) + 50; // 50-75% items
    } else if (role === 'Content Creator') {
      projectCount = Math.floor(Math.random() * 5) + 5; // 5-10 projects
      accessLevel = Math.floor(Math.random() * 30) + 40; // 40-70% items
    } else {
      projectCount = Math.floor(Math.random() * 4) + 3; // 3-7 projects
      accessLevel = Math.floor(Math.random() * 30) + 20; // 20-50% items
    }
    
    const userProjects = randomSubset(projects.map(p => p.id), Math.min(projectCount, 20), Math.min(projectCount, 20));
    
    // Generate item permissions for each project
    const itemPermissions: Record<string, string[]> = {};
    userProjects.forEach(projectId => {
      const project = projects.find(p => p.id === projectId)!;
      itemPermissions[projectId] = generateItemPermissions(project, accessLevel + Math.floor(Math.random() * 10 - 5));
    });
    
    users.push({
      id: `u${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@company.com`,
      role,
      projects: userProjects,
      itemPermissions,
    });
  }
  return users;
};

const sampleUsers = generateUsers();

// Analyze and create groups - one group per project per role
const generateRoleSetGroups = (users: User[]): RoleSetGroup[] => {
  const groups: RoleSetGroup[] = [];
  let groupIndex = 1;
  
  // For each project, create 6 groups (one per role)
  projects.forEach(project => {
    roles.forEach(role => {
      // Find all users with this role who have access to this project
      const usersInGroup = users.filter(u => 
        u.role === role && u.projects.includes(project.id)
      );
      
      if (usersInGroup.length > 0) {
        // Get unique item access patterns for this project+role combination
        const itemAccessPatterns = new Map<string, User[]>();
        
        usersInGroup.forEach(user => {
          const itemCount = user.itemPermissions[project.id]?.length || 0;
          const key = `${itemCount}`;
          
          if (!itemAccessPatterns.has(key)) {
            itemAccessPatterns.set(key, []);
          }
          itemAccessPatterns.get(key)!.push(user);
        });
        
        // Create a group for each unique item access pattern within this project+role
        itemAccessPatterns.forEach((members, itemKey) => {
          const firstMember = members[0];
          const itemCount = firstMember.itemPermissions[project.id]?.length || 0;
          
          groups.push({
            id: `g${groupIndex++}`,
            name: `${project.name} - ${role}`,
            role,
            members: members.length,
            projects: [project.id],
            itemPermissions: { [project.id]: firstMember.itemPermissions[project.id] || [] },
            description: `${members.length} ${role}${members.length !== 1 ? 's' : ''} with access to ${itemCount}/${project.itemCount} items in ${project.name}`,
          });
        });
      }
    });
  });
  
  return groups.sort((a, b) => {
    // Sort by project name first, then by role
    const projectCompare = a.name.localeCompare(b.name);
    if (projectCompare !== 0) return projectCompare;
    return a.role.localeCompare(b.role);
  });
};

const roleSetGroups = generateRoleSetGroups(sampleUsers);

const roleColors: Record<string, string> = {
  'Owner': '#7c3aed',
  'Admin': '#2f80ed',
  'Content Creator': '#11e874',
  'Operator': '#f2994a',
  'Support Agent': '#9b51e0',
  'Viewer': '#6b7280',
};

export function AccessMigrationPage() {
  const [selectedView, setSelectedView] = useState<'overview' | 'users' | 'groups'>('overview');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const selectedGroup = selectedGroupId ? roleSetGroups.find(g => g.id === selectedGroupId) : null;
  
  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = sampleUsers.length;
    const totalProjects = projects.length;
    const totalGroups = roleSetGroups.length;
    const totalItems = projects.reduce((sum, p) => sum + p.itemCount, 0);
    
    const roleDistribution = roles.map(role => ({
      role,
      count: sampleUsers.filter(u => u.role === role).length,
      color: roleColors[role],
    }));
    
    const groupSizeDistribution = {
      single: roleSetGroups.filter(g => g.members === 1).length,
      small: roleSetGroups.filter(g => g.members > 1 && g.members <= 5).length,
      medium: roleSetGroups.filter(g => g.members > 5 && g.members <= 20).length,
      large: roleSetGroups.filter(g => g.members > 20).length,
    };
    
    return {
      totalUsers,
      totalProjects,
      totalGroups,
      totalItems,
      roleDistribution,
      groupSizeDistribution,
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 style={{  fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-bold)', lineHeight: '1.5', color: 'var(--foreground)' }}>
              Access System Migration
            </h2>
            <p style={{  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-normal)', lineHeight: '1.5', color: 'var(--muted)', marginTop: '4px' }}>
              Roles are preserved, groups created to maintain exact content access
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--primary-background)', border: '1px solid var(--primary)' }}>
            <AlertCircle className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span style={{  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary)' }}>
              Migration Preview
            </span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-6 py-4 border-b border-border" style={{ backgroundColor: 'var(--info-background)' }}>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5" style={{ color: 'var(--info)' }} />
          <div>
            <h3 style={{  fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--info)', marginBottom: '4px' }}>
              Migration Strategy
            </h3>
            <p style={{  fontSize: 'var(--text-sm)', color: 'var(--foreground)', lineHeight: '1.6' }}>
              Analyzing {stats.totalUsers} users across {stats.totalProjects} projects with {stats.totalItems} total items. Creating {stats.totalGroups} groups to preserve exact access patterns while maintaining role assignments.
            </p>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="px-6 py-3 border-b border-border bg-card">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('overview')}
            className="px-4 py-2 rounded-lg transition-all"
            style={{
              backgroundColor: selectedView === 'overview' ? 'var(--primary)' : 'transparent',
              color: selectedView === 'overview' ? 'var(--primary-foreground)' : 'var(--muted)',
              
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView('users')}
            className="px-4 py-2 rounded-lg transition-all"
            style={{
              backgroundColor: selectedView === 'users' ? 'var(--primary)' : 'transparent',
              color: selectedView === 'users' ? 'var(--primary-foreground)' : 'var(--muted)',
              
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            Role Distribution
          </button>
          <button
            onClick={() => setSelectedView('groups')}
            className="px-4 py-2 rounded-lg transition-all"
            style={{
              backgroundColor: selectedView === 'groups' ? 'var(--primary)' : 'transparent',
              color: selectedView === 'groups' ? 'var(--primary-foreground)' : 'var(--muted)',
              
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            Groups Created
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {selectedView === 'overview' && (
          <div className="max-w-6xl mx-auto">
            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-background)' }}>
                    <Users className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <div style={{  fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)' }}>
                      {stats.totalUsers}
                    </div>
                    <div style={{  fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                      Total Users
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--success-background)' }}>
                    <Folder className="w-6 h-6" style={{ color: 'var(--success)' }} />
                  </div>
                  <div>
                    <div style={{  fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)' }}>
                      {stats.totalProjects}
                    </div>
                    <div style={{  fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                      Projects
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--warning-background)' }}>
                    <FileText className="w-6 h-6" style={{ color: 'var(--warning)' }} />
                  </div>
                  <div>
                    <div style={{  fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)' }}>
                      {stats.totalItems}
                    </div>
                    <div style={{  fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                      Total Items
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Migration Results */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <h3 style={{  fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)', marginBottom: '16px' }}>
                  Migration Results
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--primary-background)' }}>
                    <div style={{  fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)' }}>
                      {stats.totalGroups}
                    </div>
                    <div style={{  fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: '4px' }}>
                      Groups Created
                    </div>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--success-background)' }}>
                    <div style={{  fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--success)' }}>
                      100%
                    </div>
                    <div style={{  fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: '4px' }}>
                      Access Preserved
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--secondary)' }}>
                  <div style={{  fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: '8px' }}>
                    Group Size Distribution
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span style={{  fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                        Single user
                      </span>
                      <span style={{  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)' }}>
                        {stats.groupSizeDistribution.single} groups
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{  fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                        2-5 users
                      </span>
                      <span style={{  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)' }}>
                        {stats.groupSizeDistribution.small} groups
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{  fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                        6-20 users
                      </span>
                      <span style={{  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)' }}>
                        {stats.groupSizeDistribution.medium} groups
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{  fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                        20+ users
                      </span>
                      <span style={{  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)' }}>
                        {stats.groupSizeDistribution.large} groups
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <h3 style={{  fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)', marginBottom: '16px' }}>
                  How It Works
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                      <span style={{  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}>1</span>
                    </div>
                    <div>
                      <h4 style={{  fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)', marginBottom: '4px' }}>
                        Analyze Access Patterns
                      </h4>
                      <p style={{  fontSize: 'var(--text-sm)', color: 'var(--muted)', lineHeight: '1.5' }}>
                        Identify unique combinations of role + project access + item-level permissions
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                      <span style={{  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}>2</span>
                    </div>
                    <div>
                      <h4 style={{  fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)', marginBottom: '4px' }}>
                        Create Groups
                      </h4>
                      <p style={{  fontSize: 'var(--text-sm)', color: 'var(--muted)', lineHeight: '1.5' }}>
                        One group per unique access pattern to preserve exact item visibility
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                      <span style={{  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}>3</span>
                    </div>
                    <div>
                      <h4 style={{  fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)', marginBottom: '4px' }}>
                        Assign Members
                      </h4>
                      <p style={{  fontSize: 'var(--text-sm)', color: 'var(--muted)', lineHeight: '1.5' }}>
                        Users maintain their roles and join groups matching their access
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Overview */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 style={{  fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)', marginBottom: '16px' }}>
                Projects & Items
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--secondary)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Folder className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      <span style={{  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--foreground)' }}>
                        {project.name}
                      </span>
                    </div>
                    <div style={{  fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                      {project.itemCount} items
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'users' && (
          <div className="max-w-5xl mx-auto">
            <h3 style={{  fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)', marginBottom: '24px' }}>
              Role Distribution
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {stats.roleDistribution.map(({ role, count, color }) => (
                <div
                  key={role}
                  className="p-6 rounded-lg border"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Crown className="w-5 h-5" style={{ color }} />
                      </div>
                      <div>
                        <h4 style={{  fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)' }}>
                          {role}
                        </h4>
                        <p style={{  fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                          {count} users ({Math.round((count / stats.totalUsers) * 100)}%)
                        </p>
                      </div>
                    </div>
                    <div style={{  fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color }}>
                      {count}
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--secondary)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: color,
                        width: `${(count / stats.totalUsers) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === 'groups' && (
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 style={{  fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)' }}>
                Groups Created ({roleSetGroups.length})
              </h3>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--secondary)' }}>
                <Info className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                <span style={{  fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                  Each group preserves exact project and item access
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {roleSetGroups.slice(0, 50).map((group) => (
                <div
                  key={group.id}
                  className="p-5 rounded-lg border transition-all"
                  style={{
                    backgroundColor: selectedGroupId === group.id ? 'var(--primary-background)' : 'var(--card)',
                    borderColor: selectedGroupId === group.id ? 'var(--primary)' : 'var(--border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedGroupId(selectedGroupId === group.id ? null : group.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${roleColors[group.role]}20` }}
                        >
                          <Users className="w-5 h-5" style={{ color: roleColors[group.role] }} />
                        </div>
                        <div>
                          <h4 style={{  fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)' }}>
                            {group.name}
                          </h4>
                          <p style={{  fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                            {group.description}
                          </p>
                        </div>
                      </div>

                      {selectedGroupId === group.id && (
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 style={{  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)', marginBottom: '8px' }}>
                                Projects Access ({group.projects.length})
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {group.projects.slice(0, 10).map(projectId => {
                                  const project = projects.find(p => p.id === projectId);
                                  return project ? (
                                    <div
                                      key={projectId}
                                      className="px-2 py-1 rounded text-xs flex items-center gap-1"
                                      style={{ backgroundColor: 'var(--secondary)', color: 'var(--foreground)' }}
                                    >
                                      <Folder className="w-3 h-3" />
                                      {project.name}
                                    </div>
                                  ) : null;
                                })}
                                {group.projects.length > 10 && (
                                  <div className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--secondary)', color: 'var(--muted)' }}>
                                    +{group.projects.length - 10} more
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h5 style={{  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)', marginBottom: '8px' }}>
                                Item-Level Access
                              </h5>
                              <div className="flex flex-col gap-2">
                                {Object.entries(group.itemPermissions).slice(0, 5).map(([projectId, items]) => {
                                  const project = projects.find(p => p.id === projectId);
                                  return project ? (
                                    <div key={projectId} style={{  fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                                      {project.name}: {items.length}/{project.itemCount} items
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div
                        className="px-3 py-1.5 rounded-lg flex items-center gap-2"
                        style={{ backgroundColor: `${roleColors[group.role]}20`, border: `1px solid ${roleColors[group.role]}` }}
                      >
                        <Crown className="w-4 h-4" style={{ color: roleColors[group.role] }} />
                        <span style={{  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: roleColors[group.role] }}>
                          {group.role}
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded" style={{ backgroundColor: 'var(--secondary)' }}>
                        <span style={{  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)' }}>
                          {group.members} {group.members === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {roleSetGroups.length > 50 && (
                <div className="p-4 text-center rounded-lg" style={{ backgroundColor: 'var(--secondary)' }}>
                  <p style={{  fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                    Showing 50 of {roleSetGroups.length} groups
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

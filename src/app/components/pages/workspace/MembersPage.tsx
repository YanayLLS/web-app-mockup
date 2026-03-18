import { useState, useMemo } from 'react';
import { Search, Plus, Mail, MoreVertical, Crown, Shield, User as UserIcon, Trash2, Wrench, Headphones, Palette, X, Users } from 'lucide-react';
import { useGroups } from '@/app/contexts/GroupsContext';

type MemberRole = 'Owner' | 'Admin' | 'Operator' | 'Support Agent' | 'Content Creator';

interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  avatar?: string;
  avatarColor: string;
  lastActive: string;
  status: 'active' | 'invited';
}

const mockMembers: Member[] = [
  { id: 'member-1', name: 'Akira Jameson', email: 'akira.j@company.com', role: 'Owner', avatarColor: '#2F80ED', lastActive: 'Online now', status: 'active' },
  { id: 'member-4', name: 'Daniel Becker', email: 'daniel.b@company.com', role: 'Admin', avatarColor: '#00BCD4', lastActive: '2 hours ago', status: 'active' },
  { id: 'member-2', name: 'Ming Sun', email: 'ming.s@company.com', role: 'Operator', avatarColor: '#E91E63', lastActive: '1 day ago', status: 'active' },
  { id: 'member-9', name: 'Rachel Torres', email: 'rachel.t@company.com', role: 'Support Agent', avatarColor: '#E91E63', lastActive: '3 days ago', status: 'active' },
  { id: 'member-5', name: 'Sophie Laurent', email: 'sophie.l@company.com', role: 'Admin', avatarColor: '#9C27B0', lastActive: 'Online now', status: 'active' },
  { id: 'member-10', name: 'James Mitchell', email: 'james.m@company.com', role: 'Content Creator', avatarColor: '#2F80ED', lastActive: '5 hours ago', status: 'active' },
  { id: 'member-3', name: 'Priya Kapoor', email: 'priya.k@company.com', role: 'Operator', avatarColor: '#FF9800', lastActive: '12 hours ago', status: 'active' },
  { id: 'member-6', name: 'Erik Nilsson', email: 'erik.n@company.com', role: 'Support Agent', avatarColor: '#11E874', lastActive: '1 day ago', status: 'active' },
  { id: 'member-7', name: 'Lucia Rossi', email: 'lucia.r@company.com', role: 'Content Creator', avatarColor: '#FF6B35', lastActive: '2 days ago', status: 'active' },
  { id: 'member-8', name: 'Tomasz Kowalski', email: 'tomasz.k@company.com', role: 'Operator', avatarColor: '#2F80ED', lastActive: '4 hours ago', status: 'active' },
  { id: 'member-11', name: 'Karen Wells', email: 'karen.w@company.com', role: 'Support Agent', avatarColor: '#FF9800', lastActive: 'Online now', status: 'active' },
  { id: 'member-12', name: 'Chris Anderson', email: 'chris.a@company.com', role: 'Operator', avatarColor: '#00BCD4', lastActive: '6 hours ago', status: 'active' },
  { id: 'member-13', name: 'new.hire@company.com', email: 'new.hire@company.com', role: 'Operator', avatarColor: '#7F7F7F', lastActive: 'Invited', status: 'invited' },
];

export function MembersPage() {
  const [members] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeGroupFilter, setActiveGroupFilter] = useState<string | null>(null);
  const { groups } = useGroups();

  // Build a map: memberId -> list of groups they belong to
  const memberGroupsMap = useMemo(() => {
    const map: Record<string, Array<{ id: string; name: string; color: string }>> = {};
    for (const group of groups) {
      for (const gm of group.members) {
        if (!map[gm.id]) map[gm.id] = [];
        map[gm.id].push({ id: group.id, name: group.name, color: group.color });
      }
    }
    return map;
  }, [groups]);

  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = activeGroupFilter
      ? (memberGroupsMap[member.id] || []).some(g => g.id === activeGroupFilter)
      : true;

    return matchesSearch && matchesGroup;
  });

  const toggleMemberSelection = (id: string) => {
    setSelectedMembers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case 'Owner': return <Crown size={14} className="text-accent" />;
      case 'Admin': return <Shield size={14} className="text-primary" />;
      case 'Operator': return <Wrench size={14} style={{ color: '#FF9800' }} />;
      case 'Support Agent': return <Headphones size={14} style={{ color: '#00BCD4' }} />;
      case 'Content Creator': return <Palette size={14} style={{ color: '#9C27B0' }} />;
    }
  };

  const getRoleColor = (role: MemberRole) => {
    switch (role) {
      case 'Owner': return { color: 'var(--accent)', background: 'rgba(47, 128, 237, 0.1)' };
      case 'Admin': return { color: 'var(--primary)', background: 'rgba(47, 128, 237, 0.1)' };
      case 'Operator': return { color: '#FF9800', background: 'rgba(255, 152, 0, 0.1)' };
      case 'Support Agent': return { color: '#00BCD4', background: 'rgba(0, 188, 212, 0.1)' };
      case 'Content Creator': return { color: '#9C27B0', background: 'rgba(156, 39, 176, 0.1)' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-card px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-foreground" style={{
                fontSize: 'var(--text-h2)',
                fontWeight: 'var(--font-weight-bold)',
              }}>
                Members
              </h1>
              <span className="px-2 py-0.5 text-[10px] bg-primary/8 text-primary rounded-full" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                {members.length}
              </span>
            </div>
            <p className="text-muted/70" style={{ fontSize: 'var(--text-sm)' }}>
              Manage workspace members and their permissions
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/10">
            <Users size={13} className="text-primary" />
            <span className="text-[11px] text-primary" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {members.filter(m => m.lastActive === 'Online now').length} online
            </span>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="border-b border-border/40 bg-card px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-secondary/30 border border-border rounded-lg focus-within:border-primary focus-within:bg-card focus-within:shadow-sm focus-within:shadow-primary/5 transition-all">
            <Search size={15} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground outline-none ring-0 border-none placeholder:text-muted focus:outline-none focus:ring-0"
            />
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all flex-shrink-0"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            <Mail size={16} />
            <span>Invite Members</span>
          </button>
        </div>
      </div>

      {/* Group Filter Chips */}
      {groups.length > 0 && (
        <div className="border-b border-border/40 bg-card px-4 sm:px-6 py-2.5 flex items-center gap-2 flex-wrap">
          <span className="text-muted mr-1" style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-bold)',
          }}>
            Groups:
          </span>
          {groups.map((group) => {
            const isActive = activeGroupFilter === group.id;
            return (
              <button
                key={group.id}
                onClick={() => setActiveGroupFilter(isActive ? null : group.id)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full transition-all"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  border: `1.5px solid ${group.color}`,
                  color: isActive ? '#FFFFFF' : group.color,
                  background: isActive ? group.color : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <span>{group.name}</span>
                {isActive && <X size={13} />}
              </button>
            );
          })}
        </div>
      )}

      {/* Members List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 custom-scrollbar">
        {/* Result count */}
        <div className="mb-3 text-muted" style={{ fontSize: 'var(--text-sm)' }}>
          {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
          {activeGroupFilter && (() => {
            const g = groups.find(g => g.id === activeGroupFilter);
            return g ? ` in ${g.name}` : '';
          })()}
        </div>

        <div className="space-y-1.5">
          {filteredMembers.map((member) => {
            const memberGroups = memberGroupsMap[member.id] || [];
            const roleStyle = getRoleColor(member.role);
            const isOnline = member.lastActive === 'Online now';

            return (
              <div
                key={member.id}
                className="group bg-card border border-border rounded-xl p-4 hover:border-primary/25 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMembers.has(member.id)}
                      onChange={() => toggleMemberSelection(member.id)}
                      className="w-4 h-4 rounded border-border accent-[#2F80ED] cursor-pointer"
                    />
                  </label>

                  {/* Avatar with online indicator */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{
                        backgroundColor: member.status === 'invited' ? '#C2C9DB' : member.avatarColor,
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    {isOnline && (
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card"
                        style={{ backgroundColor: '#11E874', boxShadow: '0 0 6px rgba(17,232,116,0.4)' }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-foreground truncate" style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}>
                        {member.name}
                      </h3>
                      {member.status === 'invited' && (
                        <span className="px-2 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] rounded-full flex-shrink-0" style={{
                          fontSize: '10px',
                          fontWeight: 'var(--font-weight-bold)',
                        }}>
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-muted truncate" style={{ fontSize: 'var(--text-sm)' }}>
                      {member.email}
                    </p>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{
                      color: roleStyle.color,
                      background: roleStyle.background,
                    }}>
                      {getRoleIcon(member.role)}
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-bold)',
                        whiteSpace: 'nowrap',
                      }}>
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* Groups */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end" style={{ minWidth: '120px', maxWidth: '260px' }}>
                    {memberGroups.length > 0 ? (
                      memberGroups.map((g) => (
                        <span
                          key={g.id}
                          className="inline-flex items-center px-2.5 py-1 rounded-full"
                          style={{
                            fontSize: '11px',
                            fontWeight: 'var(--font-weight-bold)',
                            color: g.color,
                            background: `${g.color}15`,
                            whiteSpace: 'nowrap',
                            lineHeight: '1.2',
                          }}
                        >
                          {g.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted" style={{
                        fontSize: '11px',
                        fontStyle: 'italic',
                      }}>
                        No groups
                      </span>
                    )}
                  </div>

                  {/* Last Active */}
                  <div className="w-28 text-right flex-shrink-0">
                    {isOnline ? (
                      <span className="text-[#0a9e4a]" style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}>
                        Online now
                      </span>
                    ) : (
                      <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                        {member.lastActive}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0 md:opacity-0 md:group-hover:opacity-100">
                    <MoreVertical size={16} className="text-muted" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredMembers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl mb-5" style={{ boxShadow: '0 8px 32px rgba(47,128,237,0.06)' }}>
                <Users size={32} className="text-primary/40" />
              </div>
              <h3 className="text-[15px] text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                No members found
              </h3>
              <p className="text-xs text-muted text-center max-w-[260px] leading-relaxed">
                {activeGroupFilter ? 'No members match this group filter' : 'Try adjusting your search query'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-md m-4" style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }} onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-border/60 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Mail size={20} />
                </div>
                <div>
                  <h2 className="text-foreground" style={{
                    fontSize: 'var(--text-h3)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}>
                    Invite Members
                  </h2>
                  <p className="text-xs text-muted mt-0.5">Send invitations to join your workspace</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-foreground mb-2" style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                }}>
                  Email addresses
                </label>
                <textarea
                  placeholder="Enter email addresses separated by commas..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  style={{ fontSize: 'var(--text-sm)' }}
                />
              </div>
              <div>
                <label className="block text-foreground mb-2" style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                }}>
                  Role
                </label>
                <select className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer" style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                }}>
                  <option>Operator</option>
                  <option>Support Agent</option>
                  <option>Content Creator</option>
                  <option>Admin</option>
                </select>
              </div>
            </div>
            <div className="border-t border-border/60 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2.5 text-foreground bg-card border border-border hover:bg-secondary hover:border-primary/20 rounded-lg transition-all"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                Send Invites
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

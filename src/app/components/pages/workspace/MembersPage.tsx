import { useState, useMemo } from 'react';
import { Search, Plus, Mail, MoreVertical, Crown, Shield, User as UserIcon, Trash2, Wrench, Headphones, Palette, X } from 'lucide-react';
import { useGroups } from '@/app/contexts/GroupsContext';

type MemberRole = 'Owner' | 'Admin' | 'Operator' | 'Support Agent' | 'Content Creator';

interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  avatar?: string;
  lastActive: string;
  status: 'active' | 'invited';
}

const mockMembers: Member[] = [
  { id: 'member-1', name: 'Akira Jameson', email: 'akira.j@company.com', role: 'Owner', lastActive: 'Online now', status: 'active' },
  { id: 'member-4', name: 'Daniel Becker', email: 'daniel.b@company.com', role: 'Admin', lastActive: '2 hours ago', status: 'active' },
  { id: 'member-2', name: 'Ming Sun', email: 'ming.s@company.com', role: 'Operator', lastActive: '1 day ago', status: 'active' },
  { id: 'member-9', name: 'Rachel Torres', email: 'rachel.t@company.com', role: 'Support Agent', lastActive: '3 days ago', status: 'active' },
  { id: 'member-5', name: 'Sophie Laurent', email: 'sophie.l@company.com', role: 'Admin', lastActive: 'Online now', status: 'active' },
  { id: 'member-10', name: 'James Mitchell', email: 'james.m@company.com', role: 'Content Creator', lastActive: '5 hours ago', status: 'active' },
  { id: 'member-3', name: 'Priya Kapoor', email: 'priya.k@company.com', role: 'Operator', lastActive: '12 hours ago', status: 'active' },
  { id: 'member-6', name: 'Erik Nilsson', email: 'erik.n@company.com', role: 'Support Agent', lastActive: '1 day ago', status: 'active' },
  { id: 'member-7', name: 'Lucia Rossi', email: 'lucia.r@company.com', role: 'Content Creator', lastActive: '2 days ago', status: 'active' },
  { id: 'member-8', name: 'Tomasz Kowalski', email: 'tomasz.k@company.com', role: 'Operator', lastActive: '4 hours ago', status: 'active' },
  { id: 'member-11', name: 'Karen Wells', email: 'karen.w@company.com', role: 'Support Agent', lastActive: 'Online now', status: 'active' },
  { id: 'member-12', name: 'Chris Anderson', email: 'chris.a@company.com', role: 'Operator', lastActive: '6 hours ago', status: 'active' },
  { id: 'member-13', name: 'new.hire@company.com', email: 'new.hire@company.com', role: 'Operator', lastActive: 'Invited', status: 'invited' },
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
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: 'var(--font-family)' }}>
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-foreground mb-1" style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 'var(--font-weight-bold)',
          fontFamily: 'var(--font-family)'
        }}>
          Members
        </h1>
        <p className="text-muted" style={{
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-family)'
        }}>
          Manage workspace members and their permissions
        </p>
      </div>

      {/* Actions Bar */}
      <div className="border-b border-border bg-card px-6 py-3 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-[var(--radius)] text-foreground placeholder:text-muted"
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)'
            }}
          />
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-[var(--radius)] hover:bg-primary/90 transition-colors"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-bold)',
            fontFamily: 'var(--font-family)'
          }}
        >
          <Mail size={16} />
          <span>Invite Members</span>
        </button>
      </div>

      {/* Group Filter Chips */}
      {groups.length > 0 && (
        <div className="border-b border-border bg-card px-6 py-2.5 flex items-center gap-2 flex-wrap">
          <span className="text-muted mr-1" style={{
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family)',
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
                  fontFamily: 'var(--font-family)',
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
      <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        {/* Result count */}
        <div className="mb-3 text-muted" style={{
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-family)',
        }}>
          {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
          {activeGroupFilter && (() => {
            const g = groups.find(g => g.id === activeGroupFilter);
            return g ? ` in ${g.name}` : '';
          })()}
        </div>

        <div className="space-y-2">
          {filteredMembers.map((member) => {
            const memberGroups = memberGroupsMap[member.id] || [];
            const roleStyle = getRoleColor(member.role);

            return (
              <div
                key={member.id}
                className="bg-card border border-border rounded-[var(--radius)] p-4 hover:border-primary/50 transition-colors"
                style={{ boxShadow: 'var(--elevation-sm)' }}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMembers.has(member.id)}
                      onChange={() => toggleMemberSelection(member.id)}
                      className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                    />
                  </label>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground flex-shrink-0" style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-foreground truncate" style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-weight-bold)',
                        fontFamily: 'var(--font-family)'
                      }}>
                        {member.name}
                      </h3>
                      {member.status === 'invited' && (
                        <span className="px-2 py-0.5 bg-muted/20 text-muted rounded-[var(--radius)] flex-shrink-0" style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-family)'
                        }}>
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-muted truncate" style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      {member.email}
                    </p>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)]" style={{
                      color: roleStyle.color,
                      background: roleStyle.background,
                    }}>
                      {getRoleIcon(member.role)}
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-bold)',
                        fontFamily: 'var(--font-family)',
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
                            fontFamily: 'var(--font-family)',
                            color: g.color,
                            background: `${g.color}26`,
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
                        fontFamily: 'var(--font-family)',
                        fontStyle: 'italic',
                      }}>
                        No groups
                      </span>
                    )}
                  </div>

                  {/* Last Active */}
                  <div className="w-28 text-right flex-shrink-0">
                    <p className="text-muted" style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      {member.lastActive}
                    </p>
                  </div>

                  {/* Actions */}
                  <button className="p-2 hover:bg-secondary rounded-[var(--radius)] transition-colors flex-shrink-0">
                    <MoreVertical size={18} className="text-muted" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted" style={{
                fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-family)',
              }}>
                No members found
                {activeGroupFilter ? ' in this group' : ''}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
          <div className="bg-card border border-border rounded-[var(--radius)] w-full max-w-md m-4" style={{ boxShadow: 'var(--elevation-lg)' }} onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-foreground" style={{
                fontSize: 'var(--text-h3)',
                fontWeight: 'var(--font-weight-bold)',
                fontFamily: 'var(--font-family)'
              }}>
                Invite Members
              </h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-foreground mb-2" style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
                }}>
                  Email addresses
                </label>
                <textarea
                  placeholder="Enter email addresses separated by commas..."
                  rows={4}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-[var(--radius)] text-foreground placeholder:text-muted resize-none"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)'
                  }}
                />
              </div>
              <div>
                <label className="block text-foreground mb-2" style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
                }}>
                  Role
                </label>
                <select className="w-full px-3 py-2 bg-input-background border border-border rounded-[var(--radius)] text-foreground" style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)'
                }}>
                  <option>Operator</option>
                  <option>Support Agent</option>
                  <option>Content Creator</option>
                  <option>Admin</option>
                </select>
              </div>
            </div>
            <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-foreground hover:bg-secondary rounded-[var(--radius)] transition-colors"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-[var(--radius)] hover:bg-primary/90 transition-colors"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
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

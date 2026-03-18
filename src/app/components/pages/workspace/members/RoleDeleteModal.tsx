import { AlertTriangle, Trash2, Users } from 'lucide-react';

interface RoleDeleteModalProps {
  roleName: string;
  memberCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  onAssignRole?: () => void;
}

export function RoleDeleteModal({ roleName, memberCount, onConfirm, onCancel, onAssignRole }: RoleDeleteModalProps) {
  const blocked = memberCount > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-xl w-full max-w-[420px] overflow-hidden"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}
      >
        <div className="px-6 py-5">
          {/* Icon and Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              blocked ? 'bg-[#F59E0B]/10' : 'bg-destructive/10'
            }`}>
              <AlertTriangle size={20} className={blocked ? 'text-[#F59E0B]' : 'text-destructive'} />
            </div>
            <div>
              <h3 className="text-foreground" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                {blocked ? 'Cannot Delete Role' : 'Delete Role'}
              </h3>
              <p className="text-xs text-muted mt-0.5">
                {blocked ? 'Members must be reassigned first' : 'This action cannot be undone'}
              </p>
            </div>
          </div>

          {/* Content */}
          {blocked ? (
            <>
              <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                You cannot delete the <strong className="text-foreground">"{roleName}"</strong> role until all members have been assigned a new role.
              </p>
              <div className="px-4 py-3 rounded-xl bg-[#F59E0B]/[0.04] border border-[#F59E0B]/15">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={14} className="text-[#F59E0B]" />
                  <p className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                    {memberCount} member{memberCount > 1 ? 's' : ''} assigned
                  </p>
                </div>
                <p className="text-xs text-muted ml-5">
                  Assign them to a different role to proceed
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-foreground/80 leading-relaxed">
              Are you sure you want to delete the <strong className="text-foreground">"{roleName}"</strong> role?
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end px-6 py-4 border-t border-border/60">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-sm bg-card text-foreground border border-border rounded-lg hover:bg-secondary hover:border-primary/20 transition-all"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            Cancel
          </button>
          {blocked ? (
            <button
              onClick={onAssignRole}
              className="px-5 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all flex items-center gap-2"
              style={{ fontWeight: 'var(--font-weight-bold)' }}
            >
              <Users size={15} />
              Assign New Role
            </button>
          ) : (
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 text-sm bg-destructive text-white rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-destructive/20 transition-all flex items-center gap-2"
              style={{ fontWeight: 'var(--font-weight-bold)' }}
            >
              <Trash2 size={15} />
              Delete Role
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
import { AlertTriangle } from 'lucide-react';

interface RoleDeleteModalProps {
  roleName: string;
  memberCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  onAssignRole?: () => void;
}

export function RoleDeleteModal({ roleName, memberCount, onConfirm, onCancel, onAssignRole }: RoleDeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-lg shadow-elevation-lg w-full max-w-[420px]"
        style={{ border: '1px solid var(--border)' }}
      >
        <div className="p-6 flex flex-col gap-5">
          {/* Icon and Title */}
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: memberCount > 0 ? 'var(--secondary)' : 'var(--destructive-background, rgba(239, 68, 68, 0.1))' }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: memberCount > 0 ? 'var(--primary)' : 'var(--destructive)' }} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}>
                {memberCount > 0 ? 'Cannot Delete Role' : 'Delete Role'}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
                {memberCount > 0 ? 'Members must be reassigned first' : 'This action cannot be undone'}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3">
            {memberCount > 0 ? (
              <>
                <p className="text-sm" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}>
                  You cannot delete the <span className="font-bold" style={{ fontFamily: 'var(--font-family)' }}>"{roleName}"</span> role until all members with this role have been assigned a new role.
                </p>
                <div
                  className="px-4 py-3 rounded-lg"
                  style={{ backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius)' }}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}>
                    {memberCount} member{memberCount > 1 ? 's are' : ' is'} currently assigned to this role
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
                    Assign them to a different role to proceed with deletion
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}>
                  Are you sure you want to delete the <span className="font-bold" style={{ fontFamily: 'var(--font-family)' }}>"{roleName}"</span> role?
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-sm rounded-lg border hover:bg-secondary transition-colors"
              style={{ 
                color: 'var(--foreground)', 
                fontFamily: 'var(--font-family)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius)',
              }}
            >
              Cancel
            </button>
            {memberCount > 0 ? (
              <button
                onClick={onAssignRole}
                className="px-5 py-2.5 text-sm rounded-lg transition-opacity"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  fontFamily: 'var(--font-family)',
                  borderRadius: 'var(--radius)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Assign New Role
              </button>
            ) : (
              <button
                onClick={onConfirm}
                className="px-5 py-2.5 text-sm rounded-lg transition-opacity"
                style={{ 
                  backgroundColor: 'var(--destructive)',
                  color: 'var(--destructive-foreground)',
                  fontFamily: 'var(--font-family)',
                  borderRadius: 'var(--radius)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Delete Role
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
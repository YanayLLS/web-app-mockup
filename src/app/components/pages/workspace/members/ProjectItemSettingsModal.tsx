import { X } from 'lucide-react';

interface ProjectNode {
  id: string;
  name: string;
  type: 'project' | 'folder' | 'item';
  children?: ProjectNode[];
}

interface ProjectItemSettingsModalProps {
  node: ProjectNode;
  onClose: () => void;
}

export function ProjectItemSettingsModal({ node, onClose }: ProjectItemSettingsModalProps) {
  const nodeTypeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-lg shadow-lg flex flex-col"
        style={{
          backgroundColor: 'var(--card)',
          maxWidth: '600px',
          maxHeight: '80vh',
          margin: 'var(--spacing-4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between border-b flex-shrink-0"
          style={{
            padding: 'var(--spacing-4)',
            borderColor: 'var(--border)',
          }}
        >
          <h2 
            style={{
              
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--foreground)',
            }}
          >
            {nodeTypeLabel} Settings
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg transition-colors"
            style={{
              padding: 'var(--spacing-2)',
              color: 'var(--muted)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div 
          className="overflow-y-auto flex-1"
          style={{
            padding: 'var(--spacing-6)',
          }}
        >
          {/* Name Section */}
          <div 
            className="flex flex-col"
            style={{
              gap: 'var(--spacing-3)',
              marginBottom: 'var(--spacing-6)',
            }}
          >
            <label 
              style={{
                
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--foreground)',
              }}
            >
              Name
            </label>
            <input
              type="text"
              defaultValue={node.name}
              className="rounded-lg border transition-colors"
              style={{
                padding: 'var(--spacing-2-5)',
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                
                fontSize: 'var(--text-base)',
                borderRadius: 'var(--radius)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.outline = '2px solid var(--primary-background)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.outline = 'none';
              }}
            />
          </div>

          {/* Description Section */}
          <div 
            className="flex flex-col"
            style={{
              gap: 'var(--spacing-3)',
              marginBottom: 'var(--spacing-6)',
            }}
          >
            <label 
              style={{
                
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--foreground)',
              }}
            >
              Description
            </label>
            <textarea
              placeholder={`Add a description for this ${node.type}...`}
              rows={4}
              className="rounded-lg border transition-colors resize-none"
              style={{
                padding: 'var(--spacing-2-5)',
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                
                fontSize: 'var(--text-base)',
                borderRadius: 'var(--radius)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.outline = '2px solid var(--primary-background)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.outline = 'none';
              }}
            />
          </div>

          {/* Type and ID Info */}
          <div 
            className="flex flex-col rounded-lg border"
            style={{
              gap: 'var(--spacing-2)',
              padding: 'var(--spacing-4)',
              borderColor: 'var(--border)',
              backgroundColor: 'var(--secondary)',
            }}
          >
            <div className="flex justify-between">
              <span 
                style={{
                  
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted)',
                }}
              >
                Type
              </span>
              <span 
                style={{
                  
                  fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {nodeTypeLabel}
              </span>
            </div>
            <div className="flex justify-between">
              <span 
                style={{
                  
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted)',
                }}
              >
                ID
              </span>
              <span 
                style={{
                  
                  fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {node.id}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-end border-t flex-shrink-0"
          style={{
            padding: 'var(--spacing-4)',
            gap: 'var(--spacing-2)',
            borderColor: 'var(--border)',
          }}
        >
          <button
            onClick={onClose}
            className="rounded-lg transition-colors"
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--foreground)',
              borderRadius: 'var(--radius)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Save logic would go here
              console.log('Saving settings for:', node);
              onClose();
            }}
            className="rounded-lg transition-colors"
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--primary-foreground)',
              backgroundColor: 'var(--primary)',
              borderRadius: 'var(--radius)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

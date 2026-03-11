import { useState } from 'react';
import { QrCode, Plus, Download, Copy, MoreVertical } from 'lucide-react';

interface QRCodeItem {
  id: string;
  name: string;
  url: string;
  scans: number;
  createdAt: string;
}

const mockQRCodes: QRCodeItem[] = [
  { id: '1', name: 'Product Demo', url: 'https://demo.example.com', scans: 847, createdAt: '2026-01-15' },
  { id: '2', name: 'Support Portal', url: 'https://support.example.com', scans: 1203, createdAt: '2026-01-10' },
  { id: '3', name: 'Training Materials', url: 'https://training.example.com', scans: 532, createdAt: '2026-02-01' },
];

export function StaticQRCodesPage() {
  const [qrCodes] = useState<QRCodeItem[]>(mockQRCodes);

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: 'var(--font-family)' }}>
      <div className="border-b border-border bg-card px-4 sm:px-6 py-4">
        <h1 className="text-foreground mb-1" style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 'var(--font-weight-bold)',
          fontFamily: 'var(--font-family)'
        }}>
          Static QR Codes
        </h1>
        <p className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
          Create and manage QR codes for your workspace
        </p>
      </div>

      <div className="border-b border-border bg-card px-4 sm:px-6 py-3">
        <button className="flex items-center gap-2 px-4 py-2 min-h-[44px] bg-primary text-primary-foreground rounded-[var(--radius)] hover:bg-primary/90 transition-colors" style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-bold)',
          fontFamily: 'var(--font-family)'
        }}>
          <Plus size={16} />
          <span>Create QR Code</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 custom-scrollbar">
        <div className="space-y-3">
          {qrCodes.map((qr) => (
            <div key={qr.id} className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-5 hover:border-primary/50 transition-colors" style={{ boxShadow: 'var(--elevation-sm)' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* QR Code Preview */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[var(--radius)] bg-secondary flex items-center justify-center flex-shrink-0">
                  <QrCode size={40} className="text-foreground sm:hidden" />
                  <QrCode size={48} className="text-foreground hidden sm:block" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground mb-1" style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-bold)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    {qr.name}
                  </h3>
                  <p className="text-muted mb-2 truncate" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                    {qr.url}
                  </p>
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                    <span>{qr.scans} scans</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Created {qr.createdAt}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-[var(--radius)] transition-colors" title="Copy URL">
                    <Copy size={18} className="text-muted" />
                  </button>
                  <button className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-[var(--radius)] transition-colors" title="Download">
                    <Download size={18} className="text-muted" />
                  </button>
                  <button className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-[var(--radius)] transition-colors">
                    <MoreVertical size={18} className="text-muted" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

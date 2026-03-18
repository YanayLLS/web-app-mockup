import { useState } from 'react';
import { QrCode, Plus, Download, Copy, MoreVertical, BarChart3, Link2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeItem {
  id: string;
  name: string;
  url: string;
  scans: number;
  createdAt: string;
  color: string;
}

const mockQRCodes: QRCodeItem[] = [
  { id: '1', name: 'Product Demo', url: 'https://demo.example.com', scans: 847, createdAt: '2026-01-15', color: '#2F80ED' },
  { id: '2', name: 'Support Portal', url: 'https://support.example.com', scans: 1203, createdAt: '2026-01-10', color: '#8B5CF6' },
  { id: '3', name: 'Training Materials', url: 'https://training.example.com', scans: 532, createdAt: '2026-02-01', color: '#11E874' },
];

export function StaticQRCodesPage() {
  const [qrCodes] = useState<QRCodeItem[]>(mockQRCodes);
  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scans, 0);

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: 'var(--font-family)' }}>
      <div className="border-b border-border/60 bg-card px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground mb-1" style={{
              fontSize: 'var(--text-h2)',
              fontWeight: 'var(--font-weight-bold)',
            }}>
              Static QR Codes
            </h1>
            <p className="text-muted/70" style={{ fontSize: 'var(--text-sm)' }}>
              Create and manage QR codes for your workspace
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/10">
              <BarChart3 size={13} className="text-primary" />
              <span className="text-[11px] text-primary" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                {totalScans.toLocaleString()} total scans
              </span>
            </div>
            <button
              onClick={() => toast.success('Create QR Code dialog opened')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
            >
              <Plus size={16} />
              <span>Create QR Code</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 custom-scrollbar">
        <div className="max-w-4xl space-y-3">
          {qrCodes.map((qr) => (
            <div key={qr.id} className="group bg-card border border-border rounded-xl p-5 hover:border-primary/20 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* QR Code Preview */}
                <div
                  className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${qr.color}10`, border: `1.5px solid ${qr.color}20` }}
                >
                  <QrCode size={36} style={{ color: qr.color }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground text-sm mb-1.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {qr.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Link2 size={12} className="text-muted/50 shrink-0" />
                    <p className="text-xs text-primary/70 truncate">{qr.url}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px]" style={{ background: `${qr.color}10`, color: qr.color, fontWeight: 'var(--font-weight-bold)' }}>
                      <BarChart3 size={10} />
                      {qr.scans.toLocaleString()} scans
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted">
                      <Calendar size={10} />
                      Created {qr.createdAt}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toast.success(`URL copied: ${qr.url}`)}
                    className="p-2 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
                    title="Copy URL"
                  >
                    <Copy size={16} className="text-muted group-hover:text-foreground transition-colors" />
                  </button>
                  <button
                    onClick={() => toast.success(`Downloading ${qr.name} QR code`)}
                    className="p-2 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
                    title="Download QR Code"
                  >
                    <Download size={16} className="text-muted group-hover:text-foreground transition-colors" />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    title="More options"
                  >
                    <MoreVertical size={16} className="text-muted" />
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

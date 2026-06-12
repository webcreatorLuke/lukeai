// src/components/ui/InstallButton.jsx
import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '@hooks/usePWAInstall';
import toast from 'react-hot-toast';

export default function InstallButton({ className = '' }) {
  const { isInstallable, isInstalled, isIOSSafari, promptInstall } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled) return null;
  if (!isInstallable && !isIOSSafari) return null;

  async function handleClick() {
    if (isIOSSafari) {
      setShowIOSModal(true);
      return;
    }
    const accepted = await promptInstall();
    if (accepted) toast.success('LukeAI installed!');
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`btn-secondary flex items-center gap-2 text-sm ${className}`}
      >
        <Download size={14} />
        <span>Download App</span>
      </button>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
             onClick={() => setShowIOSModal(false)}>
          <div className="bg-surface-overlay border border-surface-border rounded-2xl p-6 max-w-sm w-full space-y-4"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-text-primary">Install LukeAI</h3>
              <button onClick={() => setShowIOSModal(false)} className="btn-ghost p-1.5">
                <X size={16} />
              </button>
            </div>
            <ol className="text-sm text-text-secondary space-y-3 list-decimal list-inside">
              <li className="flex items-center gap-2">
                Tap the <Share size={16} className="text-blue-400 inline" /> Share button in Safari
              </li>
              <li>Scroll down and tap <strong className="text-text-primary">"Add to Home Screen"</strong></li>
              <li>Tap <strong className="text-text-primary">"Add"</strong> in the top right</li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}

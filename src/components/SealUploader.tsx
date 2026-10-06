import React, { useRef, useState } from 'react';
import { SealConfig } from '../utils/pdf';
import { Stamp, Upload, X, Check, Image as ImageIcon } from 'lucide-react';

interface SealUploaderProps {
  sealConfig: SealConfig | null;
  onSealChange: (config: SealConfig | null) => void;
}

export const SealUploader: React.FC<SealUploaderProps> = ({
  sealConfig,
  onSealChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [placement, setPlacement] = useState<SealConfig['placement']>('cover_only');
  const [position, setPosition] = useState<SealConfig['position']>('bottom_right');
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.includes('png')) {
        alert('Please upload a PNG image with transparency for the official seal/signature.');
        return;
      }

      const buffer = await file.arrayBuffer();
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      onSealChange({
        pngBuffer: buffer,
        placement,
        position,
      });
    }
  };

  const handlePlacementChange = (newPlacement: SealConfig['placement']) => {
    setPlacement(newPlacement);
    if (sealConfig) {
      onSealChange({
        ...sealConfig,
        placement: newPlacement,
      });
    }
  };

  const handlePositionChange = (newPosition: SealConfig['position']) => {
    setPosition(newPosition);
    if (sealConfig) {
      onSealChange({
        ...sealConfig,
        position: newPosition,
      });
    }
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onSealChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <Stamp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
              Official Seal / Signature Stamp <span className="font-normal text-slate-400 dark:text-slate-500">(Optional Bonus)</span>
            </h5>
            <p className="text-2xs text-slate-500 dark:text-slate-400">
              Embed transparent PNG authorization stamp on selected pages
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          {isOpen ? 'Hide Options' : sealConfig ? 'Edit Stamp' : '+ Add Stamp'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png"
            onChange={handleFileChange}
            className="hidden"
          />

          {!sealConfig ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-3.5 text-center cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors bg-white/60 dark:bg-slate-900/40"
            >
              <Upload className="w-5 h-5 mx-auto text-slate-400 dark:text-slate-500 mb-1" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Choose Seal / Signature PNG</span>
              <p className="text-2xs text-slate-400 dark:text-slate-500 mt-0.5">Transparent PNG recommended (max 2 MB)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Seal Preview"
                    className="w-10 h-10 object-contain rounded bg-white border border-slate-200 p-0.5"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">Stamp Ready</span>
                  <span className="text-2xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Will be stamped above page footers
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-semibold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          )}

          {sealConfig && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-2xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Target Page
                </label>
                <select
                  value={placement}
                  onChange={e => handlePlacementChange(e.target.value as any)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-1.5 text-slate-700 dark:text-slate-200"
                >
                  <option value="cover_only">Cover Page Only</option>
                  <option value="index_only">Index Page Only</option>
                  <option value="last_page">Last Page of Package</option>
                  <option value="all_pages">Every Page</option>
                </select>
              </div>

              <div>
                <label className="text-2xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Position
                </label>
                <select
                  value={position}
                  onChange={e => handlePositionChange(e.target.value as any)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-1.5 text-slate-700 dark:text-slate-200"
                >
                  <option value="bottom_right">Bottom Right (Standard)</option>
                  <option value="bottom_center">Bottom Center</option>
                  <option value="bottom_left">Bottom Left</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

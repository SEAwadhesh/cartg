import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { SiteSettings } from '../../types';
import { 
  Sliders, 
  Palette, 
  Sparkles, 
  Share2, 
  Search, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  Check, 
  AlertTriangle,
  Megaphone,
  Globe
} from 'lucide-react';
import { themePresets } from '../../utils/theme';

export const AdminSettings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    exportDatabaseJson, 
    importDatabaseJson, 
    resetToDefaults, 
    addToast 
  } = useData();

  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateSettings(formData);
      setIsSaving(false);
      addToast('success', 'Settings Updated', 'Website theme, SEO tags, and hero copy updated.');
    }, 400);
  };

  const handleExport = () => {
    const json = exportDatabaseJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supermarket-data-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Backup Downloaded', 'Full supermarket database JSON exported.');
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const ok = importDatabaseJson(importJsonText.trim());
    if (ok) {
      addToast('success', 'Backup Restored', 'Database restored successfully.');
      setIsImportModalOpen(false);
      setImportJsonText('');
    } else {
      addToast('error', 'Import Failed', 'Invalid JSON backup format.');
    }
  };

  const handleReset = () => {
    resetToDefaults();
    setIsResetConfirmOpen(false);
    addToast('info', 'Reset Complete', 'Default supermarket inventory and store data restored.');
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">SEO, Theme & System Settings</h1>
          <p className="text-xs text-neutral-500">Configure visual themes, homepage banners, social handles, and database backups</p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-60 shrink-0 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Applying Changes...' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* Theme & Palette Presets */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Palette className="w-4 h-4 text-emerald-600" />
          <span>Website Theme & Visual Brand Color</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(themePresets).map(([key, preset]) => {
            const isSelected = formData.themeColor === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleChange('themeColor', key)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900'
                    : 'border-neutral-200 bg-white hover:border-neutral-400'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full shadow-inner flex items-center justify-center text-white"
                  style={{ backgroundColor: preset.primaryHex }}
                >
                  {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                </div>
                <span className="text-xs font-bold text-neutral-800 capitalize">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Section Copy Customizer */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Homepage Hero Section Copy & CTA</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Hero Title Prefix</label>
            <input
              type="text"
              value={formData.heroTitle}
              onChange={(e) => handleChange('heroTitle', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Highlighted Text (Gradient Accent)</label>
            <input
              type="text"
              value={formData.heroHighlightText}
              onChange={(e) => handleChange('heroHighlightText', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-bold text-emerald-700"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Hero Subtitle</label>
            <textarea
              rows={2}
              value={formData.heroSubtitle}
              onChange={(e) => handleChange('heroSubtitle', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Primary CTA Button Text</label>
            <input
              type="text"
              value={formData.primaryCtaText}
              onChange={(e) => handleChange('primaryCtaText', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Secondary CTA Button Text</label>
            <input
              type="text"
              value={formData.secondaryCtaText}
              onChange={(e) => handleChange('secondaryCtaText', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Hero Featured Image URL</label>
            <input
              type="url"
              value={formData.heroImageUrl}
              onChange={(e) => handleChange('heroImageUrl', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Announcement Bar & Top Notice */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Megaphone className="w-4 h-4 text-emerald-600" />
          <span>Top Header Announcement Bar</span>
        </h2>

        <div className="space-y-4">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-neutral-800">
            <input
              type="checkbox"
              checked={formData.enableAnnouncementBar}
              onChange={(e) => handleChange('enableAnnouncementBar', e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Enable Announcement Bar on Website Header</span>
          </label>

          {formData.enableAnnouncementBar && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Announcement Banner Text</label>
              <input
                type="text"
                value={formData.announcementText || ''}
                onChange={(e) => handleChange('announcementText', e.target.value)}
                placeholder="e.g. Free Blood Pressure & Sugar Checkup Camp Every Saturday!"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* SEO & Meta Tags */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Search className="w-4 h-4 text-emerald-600" />
          <span>SEO & Search Engine Optimization</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Meta Title</label>
            <input
              type="text"
              value={formData.seoTitle || ''}
              onChange={(e) => handleChange('seoTitle', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Meta Description (150-160 characters)</label>
            <textarea
              rows={2}
              value={formData.seoDescription || ''}
              onChange={(e) => handleChange('seoDescription', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">SEO Keywords (comma separated)</label>
            <input
              type="text"
              value={formData.seoKeywords || ''}
              onChange={(e) => handleChange('seoKeywords', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Database Backup & Disaster Recovery */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Data Backup, Export & Restore</span>
        </h2>

        <p className="text-xs text-neutral-600">
          Export your entire supermarket database (products catalog, store gallery, customer reviews, online orders) as a portable JSON file, or restore from a previous backup.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Database JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold border border-neutral-300 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import / Restore JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Initial Template</span>
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-900">Import Supermarket JSON Database</h3>
            <p className="text-xs text-neutral-600">
              Paste the exported JSON content below to restore your store and inventory configuration.
            </p>
            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{"businessInfo": {...}, "products": [...]}'
              className="w-full p-3 rounded-xl border border-neutral-300 text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
              >
                Import & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-neutral-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-neutral-900">Reset all data?</h4>
            <p className="text-xs text-neutral-600">
              This will restore all default data for CartG Supermarket. Any unsaved custom entries will be reset.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="w-1/2 py-2 rounded-xl text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-1/2 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
              >
                Reset Now
              </button>
            </div>
          </div>
        </div>
      )}

    </form>
  );
};

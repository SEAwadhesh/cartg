import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { BusinessInfo, OpeningHour } from '../../types';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Save, 
  MessageCircle, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const AdminBusinessInfo: React.FC = () => {
  const { businessInfo, updateBusinessInfo, addToast } = useData();
  const [formData, setFormData] = useState<BusinessInfo>({ ...businessInfo });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof BusinessInfo, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleHourChange = (index: number, field: keyof OpeningHour, value: any) => {
    setFormData((prev) => {
      const updatedHours = [...prev.openingHours];
      updatedHours[index] = { ...updatedHours[index], [field]: value };
      return { ...prev, openingHours: updatedHours };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      updateBusinessInfo(formData);
      setIsSaving(false);
      addToast('success', 'Changes Saved', 'Supermarket details and operating hours have been updated.');
    }, 400);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Supermarket Profile & Store Schedule</h1>
          <p className="text-xs text-neutral-500">Edit business contact coordinates, store address, Google Maps links, and daily shopping hours</p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-60 shrink-0 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Updates...' : 'Save Store Profile'}</span>
        </button>
      </div>

      {/* General Business Coordinates */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Primary Supermarket Identity</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Store / Business Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Business Category</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Tagline / Motto</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Store Description & Overview</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Years in Business</label>
            <input
              type="number"
              value={formData.experienceYears}
              onChange={(e) => handleChange('experienceYears', Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Satisfied Customers Served Count</label>
            <input
              type="number"
              value={formData.customersServed}
              onChange={(e) => handleChange('customersServed', Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Address & Google Maps Coordinates */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 pb-3 border-b border-neutral-100">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Location & Google Maps Integration</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Bengaluru Location / Display Address</label>
            <input
              type="text"
              required
              placeholder="CartG — HSR Layout, Bengaluru, Karnataka 560102, India"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Locality / Area</label>
            <input
              type="text"
              value={formData.locality}
              onChange={(e) => handleChange('locality', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">State & Postal Code</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="State"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                placeholder="PIN Code"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Google Maps Share URL</label>
            <input
              type="url"
              value={formData.mapsUrl}
              onChange={(e) => handleChange('mapsUrl', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Google Maps Embed URL (iframe src)</label>
            <input
              type="url"
              value={formData.mapsEmbedUrl}
              onChange={(e) => handleChange('mapsEmbedUrl', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Direct Contact Channels */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Phone className="w-4 h-4 text-emerald-600" />
          <span>Communication Lines & WhatsApp</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Primary Telephone</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Alternate Emergency Phone</label>
            <input
              type="text"
              value={formData.alternatePhone || ''}
              onChange={(e) => handleChange('alternatePhone', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">WhatsApp Number (with Country Code)</label>
            <input
              type="text"
              required
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="+919876543210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 7-Day Opening Hours Matrix */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>7-Day Operating Hours Schedule</span>
        </h2>

        <div className="divide-y divide-neutral-100">
          {formData.openingHours.map((hour, idx) => (
            <div key={hour.day} className="py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-3 flex items-center justify-between sm:justify-start gap-2">
                <span className="text-xs font-bold text-neutral-900 w-24">{hour.day}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hour.isOpen}
                    onChange={(e) => handleHourChange(idx, 'isOpen', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="sm:col-span-5 flex items-center gap-2">
                {hour.isOpen ? (
                  <>
                    <input
                      type="text"
                      value={hour.openTime}
                      onChange={(e) => handleHourChange(idx, 'openTime', e.target.value)}
                      placeholder="08:00 AM"
                      className="w-1/2 px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs"
                    />
                    <span className="text-neutral-400 text-xs">to</span>
                    <input
                      type="text"
                      value={hour.closeTime}
                      onChange={(e) => handleHourChange(idx, 'closeTime', e.target.value)}
                      placeholder="08:30 PM"
                      className="w-1/2 px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs"
                    />
                  </>
                ) : (
                  <span className="text-xs font-semibold text-rose-600">Closed</span>
                )}
              </div>

              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={hour.note || ''}
                  onChange={(e) => handleHourChange(idx, 'note', e.target.value)}
                  placeholder="Optional note (e.g. Emergency only)"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs text-neutral-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </form>
  );
};

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Service } from '../../types';
import { 
  Stethoscope, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Search, 
  Tag, 
  Clock, 
  DollarSign, 
  Sparkles,
  AlertTriangle,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { PhotoUpload } from './PhotoUpload';
import { uploadPhoto } from '../../utils/storage';

export const AdminServices: React.FC = () => {
  const { services, addService, updateService, deleteService, addToast } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Groceries & Staples');
  const [price, setPrice] = useState('₹199');
  const [pricePrefix, setPricePrefix] = useState('');
  const [duration, setDuration] = useState('1 kg');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('ShoppingBag');
  const [image, setImage] = useState('');
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [inclusionsText, setInclusionsText] = useState('');

  const openAddModal = () => {
    setEditingService(null);
    setTitle('');
    setCategory('Groceries & Staples');
    setPrice('₹199');
    setPricePrefix('');
    setDuration('1 kg');
    setDescription('');
    setIcon('ShoppingBag');
    setImage('');
    setSelectedPhotoFile(null);
    setFeatured(false);
    setActive(true);
    setInclusionsText('100% Genuine Brand\nQuality Sealed Pack\nInstant Doorstep Delivery');
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setTitle(service.title);
    setCategory(service.category);
    setPrice(typeof service.price === 'number' ? `₹${service.price}` : String(service.price || ''));
    setPricePrefix(service.pricePrefix || '');
    setDuration(service.duration || '');
    setDescription(service.description);
    setIcon(service.icon || 'ShoppingBag');
    setImage(service.image || '');
    setSelectedPhotoFile(null);
    setFeatured(Boolean(service.featured));
    setActive(service.active !== undefined ? Boolean(service.active) : service.inStock !== false);
    setInclusionsText((service.inclusions || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !price.trim()) {
      addToast('error', 'Missing Information', 'Product title and price are required.');
      return;
    }

    setIsSaving(true);

    try {
      let finalImageUrl = image.trim();

      // If administrator selected a direct photo file, upload it to storage
      if (selectedPhotoFile) {
        try {
          const uploadRes = await uploadPhoto(selectedPhotoFile, 'product-images');
          finalImageUrl = uploadRes.url;
        } catch (uploadErr: any) {
          addToast('error', 'Upload Failed', uploadErr?.message || 'Failed to upload product photo. Please try again.');
          setIsSaving(false);
          return;
        }
      }

      // Default fallback placeholder if no photo provided at all
      if (!finalImageUrl) {
        finalImageUrl = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80';
      }

      const inclusions = inclusionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        category: category.trim(),
        price: price.trim(),
        pricePrefix: pricePrefix.trim() || undefined,
        duration: duration.trim() || undefined,
        description: description.trim(),
        icon: icon.trim(),
        image: finalImageUrl,
        featured,
        active,
        order: editingService ? editingService.order : services.length + 1,
        inclusions
      };

      if (editingService) {
        updateService(editingService.id, payload);
        addToast('success', 'Product Updated', `"${title}" has been updated successfully.`);
      } else {
        addService(payload);
        addToast('success', 'Product Created', `"${title}" with photo has been added to store catalog.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      addToast('error', 'Save Failed', err?.message || 'Could not save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteService(id);
    setDeleteConfirmId(null);
    addToast('info', 'Product Removed', 'The item has been removed from store catalog.');
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category)))];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Products & Supermarket Inventory</h1>
          <p className="text-xs text-neutral-500">Add, edit, re-price, or toggle stock availability for grocery, stationery, and daily items</p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groceries, stationery, essentials..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Product Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Unit / Pack</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredServices.map((srv) => (
                <tr key={srv.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={srv.image}
                        alt={srv.title}
                        className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900">{srv.title}</span>
                          {srv.featured && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 line-clamp-1 max-w-sm">{srv.description}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-medium text-neutral-700">
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 text-[11px]">
                      {srv.category}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-bold text-neutral-900">
                    {srv.price}
                    {srv.pricePrefix && (
                      <span className="block text-[10px] text-neutral-400 font-normal">{srv.pricePrefix}</span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-neutral-600">{srv.duration || 'Flexible'}</td>

                  <td className="py-4 px-4">
                    <button
                      type="button"
                      onClick={() => updateService(srv.id, { active: !srv.active })}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                        srv.active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                      }`}
                    >
                      {srv.active ? 'Active' : 'Draft'}
                    </button>
                  </td>

                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(srv)}
                        className="p-1.5 rounded-lg text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Edit Service"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(srv.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-8">
            <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingService ? `Edit Product: ${editingService.title}` : 'Add New Supermarket Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Daawat Basmati Rice / Classmate Notebook"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Groceries & Staples, Stationery & Office, Daily Essentials"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Price *</label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. ₹999 or ₹1,499"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Price Prefix (Optional)</label>
                  <input
                    type="text"
                    value={pricePrefix}
                    onChange={(e) => setPricePrefix(e.target.value)}
                    placeholder="e.g. MRP ₹240 (Save 20%)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Unit / Pack Size</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 1 kg, 500g, Pack of 5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <PhotoUpload
                    label="Product Photo"
                    bucket="product-images"
                    currentImageUrl={image}
                    onImageSelected={(file, preview) => {
                      setSelectedPhotoFile(file);
                      setImage(preview);
                    }}
                    helperText="JPG, PNG, WEBP • Max 5 MB"
                    aspectRatio="square"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Product Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe grocery grade, stationery specifications, brand, or daily usage..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Key Features / Inclusions (one line per point)
                  </label>
                  <textarea
                    rows={3}
                    value={inclusionsText}
                    onChange={(e) => setInclusionsText(e.target.value)}
                    placeholder="100% Genuine Brand&#10;Quality Sealed Pack&#10;Instant Doorstep Delivery"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-6 sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Mark as Featured / Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Publish to Live Store</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving & Uploading...</span>
                    </>
                  ) : (
                    <span>Save Product</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-neutral-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-neutral-900">Delete this product?</h4>
            <p className="text-xs text-neutral-600">
              Are you sure you want to remove this product from your supermarket inventory catalog?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="w-1/2 py-2 rounded-xl text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="w-1/2 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

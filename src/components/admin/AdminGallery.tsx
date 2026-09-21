import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { GalleryItem } from '../../types';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Eye, 
  Tag, 
  Check, 
  X, 
  Sparkles,
  AlertTriangle,
  Edit3,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Camera
} from 'lucide-react';
import { PhotoUpload } from './PhotoUpload';
import { uploadPhoto } from '../../utils/storage';

export const AdminGallery: React.FC = () => {
  const { gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem, reorderGallery, addToast } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Store Aisles');
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setImageUrl('');
    setSelectedPhotoFile(null);
    setCaption('');
    setCategory('Store Aisles');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setImageUrl(item.imageUrl);
    setSelectedPhotoFile(null);
    setCaption(item.caption);
    setCategory(item.category || 'Store Aisles');
    setActive(item.active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('error', 'Missing Title', 'Please enter a photo title.');
      return;
    }

    setIsSaving(true);

    try {
      let finalImageUrl = imageUrl.trim();

      // If user picked a direct file from computer/phone, upload it
      if (selectedPhotoFile) {
        try {
          const uploadRes = await uploadPhoto(selectedPhotoFile, 'store-photos');
          finalImageUrl = uploadRes.url;
        } catch (uploadErr: any) {
          addToast('error', 'Upload Failed', uploadErr?.message || 'Failed to upload store photo. Please check your connection.');
          setIsSaving(false);
          return;
        }
      }

      if (!finalImageUrl) {
        addToast('error', 'Photo Required', 'Please select or upload a store photo.');
        setIsSaving(false);
        return;
      }

      if (editingItem) {
        updateGalleryItem(editingItem.id, {
          title: title.trim(),
          imageUrl: finalImageUrl,
          caption: caption.trim() || title.trim(),
          category: category.trim(),
          active
        });
        addToast('success', 'Photo Updated', `"${title}" has been updated.`);
      } else {
        addGalleryItem({
          title: title.trim(),
          imageUrl: finalImageUrl,
          caption: caption.trim() || title.trim(),
          category: category.trim(),
          featured: false,
          active,
          order: gallery.length + 1
        });
        addToast('success', 'Photo Added', 'The store photo has been published to the gallery.');
      }

      setIsModalOpen(false);
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Could not save store photo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteGalleryItem(id);
    setDeleteConfirmId(null);
    addToast('info', 'Photo Deleted', 'Image removed from gallery.');
  };

  const moveItem = (index: number, direction: 'left' | 'right') => {
    const newGallery = [...gallery];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newGallery.length) return;

    const temp = newGallery[index];
    newGallery[index] = newGallery[targetIndex];
    newGallery[targetIndex] = temp;

    // update order numbers
    newGallery.forEach((item, idx) => {
      item.order = idx + 1;
    });

    reorderGallery(newGallery);
    addToast('success', 'Reordered', 'Photo order updated.');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Supermarket Store & Aisle Photos</h1>
          <p className="text-xs text-neutral-500">
            Upload real supermarket photos directly from your phone gallery or desktop.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Store Photo</span>
        </button>
      </div>

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {gallery.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl bg-white border border-neutral-200 shadow-xs overflow-hidden flex flex-col justify-between group"
          >
            <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-neutral-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                {item.category || 'Store'}
              </div>

              {/* Quick Lightbox Preview Trigger */}
              <button
                type="button"
                onClick={() => setPreviewLightboxUrl(item.imageUrl)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-neutral-900/70 text-white hover:bg-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Preview Full Image"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 leading-snug truncate">
                  {item.title}
                </h3>
                <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                  {item.caption}
                </p>
              </div>

              {/* Status & Action Controls */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => updateGalleryItem(item.id, { active: !item.active })}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {item.active ? 'Visible' : 'Hidden'}
                </button>

                <div className="flex items-center gap-1">
                  {/* Reorder Buttons */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, 'left')}
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 disabled:opacity-30 transition-colors"
                    title="Move Earlier"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={index === gallery.length - 1}
                    onClick={() => moveItem(index, 'right')}
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 disabled:opacity-30 transition-colors"
                    title="Move Later"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1 rounded-md text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Edit Photo"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-neutral-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <h3 className="text-sm font-bold text-neutral-900">
                {editingItem ? `Edit Store Photo: ${editingItem.title}` : 'Add Store Photo'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Direct Photo Upload */}
              <PhotoUpload
                label="Store Photo"
                bucket="store-photos"
                currentImageUrl={imageUrl}
                onImageSelected={(file, preview) => {
                  setSelectedPhotoFile(file);
                  setImageUrl(preview);
                }}
                helperText="JPG, PNG, WEBP • Max 5 MB"
                aspectRatio="video"
                required={!imageUrl}
              />

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grocery Aisles & Rice Section"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Category Tag</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Store Aisles, Stationery, Groceries, Checkout"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Caption / Subtitle</label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Brief description displayed on lightbox modal..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Publish to live gallery</span>
                </label>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading & Saving...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Save Changes' : 'Upload & Save'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-neutral-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-neutral-900">Delete this photo?</h4>
            <p className="text-xs text-neutral-600">
              Are you sure you want to remove this photo from the store gallery?
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

      {/* Lightbox Quick View */}
      {previewLightboxUrl && (
        <div 
          onClick={() => setPreviewLightboxUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setPreviewLightboxUrl(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewLightboxUrl}
            alt="Preview"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { CITIES, CATEGORIES } from '../data/mockData';
import { CategoryType, CityType, ConditionType, isCategoryType, isCityType, isConditionType } from '../types';
import { 
  X, Camera, Plus, Check, ChevronLeft, ChevronRight, 
  UploadCloud, AlertCircle, Trash2 
} from 'lucide-react';

interface PublishModalProps {
  onClose: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ onClose }) => {
  const { language, addListing } = useApp();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('Véhicules');
  const [condition, setCondition] = useState<ConditionType>('excellent');
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState<CityType>("N'Djaména");

  // Photos State (list of base64 images)
  const [images, setImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seller Info State
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerWhatsApp, setSellerWhatsApp] = useState('');

  // Built-in presets for easy test creation if they don't want to upload
  const PRESET_IMAGES = [
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1484557985045-def2550a47f9?auto=format&fit=crop&q=80&w=400"
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner uniquement des images.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setImages(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPresetImage = (url: string) => {
    if (images.includes(url)) {
      setImages(prev => prev.filter(img => img !== url));
    } else {
      setImages(prev => [...prev, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    if (!title.trim()) return "Veuillez saisir un titre.";
    if (price === '' || price <= 0) return "Veuillez entrer un prix valide.";
    if (!description.trim()) return "Veuillez ajouter une description.";
    return null;
  };

  const validateStep2 = () => {
    if (images.length === 0) return "Veuillez ajouter au moins une photo pour votre annonce.";
    return null;
  };

  const validateStep3 = () => {
    if (!sellerPhone.trim()) return "Le numéro de téléphone est requis.";
    return null;
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
      setStep(3);
    }
  };

  const handlePrev = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const err = validateStep3();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      await addListing({
        title,
        description,
        price: Number(price),
        category,
        city,
        images,
        condition,
        sellerPhone,
        sellerWhatsApp: sellerWhatsApp || sellerPhone,
      });
      alert(getTranslation(language, 'publishSuccess'));
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Une erreur s'est produite lors de la publication.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" id="publish-modal">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-sans">{getTranslation(language, 'publishTitle')}</h2>
            <p className="text-xs text-gray-400 font-medium font-sans">Kabro Sooq — Tchad</p>
          </div>
          <button 
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper indicators */}
        <div className="flex items-center justify-between bg-gray-50/50 px-6 py-3.5 border-b border-gray-100 text-xs font-bold font-sans tracking-wide shrink-0">
          <div className="flex items-center space-x-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</span>
            <span className={step >= 1 ? 'text-blue-600' : 'text-gray-400'}>{getTranslation(language, 'step1')}</span>
          </div>
          <div className="h-0.5 flex-1 bg-gray-200 mx-4" />
          <div className="flex items-center space-x-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</span>
            <span className={step >= 2 ? 'text-blue-600' : 'text-gray-400'}>{getTranslation(language, 'step2')}</span>
          </div>
          <div className="h-0.5 flex-1 bg-gray-200 mx-4" />
          <div className="flex items-center space-x-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</span>
            <span className={step >= 3 ? 'text-blue-600' : 'text-gray-400'}>{getTranslation(language, 'step3')}</span>
          </div>
        </div>

        {/* Form Body Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          
          {error && (
            <div className="mb-5 flex items-center space-x-2 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: General Info */}
          {step === 1 && (
            <div className="space-y-4 font-sans text-xs">
              
              {/* Title */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">Titre de l'annonce</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={getTranslation(language, 'titlePlaceholder')}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                  maxLength={100}
                />
              </div>

              {/* Grid Category & Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">{getTranslation(language, 'category')}</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (isCategoryType(val)) {
                        setCategory(val);
                      }
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 focus:border-blue-500 outline-none transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">{getTranslation(language, 'condition')}</label>
                  <select
                    value={condition}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (isConditionType(val)) {
                        setCondition(val);
                      }
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="new">{getTranslation(language, 'new')}</option>
                    <option value="excellent">{getTranslation(language, 'excellent')}</option>
                    <option value="good">{getTranslation(language, 'good')}</option>
                    <option value="used">{getTranslation(language, 'used')}</option>
                  </select>
                </div>
              </div>

              {/* Grid Price & City */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">{getTranslation(language, 'price')} (FCFA)</label>
                  <input 
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder={getTranslation(language, 'pricePlaceholder')}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 font-mono focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">{getTranslation(language, 'city')}</label>
                  <select
                    value={city}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (isCityType(val)) {
                        setCity(val);
                      }
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 focus:border-blue-500 outline-none transition-all"
                  >
                    {CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={getTranslation(language, 'descPlaceholder')}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium focus:border-blue-500 outline-none transition-all min-h-[100px] h-[120px]"
                  maxLength={2000}
                />
              </div>

            </div>
          )}

          {/* STEP 2: Photos drag-and-drop */}
          {step === 2 && (
            <div className="space-y-5 font-sans">
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700">Photos de l'article</label>
              
              {/* Drag and drop Area */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-8 px-6 text-center cursor-pointer transition-all ${dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <UploadCloud className="h-11 w-11 text-blue-500 mb-2.5" />
                <p className="text-xs font-semibold text-gray-600 px-4">{getTranslation(language, 'addPhoto')}</p>
                <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, JPEG jusqu'à 5 Mo par fichier</p>
              </div>

              {/* Presets suggestions (easy testing) */}
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Ou utilisez des images de test :</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {PRESET_IMAGES.map((preset, idx) => {
                    const isSelected = images.includes(preset);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPresetImage(preset)}
                        className={`relative h-14 w-18 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${isSelected ? 'border-orange-500 ring-2 ring-orange-500/20 scale-95' : 'border-gray-100 hover:scale-95'}`}
                      >
                        <img src={preset} className="h-full w-full object-cover" alt="preset" referrerPolicy="no-referrer" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white stroke-[4]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Images Grid */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Photos sélectionnées ({images.length})</p>
                  <div className="grid grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="group relative h-16 rounded-xl overflow-hidden border border-gray-100">
                        <img src={img} className="h-full w-full object-cover" alt="Selected" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                          <Trash2 className="h-4.5 w-4.5 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 3: Contact Details */}
          {step === 3 && (
            <div className="space-y-4 font-sans text-xs">
              
              {/* Phone number */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">Numéro de téléphone principal (Tchad)</label>
                <input 
                  type="text"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder={getTranslation(language, 'phonePlaceholder')}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 font-mono focus:border-blue-500 outline-none transition-all"
                />
                <p className="text-[10px] text-gray-400 mt-1">Numéro visible sur l'annonce pour les appels directs.</p>
              </div>

              {/* WhatsApp number */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">Numéro WhatsApp (Optionnel)</label>
                <input 
                  type="text"
                  value={sellerWhatsApp}
                  onChange={(e) => setSellerWhatsApp(e.target.value)}
                  placeholder={getTranslation(language, 'whatsAppPlaceholder')}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 font-mono focus:border-blue-500 outline-none transition-all"
                />
                <p className="text-[10px] text-gray-400 mt-1">Si laissé vide, nous utiliserons le numéro de téléphone principal.</p>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 p-5 bg-gray-50/50 shrink-0">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="flex items-center space-x-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{getTranslation(language, 'prev')}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-100"
            >
              <span>{getTranslation(language, 'next')}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 px-6 py-2.5 text-xs font-bold text-white hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95 shadow-md shadow-orange-100"
            >
              <span>{loading ? getTranslation(language, 'loading') : getTranslation(language, 'submit')}</span>
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

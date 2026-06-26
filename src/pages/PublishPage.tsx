import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { CITIES, CATEGORIES } from '../data/mockData';
import { toast } from 'react-hot-toast';
import { CategoryType, CityType, ConditionType, isCategoryType, isCityType, isConditionType } from '../types';
import { loginWithGoogle, uploadListingImage } from '../lib/firebase';
import { motion } from 'motion/react';

interface ImageItem {
  id: string;
  preview: string;
  file?: File;
}
import tchadData from '../data/tchadData.json';
import { 
  Camera, Plus, Check, ChevronLeft, ChevronRight, 
  UploadCloud, AlertCircle, Trash2, ArrowLeft, User
} from 'lucide-react';

export const PublishPage: React.FC = () => {
  const { language, addListing, user } = useApp();
  const navigate = useNavigate();
  
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
  const [selectedArrondissement, setSelectedArrondissement] = useState<string>(
    tchadData.tchad.ndjamena.arrondissements[0].nom
  );
  const [selectedQuartier, setSelectedQuartier] = useState<string>(
    tchadData.tchad.ndjamena.arrondissements[0].quartiers[0]
  );

  const availableQuartiers = React.useMemo(() => {
    if (city !== "N'Djaména") return [];
    const arrObj = tchadData.tchad.ndjamena.arrondissements.find(
      arr => arr.nom === selectedArrondissement
    );
    return arrObj ? arrObj.quartiers : [];
  }, [city, selectedArrondissement]);

  const handleArrondissementChange = (arrName: string) => {
    setSelectedArrondissement(arrName);
    const arrObj = tchadData.tchad.ndjamena.arrondissements.find(
      arr => arr.nom === arrName
    );
    if (arrObj && arrObj.quartiers.length > 0) {
      setSelectedQuartier(arrObj.quartiers[0]);
    } else {
      setSelectedQuartier('');
    }
  };

  // Photos State (list of ImageItem)
  const [images, setImages] = useState<ImageItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seller Info State
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerWhatsApp, setSellerWhatsApp] = useState('');

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
          const newItem: ImageItem = {
            id: `${Date.now()}-${Math.random()}`,
            preview: result,
            file: file,
          };
          setImages(prev => [...prev, newItem]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPresetImage = (url: string) => {
    const isAlreadySelected = images.some(img => img.preview === url);
    if (isAlreadySelected) {
      setImages(prev => prev.filter(img => img.preview !== url));
    } else {
      const newItem: ImageItem = {
        id: `${Date.now()}-${Math.random()}`,
        preview: url,
      };
      setImages(prev => [...prev, newItem]);
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
      // Real-time file upload block to Firebase Storage
      const uploadedImageUrls = await Promise.all(
        images.map(async (item) => {
          if (item.file && user) {
            return await uploadListingImage(item.file, user.uid);
          }
          return item.preview; // It's already a preset url (e.g. Unsplash)
        })
      );

      await addListing({
        title,
        description,
        price: Number(price),
        category,
        city,
        arrondissement: city === "N'Djaména" ? selectedArrondissement : undefined,
        quartier: city === "N'Djaména" ? selectedQuartier : undefined,
        images: uploadedImageUrls,
        condition,
        sellerPhone,
        sellerWhatsApp: sellerWhatsApp || sellerPhone,
      });
      toast.success(getTranslation(language, 'publishSuccess'));
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Une erreur s'est produite lors de la publication.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Guard: If the user is not signed in, show a elegant, clean sign-in screen
  if (!user) {
    return (
      <div className="max-w-md mx-auto space-y-6 font-sans py-12" id="publish-login-required">
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mx-auto mb-4">
            <User className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Connexion requise</h3>
          <p className="text-xs text-gray-400 mb-5">Connectez-vous pour pouvoir publier des annonces gratuitement sur Kabro Sooq.</p>
          <button
            onClick={loginWithGoogle}
            className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            Se connecter avec Google
          </button>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-2xl mx-auto px-2 font-sans py-4" 
      id="publish-page"
    >
      {/* Back link */}
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Retour</span>
      </button>

      {/* Main card */}
      <div className="rounded-3xl border border-gray-100 bg-white shadow-xl flex flex-col overflow-hidden">
        
        {/* Title */}
        <div className="border-b border-gray-100 p-6">
          <h1 className="text-xl font-black text-gray-900">{getTranslation(language, 'publishTitle')}</h1>
          <p className="text-xs text-gray-400 mt-1">Créez une annonce pour vendre rapidement vos articles à travers le Tchad.</p>
        </div>

        {/* Stepper progress */}
        <div className="flex items-center justify-between bg-gray-50/50 px-6 py-4 border-b border-gray-100 text-xs font-bold tracking-wide">
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

        {/* Body content */}
        <div className="p-6 sm:p-8 flex-1">
          {error && (
            <div className="mb-6 flex items-center space-x-2 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: General details */}
          {step === 1 && (
            <div className="space-y-5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">Titre de l'annonce</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={getTranslation(language, 'titlePlaceholder')}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                  maxLength={100}
                />
              </div>

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
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-700 focus:border-blue-500 outline-none transition-all"
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
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-700 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="new">{getTranslation(language, 'new')}</option>
                    <option value="excellent">{getTranslation(language, 'excellent')}</option>
                    <option value="good">{getTranslation(language, 'good')}</option>
                    <option value="used">{getTranslation(language, 'used')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">{getTranslation(language, 'price')} (FCFA)</label>
                  <input 
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder={getTranslation(language, 'pricePlaceholder')}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-800 font-mono focus:border-blue-500 outline-none transition-all"
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
                        if (val === "N'Djaména") {
                          const firstArr = tchadData.tchad.ndjamena.arrondissements[0];
                          setSelectedArrondissement(firstArr.nom);
                          setSelectedQuartier(firstArr.quartiers[0]);
                        } else {
                          setSelectedArrondissement('');
                          setSelectedQuartier('');
                        }
                      }
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-700 focus:border-blue-500 outline-none transition-all"
                  >
                    {tchadData.tchad.regions.map(r => r.chef_lieu).sort().map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {city === "N'Djaména" && (
                <div className="grid grid-cols-2 gap-4 bg-orange-50/40 p-4 rounded-2xl border border-orange-100/50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5 text-[10px]">Arrondissement (N'Djaména)</label>
                    <select
                      value={selectedArrondissement}
                      onChange={(e) => handleArrondissementChange(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs font-bold text-gray-700 focus:border-blue-500 outline-none transition-all"
                    >
                      {tchadData.tchad.ndjamena.arrondissements.map(arr => (
                        <option key={arr.nom} value={arr.nom}>{arr.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5 text-[10px]">Quartier (Préciser l'adresse)</label>
                    <select
                      value={selectedQuartier}
                      onChange={(e) => setSelectedQuartier(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs font-bold text-gray-700 focus:border-blue-500 outline-none transition-all"
                    >
                      {availableQuartiers.map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={getTranslation(language, 'descPlaceholder')}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium focus:border-blue-500 outline-none transition-all min-h-[120px] h-[140px]"
                  maxLength={2000}
                />
              </div>
            </div>
          )}

          {/* Step 2: Upload Images */}
          {step === 2 && (
            <div className="space-y-5">
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700">Photos de l'article</label>
              
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-10 px-6 text-center cursor-pointer transition-all ${dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <UploadCloud className="h-12 w-12 text-blue-500 mb-2.5" />
                <p className="text-xs font-semibold text-gray-600 px-4">{getTranslation(language, 'addPhoto')}</p>
                <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, JPEG jusqu'à 5 Mo par fichier</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Ou utilisez des images de test :</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {PRESET_IMAGES.map((preset, idx) => {
                    const isSelected = images.some(img => img.preview === preset);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPresetImage(preset)}
                        className={`relative h-14 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${isSelected ? 'border-orange-500 ring-2 ring-orange-500/20 scale-95' : 'border-gray-100 hover:scale-95'}`}
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

              {images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Photos sélectionnées ({images.length})</p>
                  <div className="grid grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="group relative h-20 rounded-xl overflow-hidden border border-gray-100 shadow-xs">
                        <img src={img.preview} className="h-full w-full object-cover" alt="Selected" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                          <Trash2 className="h-5 w-5 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Contact details */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">Numéro de téléphone principal (Tchad)</label>
                <input 
                  type="text"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder={getTranslation(language, 'phonePlaceholder')}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-800 font-mono focus:border-blue-500 outline-none transition-all"
                />
                <p className="text-[10px] text-gray-400 mt-1">Numéro visible sur l'annonce pour les appels directs.</p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">Numéro WhatsApp (Optionnel)</label>
                <input 
                  type="text"
                  value={sellerWhatsApp}
                  onChange={(e) => setSellerWhatsApp(e.target.value)}
                  placeholder={getTranslation(language, 'whatsAppPlaceholder')}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-800 font-mono focus:border-blue-500 outline-none transition-all"
                />
                <p className="text-[10px] text-gray-400 mt-1">Si laissé vide, nous utiliserons le numéro de téléphone principal.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 p-6 bg-gray-50/50">
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
    </motion.div>
  );
};

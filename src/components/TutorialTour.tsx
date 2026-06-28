import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { X, Search, PlusCircle, MessageCircle, MapPin, ChevronRight, Check } from 'lucide-react';

export const TutorialTour: React.FC = () => {
  const { showTutorial, completeTutorial } = useApp();
  const [step, setStep] = useState(0);

  // Fallback check
  if (!showTutorial) return null;

  const steps = [
    {
      title: "Bienvenue sur Souk Tchad",
      description: "Votre nouvelle plateforme pour acheter, vendre et échanger facilement au Tchad. Découvrez comment l'utiliser en quelques étapes.",
      icon: <MapPin className="h-12 w-12 text-primary-500" />,
      color: "bg-primary-50 text-primary-600"
    },
    {
      title: "Recherche simplifiée",
      description: "Utilisez la barre de recherche et les filtres de ville pour trouver exactement ce dont vous avez besoin, près de chez vous.",
      icon: <Search className="h-12 w-12 text-blue-500" />,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Publiez gratuitement",
      description: "Appuyez sur le bouton central « Publier » pour mettre en vente vos articles en quelques secondes avec des photos.",
      icon: <PlusCircle className="h-12 w-12 text-emerald-500" />,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Messagerie intégrée",
      description: "Contactez les vendeurs et négociez en toute sécurité grâce à notre système de messagerie en temps réel.",
      icon: <MessageCircle className="h-12 w-12 text-purple-500" />,
      color: "bg-purple-50 text-purple-600"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeTutorial();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          onClick={completeTutorial}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Close button */}
          <button 
            onClick={completeTutorial}
            className="absolute top-4 right-4 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-10"
            aria-label="Fermer le tutoriel"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-8 flex-1 flex flex-col items-center text-center">
            {/* Step Indicators */}
            <div className="flex space-x-1.5 mb-8">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary-500' : i < step ? 'w-2 bg-primary-200' : 'w-2 bg-gray-200'}`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center w-full"
              >
                <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-6 ${steps[step].color}`}>
                  {steps[step].icon}
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-3">{steps[step].title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {steps[step].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors active:scale-95"
            >
              <span>{step === steps.length - 1 ? "Commencer" : "Suivant"}</span>
              {step === steps.length - 1 ? (
                <Check className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

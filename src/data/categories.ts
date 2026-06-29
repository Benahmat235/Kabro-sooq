export interface Subcategory {
  id: string;
  slug: string;
  label: { fr: string; ar: string };
}

export interface Category {
  id: string;
  slug: string;
  label: { fr: string; ar: string };
  icon: string;
  color: string;
  subcategories: Subcategory[];
  adCount?: number;
}

export const TCHAD_CATEGORIES: Category[] = [
  {
    id: 'vehicules',
    slug: 'vehicules',
    label: { fr: 'Véhicules', ar: 'مركبات' },
    icon: 'Car',
    color: '#1565C0',
    subcategories: [
      { id: 'voitures', slug: 'voitures', label: { fr: 'Voitures', ar: 'سيارات' } },
      { id: 'motos-tricycles', slug: 'motos-tricycles', label: { fr: 'Motos & Tricycles', ar: 'دراجات نارية وثلاثية العجلات' } },
      { id: 'camions', slug: 'camions', label: { fr: 'Camions', ar: 'شاحنات' } },
      { id: 'pieces-detachees', slug: 'pieces-detachees', label: { fr: 'Pièces détachées', ar: 'قطع غيار' } },
    ],
  },
  {
    id: 'immobilier',
    slug: 'immobilier',
    label: { fr: 'Immobilier', ar: 'عقارات' },
    icon: 'Home',
    color: '#2E7D32',
    subcategories: [
      { id: 'maisons-a-vendre', slug: 'maisons-a-vendre', label: { fr: 'Maisons à vendre', ar: 'منازل للبيع' } },
      { id: 'terrains', slug: 'terrains', label: { fr: 'Terrains', ar: 'أراضي' } },
      { id: 'location', slug: 'location', label: { fr: 'Location', ar: 'إيجار' } },
      { id: 'boutiques-commerciales', slug: 'boutiques-commerciales', label: { fr: 'Boutiques commerciales', ar: 'محلات تجارية' } },
    ],
  },
  {
    id: 'telephones-tablettes',
    slug: 'telephones-tablettes',
    label: { fr: 'Téléphones & Tablettes', ar: 'هواتف وأجهزة لوحية' },
    icon: 'Smartphone',
    color: '#6A1B9A',
    subcategories: [
      { id: 'android', slug: 'android', label: { fr: 'Android', ar: 'أندرويد' } },
      { id: 'ios', slug: 'ios', label: { fr: 'iOS', ar: 'آي أو إس' } },
      { id: 'accessoires-tel', slug: 'accessoires-tel', label: { fr: 'Accessoires', ar: 'إكسسوارات' } },
      { id: 'reparation-tel', slug: 'reparation-tel', label: { fr: 'Réparation', ar: 'تصليح' } },
    ],
  },
  {
    id: 'electronique',
    slug: 'electronique',
    label: { fr: 'Électronique', ar: 'إلكترونيات' },
    icon: 'Tv',
    color: '#F57C00',
    subcategories: [
      { id: 'tv-audio', slug: 'tv-audio', label: { fr: 'TV/Audio', ar: 'تلفزيون/صوتيات' } },
      { id: 'informatique', slug: 'informatique', label: { fr: 'Informatique', ar: 'معلوماتية' } },
      { id: 'panneaux-solaires', slug: 'panneaux-solaires', label: { fr: 'Panneaux solaires', ar: 'ألواح شمسية' } },
      { id: 'groupes-electrogenes', slug: 'groupes-electrogenes', label: { fr: 'Groupes électrogènes', ar: 'مولدات كهربائية' } },
    ],
  },
  {
    id: 'mode-vetements',
    slug: 'mode-vetements',
    label: { fr: 'Mode & Vêtements', ar: 'أزياء وملابس' },
    icon: 'Shirt',
    color: '#E91E63',
    subcategories: [
      { id: 'pagnes-tissus', slug: 'pagnes-tissus', label: { fr: 'Pagnes & Tissus', ar: 'أقمشة' } },
      { id: 'pret-a-porter', slug: 'pret-a-porter', label: { fr: 'Prêt-à-porter', ar: 'ملابس جاهزة' } },
      { id: 'chaussures', slug: 'chaussures', label: { fr: 'Chaussures', ar: 'أحذية' } },
      { id: 'montres', slug: 'montres', label: { fr: 'Montres', ar: 'ساعات' } },
    ],
  },
  {
    id: 'emplois-services',
    slug: 'emplois-services',
    label: { fr: 'Emplois & Services', ar: 'وظائف وخدمات' },
    icon: 'Briefcase',
    color: '#00838F',
    subcategories: [
      { id: 'offres-emploi', slug: 'offres-emploi', label: { fr: "Offres d'emploi", ar: 'عروض عمل' } },
      { id: 'demandes-emploi', slug: 'demandes-emploi', label: { fr: "Demandes d'emploi", ar: 'طلبات عمل' } },
      { id: 'services-a-domicile', slug: 'services-a-domicile', label: { fr: 'Services à domicile', ar: 'خدمات منزلية' } },
    ],
  },
  {
    id: 'maison-cuisine',
    slug: 'maison-cuisine',
    label: { fr: 'Maison & Cuisine', ar: 'المنزل والمطبخ' },
    icon: 'Sofa',
    color: '#795548',
    subcategories: [
      { id: 'meubles', slug: 'meubles', label: { fr: 'Meubles', ar: 'أثاث' } },
      { id: 'electromenager', slug: 'electromenager', label: { fr: 'Électroménager', ar: 'أجهزة منزلية' } },
      { id: 'decoration', slug: 'decoration', label: { fr: 'Décoration', ar: 'ديكور' } },
      { id: 'bebe-enfants-maison', slug: 'bebe-enfants-maison', label: { fr: 'Bébé & Enfants', ar: 'أطفال ورضع' } },
    ],
  },
  {
    id: 'alimentation-agriculture',
    slug: 'alimentation-agriculture',
    label: { fr: 'Alimentation & Agriculture', ar: 'أغذية وزراعة' },
    icon: 'Wheat',
    color: '#827717',
    subcategories: [
      { id: 'cereales', slug: 'cereales', label: { fr: 'Céréales', ar: 'حبوب' } },
      { id: 'betail-animaux', slug: 'betail-animaux', label: { fr: "Bétail & Animaux d'élevage", ar: 'مواشي وحيوانات' } },
      { id: 'materiel-agricole', slug: 'materiel-agricole', label: { fr: 'Matériel agricole', ar: 'معدات زراعية' } },
    ],
  },
  {
    id: 'education-formation',
    slug: 'education-formation',
    label: { fr: 'Éducation & Formation', ar: 'تعليم وتدريب' },
    icon: 'GraduationCap',
    color: '#0277BD',
    subcategories: [
      { id: 'cours-particuliers', slug: 'cours-particuliers', label: { fr: 'Cours particuliers', ar: 'دروس خصوصية' } },
      { id: 'livres', slug: 'livres', label: { fr: 'Livres', ar: 'كتب' } },
      { id: 'materiel-scolaire', slug: 'materiel-scolaire', label: { fr: 'Matériel scolaire', ar: 'أدوات مدرسية' } },
    ],
  },
  {
    id: 'sante-beaute',
    slug: 'sante-beaute',
    label: { fr: 'Santé & Beauté', ar: 'صحة وجمال' },
    icon: 'HeartPulse',
    color: '#C2185B',
    subcategories: [
      { id: 'produits-cosmetiques', slug: 'produits-cosmetiques', label: { fr: 'Produits cosmétiques', ar: 'مواد تجميل' } },
      { id: 'materiel-medical', slug: 'materiel-medical', label: { fr: 'Matériel médical', ar: 'معدات طبية' } },
    ],
  },
  {
    id: 'sports-loisirs',
    slug: 'sports-loisirs',
    label: { fr: 'Sports & Loisirs', ar: 'رياضة وترفيه' },
    icon: 'Dumbbell',
    color: '#FF8F00',
    subcategories: [
      { id: 'equipement-sportif', slug: 'equipement-sportif', label: { fr: 'Équipement sportif', ar: 'معدات رياضية' } },
      { id: 'jeux', slug: 'jeux', label: { fr: 'Jeux', ar: 'ألعاب' } },
      { id: 'musique', slug: 'musique', label: { fr: 'Musique', ar: 'موسيقى' } },
    ],
  },
  {
    id: 'autres',
    slug: 'autres',
    label: { fr: 'Autres', ar: 'أخرى' },
    icon: 'Package',
    color: '#607D8B',
    subcategories: [
      { id: 'divers', slug: 'divers', label: { fr: 'Divers', ar: 'متنوعات' } },
      { id: 'dons', slug: 'dons', label: { fr: 'Dons', ar: 'تبرعات' } },
      { id: 'troc', slug: 'troc', label: { fr: 'Troc', ar: 'مقايضة' } },
    ],
  },
];

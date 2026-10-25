// Sample shop catalog (dummy data, not from the backend). Prices in Bangladeshi taka.

export type Category = 'equipment' | 'food' | 'supplement';

export type Product = {
  id: string;
  category: Category;
  name: string;
  size: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  icon:
    | 'barbell' | 'yoga' | 'bands' | 'bicycle' | 'kettlebell' | 'scales'
    | 'oats' | 'chola' | 'nuts' | 'rice' | 'seeds' | 'tea'
    | 'whey' | 'multi' | 'omega' | 'vitd' | 'electrolyte' | 'creatine';
  about: string;
  tag?: string;
};

export const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'food', label: 'Safe foods' },
  { id: 'supplement', label: 'Supplements' },
];

export const PRODUCTS: Product[] = [
  // ---------- equipment ----------
  { id: 'dumbbells-5', category: 'equipment', name: 'Dumbbell pair', size: '2 × 5 kg', price: 3500, oldPrice: 3990, rating: 4.7, reviews: 128, icon: 'barbell', tag: 'Best seller',
    about: 'Rubber-coated hex dumbbells that don\'t roll. Good for rows, curls and shoulder press from your plan.' },
  { id: 'yoga-mat', category: 'equipment', name: 'Yoga mat', size: '6 mm · 183 cm', price: 1200, rating: 4.6, reviews: 96, icon: 'yoga',
    about: 'Non-slip mat for planks, bridges and stretching. Rolls up with a carry strap.' },
  { id: 'bands', category: 'equipment', name: 'Resistance bands', size: 'Set of 5', price: 950, rating: 4.5, reviews: 74, icon: 'bands',
    about: 'Five strengths from light to extra heavy. Swap in for dumbbells when travelling.' },
  { id: 'kettlebell-8', category: 'equipment', name: 'Kettlebell', size: '8 kg', price: 2800, rating: 4.6, reviews: 41, icon: 'kettlebell',
    about: 'Cast iron with a wide handle, for swings, goblet squats and carries.' },
  { id: 'cycle', category: 'equipment', name: 'Mini exercise bike', size: 'Pedal trainer', price: 6500, oldPrice: 7200, rating: 4.3, reviews: 22, icon: 'bicycle',
    about: 'Under-desk pedal trainer with a small display. Easy cardio on rest days.' },
  { id: 'scale', category: 'equipment', name: 'Digital weight scale', size: 'Up to 180 kg', price: 1650, rating: 4.8, reviews: 210, icon: 'scales', tag: 'For Friday weigh-in',
    about: 'Accurate to 100 g, with a big backlit display. Weigh yourself every Friday morning.' },

  // ---------- safe foods ----------
  { id: 'oats', category: 'food', name: 'Rolled oats', size: '1 kg', price: 520, rating: 4.8, reviews: 312, icon: 'oats', tag: 'In your plan',
    about: 'Whole rolled oats with no added sugar. Your Sunday and Thursday breakfast.' },
  { id: 'chola', category: 'food', name: 'Roasted chola', size: '500 g', price: 280, rating: 4.6, reviews: 154, icon: 'chola',
    about: 'Dry-roasted chickpeas with no oil. A high-protein evening snack.' },
  { id: 'nuts', category: 'food', name: 'Mixed nuts', size: '250 g', price: 650, rating: 4.7, reviews: 188, icon: 'nuts',
    about: 'Almonds, cashews and peanuts, unsalted. Count 10–12 pieces per snack.' },
  { id: 'brown-rice', category: 'food', name: 'Brown rice', size: '2 kg', price: 380, rating: 4.4, reviews: 97, icon: 'rice',
    about: 'Whole-grain rice with more fibre than white rice. Keeps you full longer.' },
  { id: 'chia', category: 'food', name: 'Chia seeds', size: '250 g', price: 420, rating: 4.5, reviews: 63, icon: 'seeds',
    about: 'Add a spoon to oats or doi for fibre and omega-3.' },
  { id: 'green-tea', category: 'food', name: 'Green tea', size: '50 bags', price: 350, rating: 4.6, reviews: 240, icon: 'tea',
    about: 'Pure green tea, no sugar. Your 11:00 and evening snack drink.' },

  // ---------- supplements ----------
  { id: 'whey', category: 'supplement', name: 'Whey protein', size: '1 kg · Chocolate', price: 4200, oldPrice: 4800, rating: 4.7, reviews: 175, icon: 'whey', tag: 'Best seller',
    about: '24 g protein per scoop. Helps you reach your daily protein target on busy days.' },
  { id: 'multi', category: 'supplement', name: 'Multivitamin', size: '60 tablets', price: 850, rating: 4.5, reviews: 132, icon: 'multi',
    about: 'One a day with breakfast. Covers common gaps while eating less.' },
  { id: 'omega', category: 'supplement', name: 'Omega-3 fish oil', size: '60 capsules', price: 1100, rating: 4.6, reviews: 88, icon: 'omega',
    about: '1000 mg fish oil per capsule, for heart and joints.' },
  { id: 'vitd', category: 'supplement', name: 'Vitamin D3', size: '2000 IU · 90 caps', price: 600, rating: 4.7, reviews: 119, icon: 'vitd',
    about: 'For bones and mood, especially if you spend most of the day indoors.' },
  { id: 'electrolyte', category: 'supplement', name: 'Electrolyte powder', size: '20 sachets', price: 550, rating: 4.4, reviews: 57, icon: 'electrolyte',
    about: 'Sugar-free salts for long walks and hot days. Mix one sachet in 500 ml water.' },
  { id: 'creatine', category: 'supplement', name: 'Creatine', size: '300 g', price: 1900, rating: 4.6, reviews: 66, icon: 'creatine',
    about: '5 g a day supports strength training. Unflavoured, mixes in water.' },
];

/** Free delivery above this subtotal; otherwise a flat fee. */
export const FREE_DELIVERY_FROM = 1500;
export const DELIVERY_FEE = 60;

export const taka = (n: number) => `৳${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

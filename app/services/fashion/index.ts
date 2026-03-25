/**
 * Fashion Service
 * T0006: RTL Fashion - Abaya Customization
 */

export interface AbayaOption {
  id: string;
  name: string;
  price: number;
}

export interface AbayaCategory {
  id: string;
  category: string;
  options: AbayaOption[];
}

export const ABAYA_CUSTOMIZATIONS: AbayaCategory[] = [
  {
    id: 'fabric',
    category: 'fabric',
    options: [
      { id: 'crepe', name: 'Crepe', price: 0 },
      { id: 'silk', name: 'Silk', price: 50 },
      { id: 'nida', name: 'Nida', price: 20 },
      { id: 'chiffon', name: 'Chiffon', price: 30 },
    ],
  },
  {
    id: 'color',
    category: 'color',
    options: [
      { id: 'black', name: 'Black', price: 0 },
      { id: 'navy', name: 'Navy', price: 10 },
      { id: 'burgundy', name: 'Burgundy', price: 10 },
      { id: 'olive', name: 'Olive', price: 10 },
    ],
  },
  {
    id: 'embellishment',
    category: 'embellishment',
    options: [
      { id: 'none', name: 'None', price: 0 },
      { id: 'lace', name: 'Lace Trim', price: 40 },
      { id: 'embroidery', name: 'Embroidery', price: 75 },
      { id: 'crystal', name: 'Crystal Beading', price: 120 },
    ],
  },
];

import { Product } from './types';

export const CATEGORIES = [
  'All Products',
  'Smartphones',
  'Smart Watches',
  'Earbuds',
  'Accessories',
  'Laptops',
  'Gaming Gadgets'
];

export const PRODUCTS: Product[] = [
  {
    id: 'phone-01',
    name: 'iPhone 15 Pro Max',
    price: 1199,
    category: 'Smartphones',
    description: 'Titanium design with A17 Pro chip, customizable Action button, and a powerful 5x Telephoto camera.',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=500',
    rating: 4.9,
    isFeatured: true,
    specifications: [
      'Super Retina XDR OLED Display (6.7-inch)',
      'Apple A17 Pro (3nm) Hexa-core processor',
      'Triple Camera (48MP raw, 12MP zoom, 12MP ultrawide)',
      'Premium Titanium alloy construction',
      'Up to 29 hours of video playback'
    ]
  },
  {
    id: 'phone-02',
    name: 'Samsung Galaxy S24 Ultra',
    price: 1299,
    category: 'Smartphones',
    description: 'Sleek titanium body meets advanced Galaxy AI tools, an integrated S Pen, and a breathtaking 200MP sensor.',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=500',
    rating: 4.8,
    isFeatured: true,
    specifications: [
      '6.8-inch Dynamic AMOLED 2X Display (120Hz)',
      'Snapdragon 8 Gen 3 for Galaxy',
      'Quad Camera (200MP main, 50MP, 12MP, 10MP)',
      'Built-in ultra-responsive S Pen stylus',
      '5000 mAh all-day battery with 45W fast charge'
    ]
  },
  {
    id: 'watch-01',
    name: 'Apple Watch Ultra 2',
    price: 799,
    category: 'Smart Watches',
    description: 'A rugged and capable adventure sports watch designed for endurance runners, divers, and mountaineers.',
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&q=80&w=500',
    rating: 4.9,
    isFeatured: true,
    specifications: [
      'Alps Blue Loop Titanium Case (49mm)',
      'Always-on Retina Display (3000 nits peak)',
      'Dual-frequency GPS with extreme accuracy',
      'Water resistance IP6X & depth up to 100 meters',
      'Up to 36 hours of regular battery life'
    ]
  },
  {
    id: 'watch-02',
    name: 'Google Pixel Watch 3',
    price: 349,
    category: 'Smart Watches',
    description: 'Beautiful dome design packed with advanced Fitbit insights, deep Google Integration, and active heart monitoring.',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=500',
    rating: 4.6,
    isFeatured: false,
    specifications: [
      'Circular 3D Corning Gorilla Glass 5 face',
      'Fitbit premium fitness and sleep tracking',
      'Onboard Compass, Altimeter, and SpO2 sensor',
      'LTE & Wi-Fi support with seamless payments',
      'Sleek Active sport band material'
    ]
  },
  {
    id: 'earbuds-01',
    name: 'AirPods Pro Elite',
    price: 249,
    category: 'Earbuds',
    description: 'Adaptive audio engine dynamically balances active noise cancellation with surrounding transparency.',
    image: 'https://images.unsplash.com/photo-1588449668338-d15168243403?auto=format&fit=crop&q=80&w=500',
    rating: 4.7,
    isFeatured: true,
    specifications: [
      'Custom Apple H2 audio driver',
      'Twice the Active Noise Cancellation (ANC)',
      'Personalized Spatial Audio with dynamic tracking',
      'MagSafe charging case with USB-C and speaker',
      'Dust, sweat, and water-resistant (IP54)'
    ]
  },
  {
    id: 'earbuds-02',
    name: 'Sony WF-1000XM5 ANC',
    price: 299,
    category: 'Earbuds',
    description: 'State of the art companion for high-resolution audio files, utilizing multi-noise sensor algorithms.',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=500',
    rating: 4.8,
    isFeatured: false,
    specifications: [
      'Industry-leading dual feedback microphone ANC',
      'Proprietary V2 audio processor',
      'High-res audio wireless LDAC output',
      'Ergonomically engineered light design',
      'Multipoint Bluetooth connection to 2 devices'
    ]
  },
  {
    id: 'acc-01',
    name: 'Nomad Classic Leather Case',
    price: 69,
    category: 'Accessories',
    description: 'Crafted from Horween natural leather that develops a beautiful rich patina with daily wear and tear.',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2fe536?auto=format&fit=crop&q=80&w=500',
    rating: 4.5,
    isFeatured: false,
    specifications: [
      'Premium Horween leather from Chicago',
      'Built-in ultra-slim MagSafe ring',
      'Rugged TPE bumper protection (10ft drop test)',
      'Microfiber inner lining prevents scratches',
      'Anodized aluminum buttons'
    ]
  },
  {
    id: 'acc-02',
    name: 'Magnetic Fast Power Bank',
    price: 49,
    category: 'Accessories',
    description: 'Ultra-thin mag-safe power solution that snaps onto your smartphone for seamless 15W high-speed charging.',
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?auto=format&fit=crop&q=80&w=500',
    rating: 4.6,
    isFeatured: false,
    specifications: [
      '10,000 mAh battery capacity cells',
      'Secure magnetic dynamic alignment',
      'Bi-directional 20W USB-C PD fast port',
      'Multiple protection systems (temperature, surge)',
      'Pass-through charging enabled'
    ]
  },
  {
    id: 'lap-01',
    name: 'MacBook Pro 16" M3 Max',
    price: 2499,
    category: 'Laptops',
    description: 'The ultimate powerhouse for creative professionals, developers, and engineers, featuring the Space Black finish.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=500',
    rating: 4.9,
    isFeatured: true,
    specifications: [
      'Apple M3 Max Chip with 16-core CPU, 40-core GPU',
      '48GB Unified memory bandwidth',
      '1TB super-fast SSD solid state storage',
      'Liquid Retina XDR display (120Hz ProMotion)',
      'Up to 22 hours of continuous battery life'
    ]
  },
  {
    id: 'lap-02',
    name: 'Razer Blade 14 Gaming Elite',
    price: 2199,
    category: 'Laptops',
    description: 'Portable perfection running critical PC titles with ultra-fast Nvidia GeForce RTX 4070 graphic technology.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=500',
    rating: 4.7,
    isFeatured: false,
    specifications: [
      'AMD Ryzen 9 8945HS high performance processor',
      'Nvidia GeForce RTX 4070 (8GB VRAM) graphics',
      '14-inch QHD+ 240Hz fast responsiveness panel',
      'Dual-channel 32GB DDR5 RAM system',
      'Anodized CNC aluminum black finish'
    ]
  },
  {
    id: 'game-01',
    name: 'PlayStation 5 Pro Console',
    price: 699,
    category: 'Gaming Gadgets',
    description: 'Experience next-gen console immersion with enhanced ray tracing, ultra-fast SSD speeds, and raw 8K capabilities.',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=500',
    rating: 4.8,
    isFeatured: true,
    specifications: [
      'Custom AMD Zen 2 CPU / RDNA graphics',
      'Enhanced AI Upscaling (Spectral Super Resolution)',
      'Ultra high speed 2TB Solid State storage',
      'Support for 4K @ 120 FPS high-fidelity screens',
      'Includes DualSense adaptive triggers wireless pad'
    ]
  },
  {
    id: 'game-02',
    name: 'DualSense Edge Controller',
    price: 199,
    category: 'Gaming Gadgets',
    description: 'Pro-level wireless controller designed for customizable button maps, thumbsticks height, and lockable long triggers.',
    image: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&q=80&w=500',
    rating: 4.7,
    isFeatured: false,
    specifications: [
      'Remap or block physical button parameters',
      'Interchangeable stick caps & back paddle designs',
      'Adjustable trigger stops with dynamic sensitivity',
      'Convenient carry case and braided charge wire',
      'Preserved haptic rumble & speaker technology'
    ]
  }
];

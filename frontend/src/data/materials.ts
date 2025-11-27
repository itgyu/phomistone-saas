export interface Material {
  material_id: string;
  name: string;
  series: string;
  category: 'interior_wall' | 'exterior_wall' | 'floor' | 'ceiling';
  description: string;
  color: string;
  image_path: string;
  positive_prompt: string;
  negative_prompt: string;
  price_per_sqm?: number;
}

export const materials: Material[] = [
  {
    material_id: 'castol_white_01',
    name: 'Castol White',
    series: 'Castol',
    category: 'interior_wall',
    description: '깨끗하고 밝은 화이트 마감',
    color: '#F5F5F5',
    image_path: '/materials/1. Castol White.png',
    positive_prompt: 'white marble texture, clean surface, bright lighting, luxury interior',
    negative_prompt: 'dirty, stained, dark, low quality',
    price_per_sqm: 85000
  },
  {
    material_id: 'veil_gray_02',
    name: 'Veil Gray',
    series: 'Veil',
    category: 'interior_wall',
    description: '은은한 그레이 베일 패턴',
    color: '#B8B8B8',
    image_path: '/materials/2. Veil Gray.png',
    positive_prompt: 'gray marble with veil pattern, elegant surface, modern interior',
    negative_prompt: 'plain, boring, low quality',
    price_per_sqm: 90000
  },
  {
    material_id: 'veil_dark_grey_03',
    name: 'Veil Dark Grey',
    series: 'Veil',
    category: 'interior_wall',
    description: '고급스러운 다크 그레이',
    color: '#4A4A4A',
    image_path: '/materials/3. Veil Dark Grey.png',
    positive_prompt: 'dark gray marble, luxury texture, sophisticated interior, elegant veining',
    negative_prompt: 'cheap, plain, low quality',
    price_per_sqm: 95000
  },
  {
    material_id: 'shahara_light_gray_04',
    name: 'Shahara Light Gray',
    series: 'Shahara',
    category: 'interior_wall',
    description: '라이트 그레이 사하라 패턴',
    color: '#D3D3D3',
    image_path: '/materials/4. Shahara Light Gray.png',
    positive_prompt: 'light gray marble, sahara pattern, natural texture, bright interior',
    negative_prompt: 'dark, dirty, artificial',
    price_per_sqm: 88000
  },
  {
    material_id: 'cloud_yellow_05',
    name: 'Cloud Yellow',
    series: 'Cloud',
    category: 'interior_wall',
    description: '따뜻한 옐로우 클라우드 패턴',
    color: '#F5DEB3',
    image_path: '/materials/5. Cloud Yellow.png',
    positive_prompt: 'yellow beige marble, cloud pattern, warm tone, elegant interior',
    negative_prompt: 'cold, plain, low quality',
    price_per_sqm: 92000
  },
  {
    material_id: 'andes_white_06',
    name: 'Andes White',
    series: 'Andes',
    category: 'interior_wall',
    description: '안데스 화이트 마블',
    color: '#FAFAFA',
    image_path: '/materials/6. Andes White.png',
    positive_prompt: 'white marble, andes stone texture, clean surface, luxury interior',
    negative_prompt: 'dirty, stained, low quality',
    price_per_sqm: 87000
  },
  {
    material_id: 'nile_dark_grey_07',
    name: 'Nile Dark Grey',
    series: 'Nile',
    category: 'interior_wall',
    description: '나일강의 다크 그레이 패턴',
    color: '#5A5A5A',
    image_path: '/materials/7. Nile Dark Grey.png',
    positive_prompt: 'dark gray marble, nile pattern, deep texture, luxury interior',
    negative_prompt: 'plain, cheap, low quality',
    price_per_sqm: 94000
  },
  {
    material_id: 'andes_grey_08',
    name: 'Andes Grey',
    series: 'Andes',
    category: 'interior_wall',
    description: '안데스 그레이 스톤',
    color: '#909090',
    image_path: '/materials/8. Andes Grey.png',
    positive_prompt: 'gray marble, andes texture, natural pattern, modern interior',
    negative_prompt: 'artificial, plain, low quality',
    price_per_sqm: 89000
  },
  {
    material_id: 'sunis_white_09',
    name: 'Sunis White',
    series: 'Sunis',
    category: 'interior_wall',
    description: '순백의 수니스 화이트',
    color: '#FFFFFF',
    image_path: '/materials/9. Sunis White.png',
    positive_prompt: 'pure white marble, clean surface, bright texture, luxury interior',
    negative_prompt: 'dirty, stained, dark',
    price_per_sqm: 86000
  },
  {
    material_id: 'kamu_red_10',
    name: 'Kamu Red',
    series: 'Kamu',
    category: 'interior_wall',
    description: '강렬한 레드 카무 스톤',
    color: '#8B4513',
    image_path: '/materials/10. Kamu Red.png',
    positive_prompt: 'red brown marble, kamu texture, warm tone, unique interior',
    negative_prompt: 'plain, cold, low quality',
    price_per_sqm: 98000
  },
  {
    material_id: 'andes_gray_11',
    name: 'Andes Gray',
    series: 'Andes',
    category: 'interior_wall',
    description: '안데스 그레이 마블',
    color: '#A9A9A9',
    image_path: '/materials/11. Andes Gray.png',
    positive_prompt: 'gray marble, andes pattern, natural texture, elegant interior',
    negative_prompt: 'artificial, plain, low quality',
    price_per_sqm: 89000
  },
  {
    material_id: 'cloud_white_12',
    name: 'Cloud White',
    series: 'Cloud',
    category: 'interior_wall',
    description: '클라우드 화이트 패턴',
    color: '#F8F8F8',
    image_path: '/materials/12. Cloud White.png',
    positive_prompt: 'white marble, cloud pattern, soft texture, bright interior',
    negative_prompt: 'dark, dirty, low quality',
    price_per_sqm: 87000
  },
  {
    material_id: 'plain_white_13',
    name: 'Plain White',
    series: 'Plain',
    category: 'interior_wall',
    description: '심플한 플레인 화이트',
    color: '#FEFEFE',
    image_path: '/materials/13. Plain White.png',
    positive_prompt: 'plain white surface, clean texture, minimalist interior, bright',
    negative_prompt: 'dirty, complex pattern, low quality',
    price_per_sqm: 82000
  },
  {
    material_id: 'australia_yellow_14',
    name: 'Australia Yellow',
    series: 'Australia',
    category: 'interior_wall',
    description: '호주산 옐로우 스톤',
    color: '#DAA520',
    image_path: '/materials/14. Austrailia Yellow.png',
    positive_prompt: 'yellow beige marble, australia stone, warm tone, luxury interior',
    negative_prompt: 'cold, plain, low quality',
    price_per_sqm: 96000
  },
  {
    material_id: 'greyish_desert_15',
    name: 'Greyish Desert',
    series: 'Desert',
    category: 'interior_wall',
    description: '사막의 그레이시 톤',
    color: '#C8C8C8',
    image_path: '/materials/15. Greyish Desert.png',
    positive_prompt: 'gray beige marble, desert texture, natural pattern, warm interior',
    negative_prompt: 'artificial, cold, low quality',
    price_per_sqm: 91000
  },
  {
    material_id: 'dark_gray_16',
    name: 'Dark Gray',
    series: 'Classic',
    category: 'interior_wall',
    description: '클래식 다크 그레이',
    color: '#404040',
    image_path: '/materials/16. Dark Gray.png',
    positive_prompt: 'dark gray marble, deep texture, luxury interior, sophisticated',
    negative_prompt: 'bright, plain, low quality',
    price_per_sqm: 93000
  },
  {
    material_id: 'portoro_17',
    name: 'Portoro',
    series: 'Portoro',
    category: 'interior_wall',
    description: '포르토로 골드 베인',
    color: '#2F2F2F',
    image_path: '/materials/17. Portoro.png',
    positive_prompt: 'black marble with gold veins, portoro texture, luxury interior, elegant',
    negative_prompt: 'plain, cheap, low quality',
    price_per_sqm: 120000
  },
  {
    material_id: 'veil_gray_18',
    name: 'Veil Gray',
    series: 'Veil',
    category: 'interior_wall',
    description: '베일 그레이 패턴',
    color: '#B0B0B0',
    image_path: '/materials/18. Veil Gray.png',
    positive_prompt: 'gray marble, veil pattern, elegant texture, modern interior',
    negative_prompt: 'plain, boring, low quality',
    price_per_sqm: 90000
  },
  {
    material_id: 'nile_light_yellow_19',
    name: 'Nile Light Yellow',
    series: 'Nile',
    category: 'interior_wall',
    description: '나일강의 라이트 옐로우',
    color: '#F0E68C',
    image_path: '/materials/19. Nile Light Yellow.png',
    positive_prompt: 'light yellow marble, nile pattern, warm tone, elegant interior',
    negative_prompt: 'cold, dark, low quality',
    price_per_sqm: 93000
  },
  {
    material_id: 'castol_white_20',
    name: 'Castol White',
    series: 'Castol',
    category: 'interior_wall',
    description: '카스톨 화이트 마감',
    color: '#F6F6F6',
    image_path: '/materials/20. Castol White.png',
    positive_prompt: 'white marble, castol texture, clean surface, luxury interior',
    negative_prompt: 'dirty, stained, low quality',
    price_per_sqm: 85000
  },
  {
    material_id: 'veil_white_21',
    name: 'Veil White',
    series: 'Veil',
    category: 'interior_wall',
    description: '베일 화이트 패턴',
    color: '#F9F9F9',
    image_path: '/materials/21. Veil White.png',
    positive_prompt: 'white marble, veil pattern, soft texture, bright interior',
    negative_prompt: 'dark, dirty, low quality',
    price_per_sqm: 88000
  },
  {
    material_id: 'veil_dark_gray_22',
    name: 'Veil Dark Gray',
    series: 'Veil',
    category: 'interior_wall',
    description: '베일 다크 그레이',
    color: '#505050',
    image_path: '/materials/22. Veil Dark Gray.png',
    positive_prompt: 'dark gray marble, veil pattern, luxury texture, sophisticated interior',
    negative_prompt: 'bright, plain, low quality',
    price_per_sqm: 95000
  },
  {
    material_id: 'castol_blue_23',
    name: 'Castol Blue',
    series: 'Castol',
    category: 'interior_wall',
    description: '카스톨 블루 그레이',
    color: '#708090',
    image_path: '/materials/23. Castol Blue.png',
    positive_prompt: 'blue gray marble, castol texture, elegant pattern, modern interior',
    negative_prompt: 'warm tone, plain, low quality',
    price_per_sqm: 97000
  },
  {
    material_id: 'andes_yellow_24',
    name: 'Andes Yellow',
    series: 'Andes',
    category: 'interior_wall',
    description: '안데스 옐로우 스톤',
    color: '#E6C77E',
    image_path: '/materials/24. Andes Yellow.png',
    positive_prompt: 'yellow beige marble, andes texture, warm tone, elegant interior',
    negative_prompt: 'cold, dark, low quality',
    price_per_sqm: 92000
  },
  {
    material_id: 'blue_grey_25',
    name: 'Blue Grey',
    series: 'Blue',
    category: 'interior_wall',
    description: '블루 그레이 톤',
    color: '#6A7B8C',
    image_path: '/materials/25. Blue Grey.png',
    positive_prompt: 'blue gray marble, cool tone, elegant texture, modern interior',
    negative_prompt: 'warm, plain, low quality',
    price_per_sqm: 94000
  },
  {
    material_id: 'andes_gold_26',
    name: 'Andes Gold',
    series: 'Andes',
    category: 'interior_wall',
    description: '안데스 골드 마블',
    color: '#C5A572',
    image_path: '/materials/26. Andes Gold.png',
    positive_prompt: 'gold beige marble, andes texture, luxury tone, elegant interior',
    negative_prompt: 'cold, plain, low quality',
    price_per_sqm: 99000
  },
  {
    material_id: 'portoro_27',
    name: 'Portoro',
    series: 'Portoro',
    category: 'interior_wall',
    description: '포르토로 블랙 골드',
    color: '#1C1C1C',
    image_path: '/materials/27. Portoro.png',
    positive_prompt: 'black marble with gold veins, portoro luxury, elegant interior',
    negative_prompt: 'plain, cheap, low quality',
    price_per_sqm: 120000
  },
  {
    material_id: 'multi_color_red_28',
    name: 'Multi-Color Red',
    series: 'Multi-Color',
    category: 'interior_wall',
    description: '멀티 컬러 레드 패턴',
    color: '#A0522D',
    image_path: '/materials/28. Multi-Color Red.png',
    positive_prompt: 'red brown marble, multi color pattern, unique texture, luxury interior',
    negative_prompt: 'plain, single color, low quality',
    price_per_sqm: 105000
  },
  {
    material_id: 'greyish_desert_29',
    name: 'Greyish Desert',
    series: 'Desert',
    category: 'interior_wall',
    description: '그레이시 데저트 패턴',
    color: '#BEBEBE',
    image_path: '/materials/29. Greyish Desert.png',
    positive_prompt: 'gray beige marble, desert pattern, natural texture, warm interior',
    negative_prompt: 'artificial, cold, low quality',
    price_per_sqm: 91000
  },
  {
    material_id: 'andes_white_30',
    name: 'Andes White',
    series: 'Andes',
    category: 'interior_wall',
    description: '안데스 화이트 스톤',
    color: '#FCFCFC',
    image_path: '/materials/30. Andes White.png',
    positive_prompt: 'white marble, andes texture, clean surface, bright interior',
    negative_prompt: 'dirty, dark, low quality',
    price_per_sqm: 87000
  },
  {
    material_id: 'andes_yellow_31',
    name: 'Andes Yellow',
    series: 'Andes',
    category: 'interior_wall',
    description: '안데스 옐로우 베이지',
    color: '#DEB887',
    image_path: '/materials/31. Andes Yellow.png',
    positive_prompt: 'yellow beige marble, andes pattern, warm tone, elegant interior',
    negative_prompt: 'cold, dark, low quality',
    price_per_sqm: 92000
  },
  {
    material_id: 'h2_32',
    name: 'H2',
    series: 'H Series',
    category: 'interior_wall',
    description: 'H2 시리즈 마블',
    color: '#E8E8E8',
    image_path: '/materials/32. H2.png',
    positive_prompt: 'light gray marble, h2 texture, modern pattern, elegant interior',
    negative_prompt: 'dark, plain, low quality',
    price_per_sqm: 90000
  },
  {
    material_id: 'h4_33',
    name: 'H4',
    series: 'H Series',
    category: 'interior_wall',
    description: 'H4 시리즈 마블',
    color: '#D0D0D0',
    image_path: '/materials/33. H4.png',
    positive_prompt: 'gray marble, h4 texture, elegant pattern, modern interior',
    negative_prompt: 'bright, plain, low quality',
    price_per_sqm: 90000
  }
];

// 시리즈별 자재 조회
export const getMaterialsBySeries = (series: string): Material[] => {
  return materials.filter(m => m.series === series);
};

// 카테고리별 자재 조회
export const getMaterialsByCategory = (category: Material['category']): Material[] => {
  return materials.filter(m => m.category === category);
};

// ID로 자재 조회
export const getMaterialById = (id: string): Material | undefined => {
  return materials.find(m => m.material_id === id);
};

// 전체 시리즈 목록
export const getAllSeries = (): string[] => {
  return Array.from(new Set(materials.map(m => m.series)));
};

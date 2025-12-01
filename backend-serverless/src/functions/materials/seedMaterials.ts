/**
 * Seed Materials Lambda
 * Populates the database with 33 default materials
 */

import type { Context } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

import { createInternalHandler } from '../../lib/utils/handler';
import { MaterialRepo } from '../../lib/db/repository';
import type { Material, MaterialCategory } from '../../types';

interface SeedMaterialData {
  category: MaterialCategory;
  name: string;
  brand?: string;
  productCode?: string;
  description: string;
  colorHex?: string;
  physicalSize: { widthMM: number; heightMM: number };
  tags: string[];
}

// 33 Default Materials
const DEFAULT_MATERIALS: SeedMaterialData[] = [
  // STONE (5)
  {
    category: 'STONE',
    name: '카라라 화이트 마블',
    brand: 'Phomistone',
    productCode: 'PS-STN-001',
    description: '이탈리아 카라라산 고급 백색 대리석. 회색 결이 특징적인 클래식한 마감재.',
    colorHex: '#F5F5F5',
    physicalSize: { widthMM: 600, heightMM: 600 },
    tags: ['대리석', '화이트', '고급', '이탈리아'],
  },
  {
    category: 'STONE',
    name: '네로 마르퀴나',
    brand: 'Phomistone',
    productCode: 'PS-STN-002',
    description: '스페인산 블랙 마블. 흰색 결이 포인트가 되는 모던한 느낌.',
    colorHex: '#1A1A1A',
    physicalSize: { widthMM: 600, heightMM: 600 },
    tags: ['대리석', '블랙', '모던', '스페인'],
  },
  {
    category: 'STONE',
    name: '베이지 트라버틴',
    brand: 'Phomistone',
    productCode: 'PS-STN-003',
    description: '터키산 트라버틴. 자연스러운 구멍과 무늬가 특징.',
    colorHex: '#D4C4A8',
    physicalSize: { widthMM: 400, heightMM: 600 },
    tags: ['트라버틴', '베이지', '자연스러운', '터키'],
  },
  {
    category: 'STONE',
    name: '그레이 그라니트',
    brand: 'Phomistone',
    productCode: 'PS-STN-004',
    description: '국내산 화강암. 내구성이 뛰어나고 관리가 용이함.',
    colorHex: '#808080',
    physicalSize: { widthMM: 600, heightMM: 600 },
    tags: ['화강암', '그레이', '내구성', '국내산'],
  },
  {
    category: 'STONE',
    name: '오닉스 허니',
    brand: 'Phomistone',
    productCode: 'PS-STN-005',
    description: '투광성이 있는 오닉스. 조명과 함께 사용시 고급스러운 연출 가능.',
    colorHex: '#DAA520',
    physicalSize: { widthMM: 300, heightMM: 600 },
    tags: ['오닉스', '투광', '골드', '럭셔리'],
  },

  // TILE (6)
  {
    category: 'TILE',
    name: '서브웨이 타일 화이트',
    brand: 'Phomistone',
    productCode: 'PS-TIL-001',
    description: '클래식 서브웨이 타일. 주방 및 욕실에 적합.',
    colorHex: '#FFFFFF',
    physicalSize: { widthMM: 75, heightMM: 150 },
    tags: ['서브웨이', '화이트', '클래식', '주방'],
  },
  {
    category: 'TILE',
    name: '헥사곤 블랙',
    brand: 'Phomistone',
    productCode: 'PS-TIL-002',
    description: '육각형 모자이크 타일. 모던한 바닥재로 인기.',
    colorHex: '#2B2B2B',
    physicalSize: { widthMM: 100, heightMM: 100 },
    tags: ['헥사곤', '모자이크', '블랙', '모던'],
  },
  {
    category: 'TILE',
    name: '테라조 그레이',
    brand: 'Phomistone',
    productCode: 'PS-TIL-003',
    description: '레트로 감성의 테라조 타일. 다양한 컬러 칩 포함.',
    colorHex: '#A9A9A9',
    physicalSize: { widthMM: 600, heightMM: 600 },
    tags: ['테라조', '레트로', '그레이', '패턴'],
  },
  {
    category: 'TILE',
    name: '포슬린 우드 오크',
    brand: 'Phomistone',
    productCode: 'PS-TIL-004',
    description: '원목 느낌의 포슬린 타일. 내수성이 뛰어남.',
    colorHex: '#8B7355',
    physicalSize: { widthMM: 200, heightMM: 1200 },
    tags: ['포슬린', '우드', '오크', '내수성'],
  },
  {
    category: 'TILE',
    name: '모로칸 블루',
    brand: 'Phomistone',
    productCode: 'PS-TIL-005',
    description: '모로코 전통 패턴 타일. 포인트 벽면에 적합.',
    colorHex: '#1E90FF',
    physicalSize: { widthMM: 200, heightMM: 200 },
    tags: ['모로칸', '블루', '패턴', '포인트'],
  },
  {
    category: 'TILE',
    name: '대형 포슬린 화이트',
    brand: 'Phomistone',
    productCode: 'PS-TIL-006',
    description: '1200x600 대형 포슬린. 세련된 공간 연출.',
    colorHex: '#FAFAFA',
    physicalSize: { widthMM: 1200, heightMM: 600 },
    tags: ['대형', '포슬린', '화이트', '세련'],
  },

  // WOOD (5)
  {
    category: 'WOOD',
    name: '월넛 원목',
    brand: 'Phomistone',
    productCode: 'PS-WOD-001',
    description: '북미산 월넛 원목. 깊은 갈색의 고급스러운 질감.',
    colorHex: '#5D432C',
    physicalSize: { widthMM: 150, heightMM: 900 },
    tags: ['월넛', '원목', '브라운', '고급'],
  },
  {
    category: 'WOOD',
    name: '오크 내추럴',
    brand: 'Phomistone',
    productCode: 'PS-WOD-002',
    description: '유럽산 오크. 밝고 자연스러운 결.',
    colorHex: '#C4A35A',
    physicalSize: { widthMM: 180, heightMM: 1200 },
    tags: ['오크', '내추럴', '밝은', '유럽'],
  },
  {
    category: 'WOOD',
    name: '애쉬 화이트',
    brand: 'Phomistone',
    productCode: 'PS-WOD-003',
    description: '백색 도장 애쉬 원목. 밝고 깨끗한 느낌.',
    colorHex: '#E8E4E1',
    physicalSize: { widthMM: 130, heightMM: 900 },
    tags: ['애쉬', '화이트', '밝은', '도장'],
  },
  {
    category: 'WOOD',
    name: '티크 빈티지',
    brand: 'Phomistone',
    productCode: 'PS-WOD-004',
    description: '인도네시아산 티크. 빈티지 가공으로 깊은 멋.',
    colorHex: '#8B6914',
    physicalSize: { widthMM: 120, heightMM: 600 },
    tags: ['티크', '빈티지', '인도네시아', '깊은'],
  },
  {
    category: 'WOOD',
    name: '헤링본 오크',
    brand: 'Phomistone',
    productCode: 'PS-WOD-005',
    description: '헤링본 패턴 오크 마루. 클래식한 고급 느낌.',
    colorHex: '#B8860B',
    physicalSize: { widthMM: 90, heightMM: 450 },
    tags: ['헤링본', '오크', '클래식', '패턴'],
  },

  // FABRIC (4)
  {
    category: 'FABRIC',
    name: '린넨 내추럴',
    brand: 'Phomistone',
    productCode: 'PS-FAB-001',
    description: '천연 린넨 원단. 자연스러운 질감.',
    colorHex: '#E0D5C7',
    physicalSize: { widthMM: 1400, heightMM: 1000 },
    tags: ['린넨', '내추럴', '천연', '질감'],
  },
  {
    category: 'FABRIC',
    name: '벨벳 에메랄드',
    brand: 'Phomistone',
    productCode: 'PS-FAB-002',
    description: '고급 벨벳 원단. 깊은 에메랄드 그린.',
    colorHex: '#50C878',
    physicalSize: { widthMM: 1400, heightMM: 1000 },
    tags: ['벨벳', '에메랄드', '그린', '고급'],
  },
  {
    category: 'FABRIC',
    name: '울 그레이',
    brand: 'Phomistone',
    productCode: 'PS-FAB-003',
    description: '울 혼방 원단. 따뜻하고 부드러운 질감.',
    colorHex: '#696969',
    physicalSize: { widthMM: 1400, heightMM: 1000 },
    tags: ['울', '그레이', '따뜻한', '부드러운'],
  },
  {
    category: 'FABRIC',
    name: '코튼 화이트',
    brand: 'Phomistone',
    productCode: 'PS-FAB-004',
    description: '순면 원단. 깨끗하고 시원한 느낌.',
    colorHex: '#FFFAFA',
    physicalSize: { widthMM: 1400, heightMM: 1000 },
    tags: ['코튼', '화이트', '순면', '시원한'],
  },

  // WALLPAPER (4)
  {
    category: 'WALLPAPER',
    name: '그래스클로스 베이지',
    brand: 'Phomistone',
    productCode: 'PS-WAL-001',
    description: '천연 그래스클로스 벽지. 자연스러운 질감.',
    colorHex: '#F5DEB3',
    physicalSize: { widthMM: 530, heightMM: 1000 },
    tags: ['그래스클로스', '베이지', '천연', '벽지'],
  },
  {
    category: 'WALLPAPER',
    name: '다마스크 골드',
    brand: 'Phomistone',
    productCode: 'PS-WAL-002',
    description: '클래식 다마스크 패턴. 골드 메탈릭 효과.',
    colorHex: '#FFD700',
    physicalSize: { widthMM: 530, heightMM: 1000 },
    tags: ['다마스크', '골드', '클래식', '메탈릭'],
  },
  {
    category: 'WALLPAPER',
    name: '스트라이프 네이비',
    brand: 'Phomistone',
    productCode: 'PS-WAL-003',
    description: '세로 스트라이프 패턴. 세련된 네이비.',
    colorHex: '#000080',
    physicalSize: { widthMM: 530, heightMM: 1000 },
    tags: ['스트라이프', '네이비', '세련', '패턴'],
  },
  {
    category: 'WALLPAPER',
    name: '플로럴 핑크',
    brand: 'Phomistone',
    productCode: 'PS-WAL-004',
    description: '빈티지 플로럴 패턴. 로맨틱한 분위기.',
    colorHex: '#FFB6C1',
    physicalSize: { widthMM: 530, heightMM: 1000 },
    tags: ['플로럴', '핑크', '빈티지', '로맨틱'],
  },

  // PAINT (3)
  {
    category: 'PAINT',
    name: '화이트 아이보리',
    brand: 'Phomistone',
    productCode: 'PS-PNT-001',
    description: '따뜻한 톤의 아이보리 화이트 페인트.',
    colorHex: '#FFFFF0',
    physicalSize: { widthMM: 100, heightMM: 100 },
    tags: ['화이트', '아이보리', '따뜻한', '페인트'],
  },
  {
    category: 'PAINT',
    name: '차콜 그레이',
    brand: 'Phomistone',
    productCode: 'PS-PNT-002',
    description: '깊고 세련된 차콜 그레이 페인트.',
    colorHex: '#36454F',
    physicalSize: { widthMM: 100, heightMM: 100 },
    tags: ['차콜', '그레이', '세련', '페인트'],
  },
  {
    category: 'PAINT',
    name: '세이지 그린',
    brand: 'Phomistone',
    productCode: 'PS-PNT-003',
    description: '자연스러운 세이지 그린 페인트.',
    colorHex: '#9DC183',
    physicalSize: { widthMM: 100, heightMM: 100 },
    tags: ['세이지', '그린', '자연', '페인트'],
  },

  // METAL (3)
  {
    category: 'METAL',
    name: '브러시드 스테인리스',
    brand: 'Phomistone',
    productCode: 'PS-MTL-001',
    description: '브러시드 마감 스테인리스 스틸.',
    colorHex: '#C0C0C0',
    physicalSize: { widthMM: 1220, heightMM: 2440 },
    tags: ['스테인리스', '브러시드', '모던', '메탈'],
  },
  {
    category: 'METAL',
    name: '브라스 앤틱',
    brand: 'Phomistone',
    productCode: 'PS-MTL-002',
    description: '앤틱 가공 브라스. 빈티지한 분위기.',
    colorHex: '#B5A642',
    physicalSize: { widthMM: 1220, heightMM: 2440 },
    tags: ['브라스', '앤틱', '빈티지', '골드'],
  },
  {
    category: 'METAL',
    name: '블랙 스틸',
    brand: 'Phomistone',
    productCode: 'PS-MTL-003',
    description: '무광 블랙 마감 스틸 패널.',
    colorHex: '#1C1C1C',
    physicalSize: { widthMM: 1220, heightMM: 2440 },
    tags: ['블랙', '스틸', '무광', '모던'],
  },

  // CONCRETE & BRICK (3)
  {
    category: 'CONCRETE',
    name: '노출 콘크리트',
    brand: 'Phomistone',
    productCode: 'PS-CON-001',
    description: '인더스트리얼 노출 콘크리트 마감.',
    colorHex: '#808588',
    physicalSize: { widthMM: 600, heightMM: 600 },
    tags: ['콘크리트', '노출', '인더스트리얼', '그레이'],
  },
  {
    category: 'BRICK',
    name: '레드 브릭',
    brand: 'Phomistone',
    productCode: 'PS-BRK-001',
    description: '클래식 레드 브릭. 빈티지한 따뜻함.',
    colorHex: '#CB4154',
    physicalSize: { widthMM: 210, heightMM: 65 },
    tags: ['브릭', '레드', '빈티지', '따뜻한'],
  },
  {
    category: 'BRICK',
    name: '화이트 브릭',
    brand: 'Phomistone',
    productCode: 'PS-BRK-002',
    description: '화이트 페인트 브릭. 밝고 깨끗한 느낌.',
    colorHex: '#FDFDFD',
    physicalSize: { widthMM: 210, heightMM: 65 },
    tags: ['브릭', '화이트', '밝은', '깨끗한'],
  },
];

const handler = async (event: unknown, context: Context): Promise<{ statusCode: number; body: string }> => {
  console.log('Starting material seed...');

  const baseUrl = process.env.ASSETS_BASE_URL || 'https://assets.phomistone.com/materials';

  const materials: Array<Omit<Material, 'PK' | 'SK' | 'createdAt' | 'updatedAt' | 'entityType'>> = DEFAULT_MATERIALS.map((mat, index) => {
    const id = uuidv4();
    const slug = mat.productCode?.toLowerCase().replace(/-/g, '_') || `mat_${index}`;

    return {
      id,
      category: mat.category,
      name: mat.name,
      brand: mat.brand,
      productCode: mat.productCode,
      description: mat.description,
      colorHex: mat.colorHex,
      physicalSize: mat.physicalSize,
      tags: mat.tags,
      thumbnailUrl: `${baseUrl}/${slug}/thumbnail.jpg`,
      textureUrl: `${baseUrl}/${slug}/texture.jpg`,
      normalMapUrl: `${baseUrl}/${slug}/normal.jpg`,
      isPublic: true,
      usageCount: 0,
    };
  });

  try {
    await MaterialRepo.createBatch(materials);

    console.log(`Successfully seeded ${materials.length} materials`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Successfully seeded ${materials.length} materials`,
        materials: materials.map(m => ({
          id: m.id,
          name: m.name,
          category: m.category,
          productCode: m.productCode,
        })),
      }),
    };
  } catch (error) {
    console.error('Failed to seed materials:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export const main = createInternalHandler(handler);

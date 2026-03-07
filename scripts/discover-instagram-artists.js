/**
 * Instagram 高人气陶艺作家发现工具
 *
 * 功能：
 * 1. 搜索 Instagram 上粉丝 10K+ 的日本陶艺作家
 * 2. 提取基础信息（用户名、粉丝数、简介、网站）
 * 3. 生成待补充的作家数据模板
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  minFollowers: 10000,
  searchHashtags: [
    'うつわ',           // 器皿 (1M+ posts)
    '陶芸',             // 陶艺 (500K+ posts)
    '陶器',             // 陶器 (300K+ posts)
    'やきもの',         // 烧物 (200K+ posts)
    '陶芸家',           // 陶艺家
    'ceramicartist',
    'pottery',
    'japanesepottery',
  ],
  keywords: [
    '陶芸', '陶芸家', 'pottery', 'ceramic', 'ceramics',
    'potter', '窯', 'kiln', '作家', 'artist'
  ]
};

/**
 * 步骤 1: 手动搜索 Instagram (需要人工执行)
 *
 * 由于 Instagram API 限制，这一步需要手动操作：
 *
 * 1. 打开 Instagram 网页版
 * 2. 搜索 hashtag：#うつわ
 * 3. 点击 "Top" 标签查看热门帖子
 * 4. 找到看起来是陶艺作家的账号
 * 5. 检查：
 *    - 粉丝数 >= 10,000
 *    - Bio 包含陶艺相关关键词
 *    - 地点显示日本
 * 6. 将账号信息填入下面的模板
 */

/**
 * 作家数据模板生成器
 */
function generateArtistTemplate(instagramData) {
  return {
    // 必填字段（从 Instagram 提取）
    instagramHandle: instagramData.username,
    instagramFollowers: instagramData.followers,
    instagramLastSync: new Date().toISOString().split('T')[0],

    // 从 Instagram bio 提取
    websiteUrl: extractWebsiteFromBio(instagramData.bio),

    // 需要人工补充的字段
    artistSlug: `${instagramData.username}`, // 需要调整为合适的 slug
    nameZh: null,  // 需要人工填写中文名
    nameJa: instagramData.displayName || null, // 从 Instagram 显示名提取
    nameEn: null,  // 需要人工填写英文名

    bio: instagramData.bio || '待补充作家简介（200-300字）',
    birthYear: null, // 需要搜索补充
    deathYear: null,

    region: extractLocationFromBio(instagramData.bio) || '待确认产地',
    style: '待补充作品风格',

    kilnName: null,
    studioName: null,
    locationPrefecture: null,
    locationCity: null,

    avatar: instagramData.profilePicUrl || null,

    // 来源（Instagram + 需要补充2个以上）
    sources: [
      {
        url: `https://www.instagram.com/${instagramData.username}/`,
        title: `Instagram @${instagramData.username}`,
        type: '社交媒体',
        accessedAt: new Date().toISOString().split('T')[0]
      },
      {
        url: 'TODO: 补充第二个来源（官网/画廊/展讯）',
        title: 'TODO',
        type: 'TODO',
        accessedAt: new Date().toISOString().split('T')[0]
      },
      {
        url: 'TODO: 补充第三个来源',
        title: 'TODO',
        type: 'TODO',
        accessedAt: new Date().toISOString().split('T')[0]
      }
    ],

    published: false, // 信息补充完整后改为 true

    // 元数据
    discoveryMethod: 'instagram-search',
    discoveryDate: new Date().toISOString().split('T')[0],
    needsReview: true
  };
}

/**
 * 从 Instagram bio 提取网站链接
 */
function extractWebsiteFromBio(bio) {
  if (!bio) return null;

  // 匹配 URL 模式
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const matches = bio.match(urlPattern);

  if (matches && matches.length > 0) {
    // 过滤掉 Instagram/Facebook 等社交媒体链接
    const filtered = matches.filter(url =>
      !url.includes('instagram.com') &&
      !url.includes('facebook.com') &&
      !url.includes('twitter.com')
    );
    return filtered[0] || null;
  }

  return null;
}

/**
 * 从 Instagram bio 提取地点信息
 */
function extractLocationFromBio(bio) {
  if (!bio) return null;

  // 日本地名关键词
  const locations = [
    '北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島',
    '茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川',
    '新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知',
    '三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山',
    '鳥取', '島根', '岡山', '広島', '山口',
    '徳島', '香川', '愛媛', '高知',
    '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄',
    // 陶艺产地
    '益子', '信楽', '備前', '瀬戸', '美濃', '有田', '唐津', '萩', '九谷'
  ];

  for (const loc of locations) {
    if (bio.includes(loc)) {
      return loc;
    }
  }

  return null;
}

/**
 * 批量生成待补充作家模板
 */
function generateBatchTemplate(instagramAccounts) {
  const artists = instagramAccounts.map(account =>
    generateArtistTemplate(account)
  );

  const outputPath = path.join(__dirname, '../data/discovered-artists-batch.json');
  fs.writeFileSync(outputPath, JSON.stringify(artists, null, 2));

  console.log(`✅ 已生成 ${artists.length} 位作家模板`);
  console.log(`📄 保存位置: ${outputPath}`);
  console.log('\n📝 下一步：');
  console.log('1. 打开生成的 JSON 文件');
  console.log('2. 补充每位作家的必填信息（中文名、简介、产地等）');
  console.log('3. 搜索并添加至少 2 个额外来源');
  console.log('4. 将 published 改为 true');
  console.log('5. 运行导入脚本导入数据库\n');

  return artists;
}

/**
 * 示例：手动输入发现的作家数据
 */
const DISCOVERED_ARTISTS = [
  // 示例 1: 高人气作家
  {
    username: 'example_potter',
    displayName: '山田太郎',
    followers: 25000,
    bio: '陶芸家 | 益子焼 | https://example-pottery.com',
    profilePicUrl: null
  },

  // 示例 2: 从这里开始添加你发现的作家
  // 访问 Instagram 搜索以下 hashtags:
  // #うつわ #陶芸 #陶器 #やきもの
  // 找到粉丝 10K+ 的日本陶艺作家后，填写下面的格式：

  /*
  {
    username: 'instagram用户名',
    displayName: 'Instagram显示名',
    followers: 粉丝数,
    bio: 'Instagram简介（复制粘贴）',
    profilePicUrl: null
  },
  */
];

/**
 * 主函数
 */
function main() {
  console.log('========================================');
  console.log('Instagram 高人气作家发现工具');
  console.log('========================================\n');

  console.log('📋 搜索指南：\n');
  console.log('1. 访问 Instagram 网页版');
  console.log('2. 搜索推荐 hashtags：');
  CONFIG.searchHashtags.forEach(tag => {
    console.log(`   - #${tag}`);
  });
  console.log('\n3. 筛选标准：');
  console.log(`   - 粉丝数 >= ${CONFIG.minFollowers.toLocaleString()}`);
  console.log('   - Bio 包含陶艺相关关键词');
  console.log('   - 地点显示日本或日本地名');
  console.log('   - 帖子内容确认是陶艺作品\n');

  console.log('4. 将发现的作家信息填入 DISCOVERED_ARTISTS 数组');
  console.log('5. 重新运行此脚本生成模板\n');

  if (DISCOVERED_ARTISTS.length === 1) {
    console.log('⚠️  当前只有示例数据，请先添加发现的作家！\n');
    console.log('示例数据格式：');
    console.log(JSON.stringify(DISCOVERED_ARTISTS[0], null, 2));
    console.log('\n');
    return;
  }

  // 生成模板
  const artists = generateBatchTemplate(DISCOVERED_ARTISTS);

  // 统计信息
  console.log('📊 发现统计：');
  console.log(`   总数: ${artists.length} 位`);
  console.log(`   平均粉丝: ${Math.round(
    artists.reduce((sum, a) => sum + a.instagramFollowers, 0) / artists.length
  ).toLocaleString()}`);
  console.log(`   最高粉丝: ${Math.max(...artists.map(a => a.instagramFollowers)).toLocaleString()}`);
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  generateArtistTemplate,
  generateBatchTemplate,
  extractWebsiteFromBio,
  extractLocationFromBio
};

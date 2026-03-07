/**
 * Task 01 数据导入脚本
 * 导入 15 个釉药技法和 33 位作家信息
 */

const fs = require('fs');
const path = require('path');

// 读取 JSON 文件
const glazeTechniques = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../glaze-techniques.json'), 'utf-8')
);
const relatedArtists = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../related-artists-detail.json'), 'utf-8')
);

console.log(`📦 准备导入：`);
console.log(`  - 釉药技法：${glazeTechniques.length} 条`);
console.log(`  - 作家信息：${relatedArtists.length} 位`);
console.log('');

// API endpoint
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * 导入作家信息
 */
async function importArtists() {
  console.log('🎨 开始导入作家信息...');

  let successCount = 0;
  let failCount = 0;
  const errors = [];

  for (const artist of relatedArtists) {
    try {
      // 转换数据格式以匹配 API schema
      const artistData = {
        slug: artist.artistSlug,
        nameZh: artist.nameZh,
        nameJa: artist.nameJa,
        nameEn: artist.nameEn || null,
        bio: artist.bio,
        birthYear: artist.birthYear,
        deathYear: artist.deathYear,
        region: artist.region,
        style: artist.style,
        awards: artist.awards || [],
        exhibitions: artist.exhibitions || [],
        kilnName: artist.kilnName,
        studioName: artist.studioName,
        locationPrefecture: artist.locationPrefecture,
        locationCity: artist.locationCity,
        locationArea: artist.locationArea,
        kilnType: artist.kilnType || null,
        instagramHandle: artist.instagramHandle,
        websiteUrl: artist.websiteUrl,
        avatar: artist.avatar || null,
        images: artist.images || [],
        sources: artist.sources || [],
        published: true,
      };

      const response = await fetch(`${API_BASE}/api/admin/artists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(artistData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      successCount++;
      console.log(`  ✅ ${artist.nameZh} (${artist.artistSlug})`);
    } catch (error) {
      failCount++;
      errors.push({ artist: artist.nameZh, error: error.message });
      console.log(`  ❌ ${artist.nameZh}: ${error.message}`);
    }
  }

  console.log('');
  console.log(`作家导入完成：✅ ${successCount} 成功，❌ ${failCount} 失败`);
  if (errors.length > 0) {
    console.log('\n错误详情：');
    errors.forEach(e => console.log(`  - ${e.artist}: ${e.error}`));
  }
  console.log('');

  return { successCount, failCount, errors };
}

/**
 * 导入釉药技法
 */
async function importGlazeTechniques() {
  console.log('🏺 开始导入釉药技法...');

  let successCount = 0;
  let failCount = 0;
  const errors = [];

  for (const technique of glazeTechniques) {
    try {
      // 转换数据格式
      const techniqueData = {
        slug: technique.slug,
        nameZh: technique.nameZh,
        nameJa: technique.nameJa,
        nameEn: technique.nameEn || null,
        category: technique.category,
        region: technique.region,
        type: technique.type || null,
        description: technique.description,
        positioning: technique.positioning,
        signatureFeatures: technique.signatureFeatures || [],
        keywords: technique.keywords || [],
        notableArtists: technique.notableArtists || [],
        representativeForms: technique.representativeForms || [],
        images: technique.images || [],
        sources: technique.sources || [],
        published: true,
      };

      const response = await fetch(`${API_BASE}/api/admin/pottery-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(techniqueData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      successCount++;
      console.log(`  ✅ ${technique.nameZh} (${technique.slug})`);
    } catch (error) {
      failCount++;
      errors.push({ technique: technique.nameZh, error: error.message });
      console.log(`  ❌ ${technique.nameZh}: ${error.message}`);
    }
  }

  console.log('');
  console.log(`技法导入完成：✅ ${successCount} 成功，❌ ${failCount} 失败`);
  if (errors.length > 0) {
    console.log('\n错误详情：');
    errors.forEach(e => console.log(`  - ${e.technique}: ${e.error}`));
  }
  console.log('');

  return { successCount, failCount, errors };
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Task 01 数据批量导入');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: 导入作家（先导入作家，因为技法可能引用作家）
    const artistsResult = await importArtists();

    // Step 2: 导入釉药技法
    const techniquesResult = await importGlazeTechniques();

    // 汇总报告
    console.log('='.repeat(60));
    console.log('📊 导入汇总报告');
    console.log('='.repeat(60));
    console.log('');
    console.log(`作家：${artistsResult.successCount}/${relatedArtists.length} 成功`);
    console.log(`技法：${techniquesResult.successCount}/${glazeTechniques.length} 成功`);
    console.log('');

    if (artistsResult.failCount === 0 && techniquesResult.failCount === 0) {
      console.log('✅ 全部导入成功！');
    } else {
      console.log('⚠️  部分导入失败，请检查错误详情');
    }

    // 生成导入报告文件
    const report = {
      importDate: new Date().toISOString(),
      artists: {
        total: relatedArtists.length,
        success: artistsResult.successCount,
        failed: artistsResult.failCount,
        errors: artistsResult.errors,
      },
      techniques: {
        total: glazeTechniques.length,
        success: techniquesResult.successCount,
        failed: techniquesResult.failCount,
        errors: techniquesResult.errors,
      },
    };

    fs.writeFileSync(
      path.join(__dirname, '../import-task01-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('');
    console.log('📄 导入报告已保存：import-task01-report.json');
  } catch (error) {
    console.error('❌ 导入过程发生错误：', error);
    process.exit(1);
  }
}

// 执行导入
main();

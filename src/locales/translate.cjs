const fs = require('fs');
const translate = require('@iamtraction/google-translate');

async function main() {
  const enData = JSON.parse(fs.readFileSync('en.json', 'utf8'));
  const languages = ['mr', 'pa', 'ta', 'te'];
  const keys = Object.keys(enData);
  
  for (const lang of languages) {
    console.log(`Translating to ${lang}...`);
    const translatedData = {};
    
    // Batch translations to avoid hitting rate limits or URL length limits
    // Since some strings are short, we can translate them one by one with a small delay
    // or we can batch them. Let's do small batches.
    const batchSize = 20;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batchKeys = keys.slice(i, i + batchSize);
      const batchValues = batchKeys.map(k => enData[k]);
      
      try {
        const results = await Promise.all(batchValues.map(text => 
          translate(text, { from: 'en', to: lang }).then(res => res.text).catch(err => text)
        ));
        
        batchKeys.forEach((key, idx) => {
          translatedData[key] = results[idx];
        });
        
        console.log(`  Progress: ${Math.min(i + batchSize, keys.length)} / ${keys.length}`);
        
        // Small delay to prevent rate limit
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        console.error('Error translating batch:', e);
      }
    }
    
    fs.writeFileSync(`${lang}.json`, JSON.stringify(translatedData, null, 2), 'utf8');
    console.log(`Finished writing ${lang}.json\n`);
  }
}

main().catch(console.error);

const fs = require('fs');

console.log('measure_all_nav.js exists?', fs.existsSync('scratch/measure_all_nav.js'));
if (fs.existsSync('scratch/measure_all_nav.js')) {
  console.log(fs.readFileSync('scratch/measure_all_nav.js', 'utf8').slice(0, 500));
}

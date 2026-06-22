const https = require('https');

const CSV_URL = "https://www.tanzeem.org/wp-content/uploads/2025/12/khitaba-e-jumma.csv";

https.get(CSV_URL, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const lines = data.split('\n');
    console.log('Total Lines:', lines.length);
    console.log('Headers:', lines[0]);
    console.log('Sample Row 1:', lines[1]);
    console.log('Sample Row 2:', lines[2]);
    console.log('Sample Row 3:', lines[3]);
  });
}).on('error', (err) => {
  console.error(err);
});

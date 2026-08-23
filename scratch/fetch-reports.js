import http from 'http';

const routes = [
  '/admin/reports',
  '/admin/reports/revenue',
  '/admin/reports/expenses',
  '/admin/reports/purchases',
  '/admin/reports/payroll',
  '/admin/reports/receivables'
];

async function fetchRoutes() {
  for (const route of routes) {
    console.log(`\nFetching ${route}...`);
    try {
      const res = await new Promise((resolve, reject) => {
        http.get(`http://localhost:3000${route}`, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        }).on('error', reject);
      });
      console.log(`Status: ${res.statusCode}`);
      if (res.statusCode !== 200) {
        console.log(`Error Response Body:`, res.data.substring(0, 1000));
      }
    } catch (err) {
      console.error(`Failed to fetch ${route}:`, err.message);
    }
  }
}

fetchRoutes();

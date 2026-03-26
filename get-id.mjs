import https from 'https';

https.get('https://api.github.com/users/teso07cel-star', { headers: { 'User-Agent': 'Node.js' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data).id));
});

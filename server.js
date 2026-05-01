const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const ROOT = __dirname;
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jsx': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(type.includes('application/json') ? JSON.stringify(body) : body);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const p = decoded === '/' ? '/Lehrerapp.html' : decoded;
  const abs = path.normalize(path.join(ROOT, p));
  if (!abs.startsWith(ROOT)) return null;
  return abs;
}

async function handleClaude(prompt) {
  if (!API_KEY) throw new Error('missing_api_key');
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1400,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) {
    const e = await response.text();
    throw new Error(`anthropic_${response.status}:${e}`);
  }
  const data = await response.json();
  return (data.content || [])
    .filter(c => c.type === 'text')
    .map(c => c.text)
    .join('\n')
    .trim();
}

async function extractStudentsFromFile({ mimeType, fileBase64, fileName }) {
  if (!API_KEY) throw new Error('missing_api_key');
  const isPdf = mimeType === 'application/pdf';
  const isImage = mimeType === 'image/png' || mimeType === 'image/jpeg';
  if (!isPdf && !isImage) throw new Error('unsupported_file_type');

  const contentBlock = isPdf
    ? { type: 'document', source: { type: 'base64', media_type: mimeType, data: fileBase64 } }
    : { type: 'image', source: { type: 'base64', media_type: mimeType, data: fileBase64 } };

  const prompt = `Extrahiere ausschließlich Schülernamen aus dieser Klassenliste-Datei (${fileName}).
Regeln:
- Gib NUR eine JSON-Antwort zurück.
- Format: {"students":["Vorname Nachname", "..."]}
- Keine Kommentare, kein Markdown.
- Entferne Zeilen ohne Personennamen.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1800,
      temperature: 0,
      messages: [{ role: 'user', content: [contentBlock, { type: 'text', text: prompt }] }],
    }),
  });
  if (!response.ok) {
    const e = await response.text();
    throw new Error(`anthropic_${response.status}:${e}`);
  }
  const data = await response.json();
  const text = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n').trim();
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new Error('invalid_extract_json'); }
  return Array.isArray(parsed.students) ? parsed.students : [];
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/generate') {
    try {
      let raw = '';
      req.on('data', chunk => { raw += chunk; });
      req.on('end', async () => {
        try {
          const body = JSON.parse(raw || '{}');
          if (!body.prompt || typeof body.prompt !== 'string') {
            return send(res, 400, { error: 'prompt_required' });
          }
          const text = await handleClaude(body.prompt);
          return send(res, 200, { text });
        } catch (err) {
          return send(res, 500, { error: String(err.message || err) });
        }
      });
      return;
    } catch (err) {
      return send(res, 500, { error: String(err.message || err) });
    }
  }

  if (req.method === 'POST' && req.url === '/api/extract-students') {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', async () => {
      try {
        const body = JSON.parse(raw || '{}');
        const { mimeType, fileBase64, fileName } = body;
        if (!mimeType || !fileBase64) return send(res, 400, { error: 'file_required' });
        const students = await extractStudentsFromFile({ mimeType, fileBase64, fileName: fileName || 'upload' });
        return send(res, 200, { students });
      } catch (err) {
        return send(res, 500, { error: String(err.message || err) });
      }
    });
    return;
  }

  const fullPath = safePath(req.url || '/');
  if (!fullPath) return send(res, 403, { error: 'forbidden' });
  fs.readFile(fullPath, (err, data) => {
    if (err) return send(res, 404, { error: 'not_found' });
    const ext = path.extname(fullPath).toLowerCase();
    return send(res, 200, data, MIME[ext] || 'application/octet-stream');
  });
});

server.listen(PORT, () => {
  console.log(`Lehrerapp running on http://localhost:${PORT}`);
});

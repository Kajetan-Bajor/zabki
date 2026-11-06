import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('vercel-output', { recursive: true });
// The actual pages and assets are served by the existing Sites backend.
writeFileSync('vercel-output/.gitkeep', '');
console.log('Vercel proxy prepared.');

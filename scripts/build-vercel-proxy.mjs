import { cpSync, rmSync } from 'node:fs';

const output = 'vercel-output';
rmSync(output, { recursive: true, force: true });
cpSync('public', output, { recursive: true });
console.log('Prepared parish website assets for Vercel.');

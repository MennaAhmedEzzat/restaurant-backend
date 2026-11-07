import { createServer } from 'http';
import { parse } from 'url';
// نقوم بتوجيه الـ handler للعمل مباشرة مع ملف البناء النهائي
import '../dist/main';

export default function handler(req: any, res: any) {
  // Vercel Serverless Function Handler
  res.status(200).json({ status: 'Server is running successfully' });
}
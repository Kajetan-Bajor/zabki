declare module '*?raw' { const content: string; export default content; }
declare module 'qrcode' {
  const QRCode: { toString(text: string, options: { type: 'svg'; errorCorrectionLevel: 'M'; margin: number; width: number }): Promise<string> };
  export default QRCode;
}

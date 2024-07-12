// types/ag-psd.d.ts

declare module 'ag-psd' {
    export interface Psd {
      width: number;
      height: number;
      children: any[];
      canvas?: HTMLCanvasElement;
    }
  
    export function readPsd(buffer: ArrayBuffer): Psd;
    export function writePsd(psd: Psd): ArrayBuffer;
    export function createCanvasFromPsd(psd: Psd): HTMLCanvasElement;
  }
  
// https://github.com/axe312ger/sqip/blob/6482164ff2125f5454d0c9f301cb5279f10694ff/src/index.js#L242-L247
declare module "sqip" {
  export interface SqipOptions {
    blur: number;
    filename?: string;
    mode?: number;
    numberOfPrimitives?: number;
  }

  export interface SqipResult {
    final_svg: string;
    svg_base64encoded: string;
    img_dimensions: { height: string; width: string; type: string };
  }

  export default function main(options: SqipOptions): SqipResult;
}

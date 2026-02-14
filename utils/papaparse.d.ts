declare module 'papaparse' {
  export interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: any;
  }

  export interface ParseConfig<T> {
    header?: boolean;
    skipEmptyLines?: boolean;
    complete?: (results: ParseResult<T>) => void;
    error?: (err: any) => void;
  }

  export function parse<T = any>(input: string, config?: ParseConfig<T>): ParseResult<T>;
}
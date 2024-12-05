declare module '*.txt' {
    export function parse(input: string): any;
    export function stringify(input: any): string;
}
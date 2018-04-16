export declare type Input = {
    input: string;
    output?: string;
    format?: string;
    target?: string;
    sourcemap?: "inline" | "external" | "none";
    declaration?: boolean;
    minify?: boolean;
};
export declare type Output = {
    js: {
        file: string;
        content: string;
    };
    map?: {
        file: string;
        content: string;
        isExternal: boolean;
    };
};
export default function rollerblade(inputs: Input[]): Promise<Output[]>;

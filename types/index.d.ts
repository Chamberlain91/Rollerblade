export declare type Input = {
    input: string;
    output?: string;
    format?: string;
    sourcemap?: "inline" | "external";
    compress?: boolean;
    target?: string;
    tsconfig?: any;
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

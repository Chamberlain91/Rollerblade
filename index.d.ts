export declare type Input = {
    input: string;
    output?: string;
    format?: string;
    sourcemap?: boolean;
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
    };
};
export default function rollerblade(paths: Input[]): Promise<Output[]>;

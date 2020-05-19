export function fib(x: number): number {
    if (x < 0) throw new Error('Negative value');
    else if (x <= 1) return 1;
    else return fib(x - 1) + fib(x - 2);
}

export function* range(start: number, end: number) {

    for (let i = start; i < end; i++)
        yield i;
}
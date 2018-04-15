export function fib(x: number) {
    if (x < 0) throw new Error('Negative value');
    if (x <= 1) return 1;
    else return fib(x - 1) + fib(x - 2);
}
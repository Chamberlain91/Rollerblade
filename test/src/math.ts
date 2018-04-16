import { fib, range } from "./inc";
import { dirname } from "path";

console.log((() => fib(10 + 3))());
console.log(dirname("/i/am/a/file.txt"));

for (let x of range(0, 10))
    console.log(x);

fib(-1);

export default { fib, dirname };
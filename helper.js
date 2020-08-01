import path from 'path';

export function changeExtension(src, ext) {
    let fileInfo = path.parse(src);
    return path.join(fileInfo.dir, fileInfo.name + "." + ext);
}
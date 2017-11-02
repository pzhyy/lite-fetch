export const isEmpty = (obj: object): boolean => {
    return !Object.keys(obj).length;
}

export const isObject = (value: any): boolean => {
    return Object.prototype.toString.call(value) === '[object Object]';
}

export const mixin = (target: object = {}, ...sources: object[]): object => {
    sources.forEach(source => {
        Object.keys(source).forEach(key => {
            const value = source[key];
    
            if (isObject(value)) {
                target[key] = mixin(target[key], value);
            } else {
                target[key] = value;
            }
        });
    })

    return target;
}

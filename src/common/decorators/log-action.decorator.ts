export function LogAction() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            console.log(`[${new Date().toISOString()}] Executing: ${propertyKey}`);
            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}
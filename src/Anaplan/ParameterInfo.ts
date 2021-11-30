export class ParameterInfo {
    public readonly name: string;
    public readonly details: string;
    public readonly optional: boolean;
    constructor(name: string, details: string, optional: boolean) {
        this.name = name;
        this.details = details;
        this.optional = optional;
    }
}
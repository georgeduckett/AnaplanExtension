export class ParameterInfo {
    public readonly name: string;
    public readonly details: string;
    public readonly format: string | undefined;
    public readonly required: boolean | undefined;
    constructor(name: string, details: string, format: string | undefined, required: boolean | undefined) {
        this.name = name;
        this.details = details;
        this.required = required;
        this.format = format;
    }
}
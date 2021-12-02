import { GeneratedParameterInfo } from "./GeneratedParameterInfo";

export class GeneratedFunctionInfo {
    public name: string;
    public description: string;
    public syntax: string;
    public type: string;
    public htmlPageName: string;
    public paramInfo: GeneratedParameterInfo[];
    constructor(name: string, description: string, syntax: string, type: string, htmlPageName: string, paramInfo: GeneratedParameterInfo[]) {
        this.name = name;
        this.description = description;
        this.syntax = syntax;
        this.type = type;
        this.htmlPageName = htmlPageName;
        this.paramInfo = paramInfo;
    }
}
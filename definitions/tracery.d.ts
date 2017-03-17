declare module tracery{
    export class TraceryNode{
        depth:number;
        childIndex:number;
        parent:TraceryNode;
        children:TraceryNode[];
        finishedText:string;

        toString():string;
    }

    export class Grammar{
        clearState():void;
        addModifiers(mods:{}):void;
        expand(rule:string, allowEscapeChars?:boolean):TraceryNode;
        flatten(rule:string, allowEscapeChars?:boolean):string;
        toJSON():string;
        toHTML():string;
    }

    export function createGrammar(raw?:{}):Grammar;
    export function setRng(newRng:()=>number):void;
}
import { Question } from "./question";
export declare class RendererFactory {
    static Instance: RendererFactory;
    private renderersHash;
    unregisterRenderer(questionType: string, rendererAs: string): void;
    registerRenderer(questionType: string, renderAs: string, renderer: any): void;
    getRenderer(questionType: string, renderAs: string): any;
    getRendererByQuestion(question: Question): any;
    clear(): void;
}

import { ItemValue } from "../itemvalue";
import { DragDropChoices } from "./choices";
export declare class DragDropRankingChoices extends DragDropChoices {
    protected get draggedElementType(): string;
    protected createDraggedElementShortcut(text: string, draggedElementNode: HTMLElement, event: PointerEvent): HTMLElement;
    private get shortcutClass();
    protected getDropTargetByDataAttributeValue(dataAttributeValue: string): ItemValue;
    private isDragOverRootNode;
    protected findDropTargetNodeByDragOverNode(dragOverNode: HTMLElement): HTMLElement;
    private getIsDragOverRootNode;
    protected isDropTargetValid(dropTarget: ItemValue, dropTargetNode?: HTMLElement): boolean;
    protected calculateIsBottom(clientY: number): boolean;
    protected doDragOver: () => any;
    protected afterDragOver(dropTargetNode: HTMLElement): void;
    protected updateDraggedElementShortcut(newIndex: number): void;
    protected ghostPositionChanged(): void;
    protected doBanDropHere: () => any;
    protected doDrop(): any;
    clear(): void;
}

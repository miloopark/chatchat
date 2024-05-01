import { Action, BaseAction, IAction } from "./actions/action";
import { ListModel } from "./list";
export declare class MultiSelectListModel<T extends BaseAction = Action> extends ListModel<T> {
    selectedItems: Array<IAction>;
    hideSelectedItems: boolean;
    private updateItemState;
    constructor(items: Array<IAction>, onSelectionChanged: (item: T, status: string) => void, allowSelection: boolean, selectedItems?: Array<IAction>, onFilterStringChangedCallback?: (text: string) => void, elementId?: string);
    onItemClick: (item: T) => void;
    isItemDisabled: (itemValue: T) => boolean;
    isItemSelected: (itemValue: T) => boolean;
    updateState(): void;
    setSelectedItems(newItems: Array<IAction>): void;
    selectFocusedItem(): void;
}

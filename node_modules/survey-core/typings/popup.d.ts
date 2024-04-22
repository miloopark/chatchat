import { Base, EventBase } from "./base";
import { IAction } from "./actions/action";
import { VerticalPosition, HorizontalPosition, PositionMode } from "./utils/popup";
export interface IPopupOptionsBase {
    onHide?: () => void;
    onShow?: () => void;
    onApply?: () => boolean;
    onCancel?: () => void;
    cssClass?: string;
    title?: string;
    verticalPosition?: VerticalPosition;
    horizontalPosition?: HorizontalPosition;
    showPointer?: boolean;
    isModal?: boolean;
    displayMode?: "popup" | "overlay";
}
export interface IDialogOptions extends IPopupOptionsBase {
    componentName: string;
    data: any;
    onApply: () => boolean;
    isFocusedContent?: boolean;
}
export interface IPopupModel<T = any> extends IDialogOptions {
    contentComponentName: string;
    contentComponentData: T;
}
export declare class PopupModel<T = any> extends Base {
    private onDispose;
    setWidthByTarget: boolean;
    focusFirstInputSelector: string;
    contentComponentName: string;
    contentComponentData: T;
    verticalPosition: VerticalPosition;
    horizontalPosition: HorizontalPosition;
    showPointer: boolean;
    isModal: boolean;
    isFocusedContent: boolean;
    isFocusedContainer: boolean;
    onCancel: () => void;
    onApply: () => boolean;
    onHide: () => void;
    onShow: () => void;
    cssClass: string;
    title: string;
    overlayDisplayMode: "auto" | "overlay" | "dropdown-overlay";
    displayMode: "popup" | "overlay";
    positionMode: PositionMode;
    onVisibilityChanged: EventBase<PopupModel>;
    onFooterActionsCreated: EventBase<Base>;
    onRecalculatePosition: EventBase<Base>;
    private refreshInnerModel;
    constructor(contentComponentName: string, contentComponentData: T, verticalPosition?: VerticalPosition, horizontalPosition?: HorizontalPosition, showPointer?: boolean, isModal?: boolean, onCancel?: () => void, onApply?: () => boolean, onHide?: () => void, onShow?: () => void, cssClass?: string, title?: string, onDispose?: () => void);
    get isVisible(): boolean;
    set isVisible(value: boolean);
    toggleVisibility(): void;
    recalculatePosition(isResetHeight: boolean): void;
    updateFooterActions(footerActions: Array<IAction>): Array<IAction>;
    dispose(): void;
}
export declare function createDialogOptions(componentName: string, data: any, onApply: () => boolean, onCancel?: () => void, onHide?: () => void, onShow?: () => void, cssClass?: string, title?: string, displayMode?: "popup" | "overlay"): IDialogOptions;

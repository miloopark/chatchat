export declare type VerticalPosition = "top" | "bottom" | "middle";
export declare type HorizontalPosition = "left" | "right" | "center";
export declare type PositionMode = "flex" | "fixed";
export interface IPosition {
    left?: number | string;
    top?: number | string;
}
export interface INumberPosition extends IPosition {
    left?: number;
    top?: number;
}
export interface ISize {
    width: number;
    height: number;
}
export declare class PopupUtils {
    static bottomIndent: number;
    static calculatePosition(targetRect: ClientRect, height: number, width: number, verticalPosition: VerticalPosition, horizontalPosition: HorizontalPosition, showPointer: boolean, positionMode?: PositionMode): INumberPosition;
    static getCorrectedVerticalDimensions(top: number, height: number, windowHeight: number, verticalPosition: VerticalPosition): any;
    static updateHorizontalDimensions(left: number, width: number, windowWidth: number, horizontalPosition: HorizontalPosition, positionMode?: PositionMode, margins?: {
        left: number;
        right: number;
    }): {
        width: number;
        left: number;
    };
    static updateVerticalPosition(targetRect: ClientRect, height: number, verticalPosition: VerticalPosition, showPointer: boolean, windowHeight: number): VerticalPosition;
    static calculatePopupDirection(verticalPosition: VerticalPosition, horizontalPosition: HorizontalPosition): string;
    static calculatePointerTarget(targetRect: ClientRect, top: number, left: number, verticalPosition: VerticalPosition, horizontalPosition: HorizontalPosition, marginLeft?: number, marginRight?: number): INumberPosition;
}

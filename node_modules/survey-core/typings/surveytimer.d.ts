import { Event } from "./base";
export declare var surveyTimerFunctions: {
    setTimeout: (func: () => any) => number;
    clearTimeout: (timerId: number) => void;
    safeTimeOut: (func: () => any, delay: number) => number | any;
};
export declare class SurveyTimer {
    private static instanceValue;
    static get instance(): SurveyTimer;
    private listenerCounter;
    private timerId;
    onTimer: Event<() => any, SurveyTimer, any>;
    start(func?: () => any): void;
    stop(func?: () => any): void;
    doTimer(): void;
}

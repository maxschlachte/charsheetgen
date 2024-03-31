import { HOOKS } from "@/types/enums";

class HooksService {
    private hooks: Record<HOOKS, Function>;

    constructor() {
        const emptyHookEvent: Function = () => {};
        this.hooks = {
            [HOOKS.NEW]: emptyHookEvent
        };
    }

    public execute(hookId: HOOKS): void {
        if (Object.values(HOOKS).map(hook => hook.toLowerCase()).includes(hookId.toLowerCase())) {
            this.hooks[hookId.toUpperCase() as HOOKS]();
        } else {
            console.error("Unknown event: " + hookId);
        }
    }
    
    public on(hookId: string, callback: Function) {
        if (Object.values(HOOKS).map(hook => hook.toLowerCase()).includes(hookId.toLowerCase())) {
            this.hooks[hookId.toUpperCase() as HOOKS] = callback;
        } else {
            console.error("Unknown event: " + hookId);
        }
    }
}

const hooksService = new HooksService()

export function useHooks(): HooksService {
  return hooksService;
}
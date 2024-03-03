class StorageService {
    private static ID: string = "id:CharsheetStorage";

    private storage: Record<string, string | number>;

    constructor() {
        this.storage = this.load();
    }

    public save(key: string, value: string | number) {
        this.storage[key] = value;
        localStorage.setItem(StorageService.ID, JSON.stringify(this.storage));
    }

    public getStorage(): Record<string, string | number> {
        return this.storage;
    }

    private load() {
        const storedData = localStorage.getItem(StorageService.ID);
        try {
            return storedData ? JSON.parse(storedData) : {};
        } catch(e) {
            console.warn("Unable to parse stored data!");
            return {};
        }
    }
}

const storageService = new StorageService();

export function useStorage(): StorageService {
    return storageService;
}
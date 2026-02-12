type StorageDriver = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
};

const localDriver: StorageDriver = {
  get: async (key) => localStorage.getItem(key),
  set: async (key, value) => {
    localStorage.setItem(key, value);
  },
  remove: async (key) => {
    localStorage.removeItem(key);
  }
};

const getCapacitorPreferences = () => {
  const anyWindow = window as unknown as {
    Capacitor?: { Plugins?: { Preferences?: StorageDriver } };
  };
  return anyWindow.Capacitor?.Plugins?.Preferences ?? null;
};

const getDriver = (): StorageDriver => {
  const preferences = getCapacitorPreferences();
  return preferences ?? localDriver;
};

export async function storageGet(key: string) {
  const driver = getDriver();
  try {
    return await driver.get(key);
  } catch {
    return localDriver.get(key);
  }
}

export async function storageSet(key: string, value: string) {
  const driver = getDriver();
  try {
    await driver.set(key, value);
  } catch {
    await localDriver.set(key, value);
  }
}

export async function storageRemove(key: string) {
  const driver = getDriver();
  try {
    await driver.remove(key);
  } catch {
    await localDriver.remove(key);
  }
}

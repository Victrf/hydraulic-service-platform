import { create } from "zustand";

type RequestTab = "active" | "completed" | "history";

interface UnseenUpdate {
  requestId: string;
  tab: RequestTab;
}

interface NotificationStore {
  unseen: UnseenUpdate[];

  addUpdate: (requestId: string, tab: RequestTab) => void;

  clearTab: (tab: RequestTab) => void;

  activeCount: () => number;
  completedCount: () => number;
  historyCount: () => number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  unseen: [],

  addUpdate: (requestId, tab) => {
    const exists = get().unseen.some(
      (item) => item.requestId === requestId && item.tab === tab,
    );

    if (exists) return;

    set({
      unseen: [...get().unseen, { requestId, tab }],
    });
  },

  clearTab: (tab) => {
    set({
      unseen: get().unseen.filter((item) => item.tab !== tab),
    });
  },

  activeCount: () =>
    get().unseen.filter((item) => item.tab === "active").length,

  completedCount: () =>
    get().unseen.filter((item) => item.tab === "completed").length,

  historyCount: () =>
    get().unseen.filter((item) => item.tab === "history").length,
}));

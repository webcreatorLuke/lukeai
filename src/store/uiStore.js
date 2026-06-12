// src/store/uiStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LS_KEYS } from '@config/constants';

export const useUiStore = create(
  persist(
    (set) => ({
      sidebarOpen:  true,
      fontSize:     'md',
      sendOnEnter:  true,
      showSettings: false,
      showProfile:  false,
      modal:        null,   // 'deleteAccount' | 'addPasskey' | 'apiKey' | null

      toggleSidebar:  ()    => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (v)   => set({ sidebarOpen: v }),
      setFontSize:    (v)   => set({ fontSize: v }),
      setSendOnEnter: (v)   => set({ sendOnEnter: v }),
      openModal:      (id)  => set({ modal: id }),
      closeModal:     ()    => set({ modal: null }),
    }),
    {
      name:    'lukeai-ui',
      partialize: (s) => ({
        sidebarOpen: s.sidebarOpen,
        fontSize:    s.fontSize,
        sendOnEnter: s.sendOnEnter,
      }),
    }
  )
);

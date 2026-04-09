import { create } from "zustand";

const getNowTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const useChatStore = create((set) => ({
  currentRoom: {
    id: "room-project",
    name: "프로젝트 단톡방",
  },

  participants: [
    { id: "user-me", name: "나" },
    { id: "user-101", name: "민수" },
    { id: "user-102", name: "지훈" },
    { id: "user-103", name: "유나" },
  ],

  chatMessages: [],

  enterRoom: (displayName) =>
    set((state) => ({
      participants: state.participants.map((participant) =>
        participant.id === "user-me"
          ? { ...participant, name: displayName }
          : participant
      ),
      chatMessages: [
        {
          id: Date.now(),
          roomId: state.currentRoom.id,
          type: "system",
          text: `${displayName}님이 입장했습니다.`,
          createdAt: getNowTime(),
        },
      ],
    })),

  clearRoom: () =>
    set({
      participants: [
        { id: "user-me", name: "나" },
        { id: "user-101", name: "민수" },
        { id: "user-102", name: "지훈" },
        { id: "user-103", name: "유나" },
      ],
      chatMessages: [],
    }),

  sendMessage: (text, currentUser) =>
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        {
          id: Date.now() + Math.random(),
          roomId: state.currentRoom.id,
          type: "message",
          senderId: currentUser.id,
          senderName: currentUser.name,
          text,
          createdAt: getNowTime(),
        },
      ],
    })),
}));

export default useChatStore;
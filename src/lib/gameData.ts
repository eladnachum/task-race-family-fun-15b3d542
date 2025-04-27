
export interface Avatar {
  id: string;
  name: string;
  image: string;
  backgroundColor: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatar: Avatar;
  tasks: Task[];
  isWinner: boolean;
}

export const avatars: Avatar[] = [
  {
    id: "1",
    name: "Fox",
    image: "🦊",
    backgroundColor: "#FDE1D3"
  },
  {
    id: "2",
    name: "Panda",
    image: "🐼",
    backgroundColor: "#D3E4FD"
  },
  {
    id: "3",
    name: "Lion",
    image: "🦁",
    backgroundColor: "#FEF7CD"
  },
  {
    id: "4",
    name: "Rabbit",
    image: "🐰",
    backgroundColor: "#FFDEE2"
  },
  {
    id: "5",
    name: "Bear",
    image: "🐻",
    backgroundColor: "#F2FCE2"
  },
  {
    id: "6",
    name: "Monkey",
    image: "🐵",
    backgroundColor: "#D6BCFA"
  }
];

export const defaultTasks: Task[] = [
  { id: "task1", title: "Brush teeth", completed: false },
  { id: "task2", title: "Make bed", completed: false },
  { id: "task3", title: "Get dressed", completed: false },
  { id: "task4", title: "Eat breakfast", completed: false },
  { id: "task5", title: "Pack backpack", completed: false }
];

// Helper functions
export const calculateProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.completed).length;
  return Math.round((completedTasks / tasks.length) * 100);
};

export const checkWinner = (players: Player[]): Player | null => {
  return players.find(player => 
    player.tasks.length > 0 && 
    player.tasks.every(task => task.completed)
  ) || null;
};

export const createPlayer = (name: string, avatar: Avatar): Player => {
  return {
    id: crypto.randomUUID(),
    name,
    avatar,
    tasks: JSON.parse(JSON.stringify(defaultTasks)), // Deep clone default tasks
    isWinner: false
  };
};

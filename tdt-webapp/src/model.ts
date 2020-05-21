export interface PlayerInfo {
  name: string;
  avatar: string;
  isCreator: boolean;
}

export interface StoryElement {
  type: "text" | "image";
  content: string;
  player: PlayerInfo;
}

export interface StoryContent {
  elements: StoryElement[];
}

export interface Brush {
  pixelSize: number;
  displaySize: number;
}

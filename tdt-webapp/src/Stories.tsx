import React from "react";
import styled from "styled-components";
import { StoryContent, StoryElement } from "./model";
import Player from "./Player";
import Scrollable from "./Scrollable";
import NewlineToBreak from "./NewLineToBreak";

const Stories = ({ stories }: { stories: StoryContent[] }) => {
  const [selectedStory, setSelectedStory] = React.useState(0);

  const scrollableRef = React.useRef<HTMLDivElement>(null);

  const setSelectedStoryAndScrollToTop = (storyIndex: number) => {
    setSelectedStory(storyIndex);
    if (scrollableRef.current !== null) {
      scrollableRef.current.scrollTo(0, 0);
    }
  };

  const navButtons = (
    <StoryNavButtons
      selectedIndex={selectedStory}
      items={stories}
      handleNav={setSelectedStoryAndScrollToTop}
    />
  );

  return (
    <Scrollable ref={scrollableRef}>
      {navButtons}
      <h1>
        Story {selectedStory + 1} of {stories.length}
      </h1>
      <Story story={stories[selectedStory]} />
      {navButtons}
    </Scrollable>
  );
};

export default Stories;

const Story = ({ story }: { story: StoryContent }) => {
  return (
    <StyledStory>
      {story.elements.map((e, index) => (
        <StoryElementComponent key={index} element={e} />
      ))}
    </StyledStory>
  );
};

const StyledStory = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StoryElementComponent = ({ element }: { element: StoryElement }) => {
  if (element.type === "text") {
    return (
      <TextStoryElement>
        <Player face={element.player.face}>{element.player.name} typed:</Player>
        <div className="field">{NewlineToBreak(element.content)}</div>
      </TextStoryElement>
    );
  } else {
    return (
      <ImageStoryElement>
        <Player face={element.player.face}>
          {element.player.name} painted:
        </Player>
        <img src={element.content} alt="Drawing" />
      </ImageStoryElement>
    );
  }
};

const TextStoryElement = styled.div`
  margin: 3vmin 0;
  width: 80vw;

  .field {
    margin-top: 1vmin;
  }
`;

const ImageStoryElement = styled.div`
  margin: 3vmin 0;
  width: 80vw;

  img {
    margin-top: 1vmin;
    max-height: 100vh;
    max-width: 80vw;
    border: 0.7vmin solid black;
    border-radius: 2vmin;
    box-shadow: 0.5vmin 0.7vmin 1vmin rgba(0, 0, 0, 0.2);
  }
`;

const NavButtons = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  .button {
    margin: 2vmin;
  }
`;

const StoryNavButtons = ({
  selectedIndex,
  items,
  handleNav,
}: {
  selectedIndex: number;
  items: object[];
  handleNav: (index: number) => void;
}) => {
  return (
    <NavButtons>
      <button
        className="button"
        onClick={() => handleNav(selectedIndex - 1)}
        disabled={selectedIndex === 0}
      >
        ⇦
      </button>
      {items.map((_item, index) => (
        <button
          key={index}
          className="button"
          onClick={() => handleNav(index)}
          disabled={selectedIndex === index}
        >
          {index + 1}
        </button>
      ))}
      <button
        className="button"
        onClick={() => handleNav(selectedIndex + 1)}
        disabled={selectedIndex === items.length - 1}
      >
        ⇨
      </button>
    </NavButtons>
  );
};

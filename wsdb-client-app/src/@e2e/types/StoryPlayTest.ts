import { StoryPlayTestHandler } from '@e2e/types/StoryPlayTestHandler';

export interface StoryPlayTest {
    playTest?: StoryPlayTestHandler;
    overrideDefaultPlayTest?: boolean;
}

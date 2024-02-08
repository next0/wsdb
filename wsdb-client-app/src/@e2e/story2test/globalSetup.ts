import { StoryIndexManager } from '@e2e/story2test/StoryIndexManager';

async function globalSetup() {
    const indexManager = new StoryIndexManager();

    await indexManager.buildIndex();
}

export default globalSetup;

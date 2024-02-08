import { expect, test } from '@playwright/test';

import { STORYBOOK_URL } from '@e2e/story2test/consts';
import { StoryIndexManager } from '@e2e/story2test/StoryIndexManager';
import { StoryTestFnManager } from '@e2e/story2test/StoryTestFnManager';
import { StoryPlayTestHandler } from '@e2e/types/StoryPlayTestHandler';

const storyIndexManager = new StoryIndexManager();
const storyTestFnManager = new StoryTestFnManager();

const storiesIndex = storyIndexManager.getStoryIndexSync();

for (const story of Object.values(storiesIndex.entries)) {
    test.describe(story.title, () => {
        test(story.name, async ({ page, context, request }, testInfo) => {
            // HACK to fix snapshotPathTemplate
            const _test = (testInfo as unknown as { _test: { _requireFile: string } })._test;
            _test._requireFile = story.importPath;

            const storyTestFn = await storyTestFnManager.getStoryData(story.importPath);
            const caseTestFn = storyTestFn.get(story.name);

            await page.goto(STORYBOOK_URL + '/iframe.html?viewMode=story&id=' + encodeURIComponent(story.id));

            const root = page.locator('#storybook-root');

            let playTest: StoryPlayTestHandler | undefined = undefined;

            if (caseTestFn) {
                playTest = caseTestFn.playTest;
            }

            if (!caseTestFn?.overrideDefaultPlayTest) {
                await expect(root).toHaveScreenshot();
            }

            if (playTest) {
                await playTest({ root, page, context, request, expect }, testInfo);
            }
        });
    });
}

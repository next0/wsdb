import type { Expect, Locator, PlaywrightTestArgs, TestInfo } from 'playwright/types/test';

export type StoryPlayTestHandler = (
    // args: PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions,
    args: PlaywrightTestArgs & { root: Locator; expect: Expect },
    testInfo: TestInfo,
) => Promise<void> | void;

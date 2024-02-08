import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { StoryIndex } from '@storybook/types';

import { STORYBOOK_URL } from '@e2e/story2test/consts';

const STORYBOOK_INDEX_CACHE_PATH = resolve(import.meta.dirname + '/../../../node_modules/.cache/story2test/index.json');

export class StoryIndexManager {
    public async buildIndex(): Promise<void> {
        const res = await fetch(STORYBOOK_URL + '/index.json');

        if (!res.ok) {
            throw new Error('Storybook not ready');
        }

        const storybookIndex: StoryIndex = await res.json();

        await mkdir(dirname(STORYBOOK_INDEX_CACHE_PATH), { recursive: true });
        await writeFile(STORYBOOK_INDEX_CACHE_PATH, JSON.stringify(storybookIndex), 'utf-8');
    }

    public getStoryIndexSync(): StoryIndex {
        return JSON.parse(readFileSync(STORYBOOK_INDEX_CACHE_PATH, 'utf-8'));
    }
}

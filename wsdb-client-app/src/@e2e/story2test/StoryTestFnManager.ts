import { Meta, StoryObj } from '@storybook/react';
import { createServer, ViteDevServer } from 'vite';
import { ViteNodeRunner } from 'vite-node/client';
import { ViteNodeServer } from 'vite-node/server';
import { installSourcemapsSupport } from 'vite-node/source-map';

import { StoryPlayTest } from '@e2e/types/StoryPlayTest';

type StorybookStoryObj<T> = StoryObj<T> & StoryPlayTest;
export type StorybookFile = Record<string, StorybookStoryObj<unknown>> & { default: Meta<unknown> };

function startCase(str: string): string {
    return str;
}

export class StoryTestFnManager {
    protected server: ViteDevServer | undefined;
    protected tools: Promise<{ server: ViteDevServer; runner: ViteNodeRunner }>;
    protected cache: Map<string, Map<string, StoryPlayTest>> = new Map();

    constructor() {
        this.tools = this.initViteTools();
    }

    public async destroy(): Promise<void> {
        return this.tools.then(({ server }) => server.close());
    }

    protected async initViteTools(): Promise<{ server: ViteDevServer; runner: ViteNodeRunner }> {
        const server = await createServer({
            resolve: {
                alias: [
                    {
                        // replace all non-test imports with stab to optimize compile time
                        find: /(?<!(react(\/.+)?|@e2e\/.+|(\.(story|helper)\.tsx?)))$/,
                        replacement: '',
                        customResolver() {
                            return './src/@e2e/story2test/mock.ts';
                        },
                    },
                ],
            },
            logLevel: 'error',
            optimizeDeps: {
                disabled: true,
            },
        });

        // initialize the plugins
        await server.pluginContainer.buildStart({});

        // create vite-node server
        const node = new ViteNodeServer(server);

        // fixes stack traces in Errors
        installSourcemapsSupport({
            getSourceMap: (source) => node.getSourceMap(source),
        });

        // create vite-node runner
        const runner = new ViteNodeRunner({
            root: server.config.root,
            base: server.config.base,
            fetchModule(id) {
                return node.fetchModule(id);
            },
            resolveId(id, importer) {
                return node.resolveId(id, importer);
            },
        });

        return {
            server,
            runner,
        };
    }

    protected parseStoryFile(file: string): Promise<StorybookFile> {
        return this.tools.then(({ runner }) => runner.executeFile(file));
    }

    public async getStoryData(file: string): Promise<Map<string, StoryPlayTest>> {
        if (this.cache.has(file)) {
            return this.cache.get(file);
        }

        const filePayload: StorybookFile = await this.parseStoryFile(file);

        const storyTestFnIndex = new Map<string, StoryPlayTest>();

        for (const key of Object.keys(filePayload)) {
            const story: StorybookStoryObj<unknown> = filePayload[key];

            if (story.playTest || story.overrideDefaultPlayTest) {
                const storyName = story.name ?? story.storyName ?? startCase(key);

                storyTestFnIndex.set(storyName, {
                    playTest: story.playTest,
                    overrideDefaultPlayTest: story.overrideDefaultPlayTest,
                });
            }
        }

        this.cache.set(file, storyTestFnIndex);

        return storyTestFnIndex;
    }
}

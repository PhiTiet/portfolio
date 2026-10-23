import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../../main/resources/static/theme-init.js', import.meta.url), 'utf8');

test('saved themes take priority over the system, with dark as the unknown-preference fallback', () => {
    for (const [saved, system, expected] of [
        ['light', 'dark', 'light'],
        ['dark', 'light', 'dark'],
        [null, 'light', 'light'],
        [null, 'dark', 'dark'],
        [null, null, 'dark'],
        ['unknown', 'light', 'light'],
        ['unknown', null, 'dark']
    ]) {
        const classes = new Set();
        runInNewContext(script, {
            localStorage: { getItem: () => saved },
            window: { matchMedia: () => ({ matches: system === 'light' }) },
            document: { documentElement: { classList: { add: name => classes.add(name) } } }
        });
        assert.equal(classes.has('light'), expected === 'light', `saved=${saved}, system=${system}`);
    }
});

---
hide_title: true
title: Frequently asked questions
---

# Frequently Asked Questions

Some of the answers outlined here may be helpful to you if you're stuck somewhere. They're questions that are asked quite frequently on GitHub and in our [discord](https://remirror.io/chat) channel.

### Is there any way to get the value of the editor already parsed to HTML

There's are methods available in `remirror/core`. `prosemirrorNodeToHtml` which converts the provided node to a HTML string, and `htmlToProsemirrorNode` which takes the html string you've provided and converts it into a value that can be used within `remirror`. Please note this does not sanitize the HTML, if you would like to sanitize your html then consider using a library like [xss](https://github.com/leizongmin/js-xss).

To get the html string from the editor the following should work well for you.

```tsx
import { prosemirrorNodeToHtml } from 'remirror';

const htmlString = prosemirrorNodeToHtml({ node: state.doc, schema: state.schema });
```

To convert a html string to a valid node, the following should work.

```tsx
import { htmlToProsemirrorNode } from 'remirror';

const doc = htmlToProsemirrorNode({ html, schema: state.schema });
```

### Not able to run either beta nor next, tried some other too

For beta the best way to get an idea of how to use it is to follow the sparse instructions in the PR https://github.com/remirror/remirror/pull/706#issue-492554914

For next it should really work fine. Just make sure to pin your dependencies https://github.com/remirror/remirror/issues/855#issuecomment-776096038


### Why do I need an override parameter if I can already override the spec by using ES class extends syntax?

It's mainly if you just want to get started quickly and don't want to create your own extension. The user can set the nodeOverrides value when creating the extension as an option, similar to how the extraAttributes can also be set or the priority can be set. new TableCellExtension({ nodeOverrides: {content: 'inline*'}).


### Is using extends to override the behavior of an Extension (both for createNodeSpec and for other methods) a best practice for using remirror?

I don't know what the best practice is yet. I want to decide based on feedback from the users. One problem I've noticed with using extends in a TypeScript project is that the  name property can't be changed without breaking the types.


### Why does override only allow a subset of properties? For example, NodeSpecOverride doesn't include toDOM and fromDOM.

I can definitely make all the properties overridable. The API was based on a suggestion from @whawker. At the time I was implementing I wanted to make it lightweight and then gauge user feedback. It's easier to add more to the API once people have started using it, and your input is super helpful.


### Is react 17 supported?

It should be supported.
https://github.com/remirror/remirror/blob/next/packages/%40remirror/react/package.json#L56-L62


### Is it possible to somehow retrieve the header level?

```tsx
<button style={active.heading() ? { fontWeight: 'bold' } : {}}>
   H{active.headingLevel()} // doesn't really exist
</button>
```
Try `active.heading({ level: 3 })` Will only return true when the heading level is 3.
I'll need to refactor that to a dropdown, anyway... so that setting it correlates as expected.

```tsx
<Button
        css={[active.heading() ? tw`font-bold` : undefined]}
        kind="light"
        position="first"
        type="button"
        onClick={() => commands.toggleHeading({ level: 3 })}
      >
        {active.heading({ level: 1 })
          ? "H1"
          : active.heading({ level: 2 })
          ? "H2"
          : active.heading({ level: 3 })
          ? "H3"
          : active.heading({ level: 4 })
          ? "H4"
          : "H"}
      </Button>
```

### Does anyone have a working example of embedding a youtube link => iframe? it seems like this is baked into preset-embed, but haven't gotten it to work yet.


Indeed, you need EmbedPreset and then something like:
`commands.addYouTubeVideo({ video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });`

The best place to find examples are the unit tests, e.g.: 

https://github.com/remirror/remirror/blob/2ae34915bcab4b875c4a10c373343c2a9b9ac4e4/packages/%40remirror/preset-embed/src/__tests__/iframe-extension.spec.ts#L71

/*
-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
 * © : 𝘾𝙧𝙚𝙖𝙩𝙤𝙧 : @rnzdzy_
 * © : 𝙒𝙝𝙖𝙩𝙨𝙖𝙥𝙥 : wa.me/6289531204240
 * © : 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 : https://whatsapp.com/channel/0029Vb91zWW2UPBL81ZqwJ39
-_-_-_-_-_-( Jangan hapus Credit )_-_-_-_-_-_-_-
*/

import crypto from 'node:crypto';
import fs from 'node:fs';
import { generateWAMessageFromContent, prepareWAMessageMedia } from '../index.js';
import {
    a2uiText,
    a2uiImage,
    a2uiColumn,
    a2uiRow,
    a2uiCard,
    a2uiSurface,
    a2uiWidget,
    sendA2UI,
    sendBloksWidget
} from './extras.js';

export class A2UI {
    constructor({
        catalogId = "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",
        version = "v0.9"
    } = {}) {
        this._version = version;
        this._catalogId = catalogId;
        this._components = new Map();
        this._counter = 0;
        this._rootChildren = [];
        this._headerImageUrl = null;
    }

    #nextId(prefix) {
        return `${prefix}_${(this._counter++).toString(36)}`;
    }

    #reg(id, component, extra = {}) {
        id ??= this.#nextId(component.toLowerCase());
        if (this._components.has(id)) throw new Error(`Component id "${id}" already used`);
        this._components.set(id, {
            id,
            component,
            ...extra
        });
        return id;
    }

    setImage(urlOrBuffer) {
        this._headerImageUrl = urlOrBuffer;
        return this;
    }

    text(text, {
        id,
        variant = "body"
    } = {}) {
        return this.#reg(id, "Text", {
            text,
            variant
        });
    }

    image(url, {
        id,
        variant = "header",
        fit = "cover"
    } = {}) {
        this._headerImageUrl = url;
        return this.#reg(id, "Image", {
            url,
            ...(variant ? {
                variant
            } : {}),
            fit
        });
    }

    video(url, {
        id
    } = {}) {
        return this.#reg(id, "Video", {
            url
        });
    }

    checkbox(label, {
        id,
        value = false
    } = {}) {
        return this.#reg(id, "CheckBox", {
            label,
            value
        });
    }

    textField(label, {
        id,
        variant = "text"
    } = {}) {
        return this.#reg(id, "TextField", {
            label,
            variant
        });
    }

    button(childId, {
        id,
        variant = "primary",
        action
    } = {}) {
        if (!childId) throw new TypeError("button(childId) requires the id of a child component (e.g. from .text())");
        return this.#reg(id, "Button", {
            child: childId,
            variant,
            ...(action ? {
                action
            } : {})
        });
    }

    card(childId, {
        id
    } = {}) {
        return this.#reg(id, "Card", {
            child: childId
        });
    }

    column(children = [], {
        id,
        justify,
        align
    } = {}) {
        if (!children.length) throw new TypeError("column(children) requires at least one child id");
        return this.#reg(id, "Column", {
            children,
            ...(justify ? {
                justify
            } : {}),
            ...(align ? {
                align
            } : {})
        });
    }

    row(children = [], {
        id
    } = {}) {
        if (!children.length) throw new TypeError("row(children) requires at least one child id");
        return this.#reg(id, "Row", {
            children
        });
    }

    divider({
        id
    } = {}) {
        return this.#reg(id, "Divider", {});
    }

    choicePicker(label, options, {
        id,
        variant = "mutuallyExclusive",
        value,
        displayStyle = "checkbox",
        filterable = false
    } = {}) {
        if (!Array.isArray(options) || !options.length) {
            throw new TypeError("choicePicker(label, options) requires a non-empty options array of {label, value}");
        }
        return this.#reg(id, "ChoicePicker", {
            label,
            variant,
            ...(value !== undefined ? {
                value
            } : {}),
            options,
            displayStyle,
            filterable,
        });
    }

    root(children) {
        if (!Array.isArray(children) || !children.length) {
            throw new TypeError("root(children) requires a non-empty array of top-level component ids");
        }
        this._rootChildren = children;
        return this;
    }

    listCard({
        title,
        items,
        fallbackText,
        uuid = crypto.randomUUID()
    } = {}) {
        if (!title) throw new TypeError("listCard requires a title");
        if (!Array.isArray(items) || !items.length) {
            throw new TypeError("listCard requires a non-empty items array");
        }
        this._listCardPayload = {
            uuid,
            data: JSON.stringify({
                type: "list_card",
                title,
                fallback_text: fallbackText ?? "",
                items: items.map((it) => {
                    if (typeof it === "string") return { title: it, action: "" };
                    if (!it?.title) throw new TypeError("listCard item must have at least {title}");
                    return {
                        title: it.title,
                        subtitle: it.subtitle ?? "",
                        action: it.action ?? "",
                    };
                }),
            }),
            type: "im_a2ui"
        };
        return this;
    }

    build({
        type = "im_a2ui",
        wrapped = true
    } = {}) {
        if (this._listCardPayload) return this._listCardPayload;
        if (!this._rootChildren.length) {
            throw new Error("No root children set. Call .root([id1, id2...]) before build().");
        }
        const rootComp = {
            id: "root",
            component: "Column",
            children: this._rootChildren
        };
        const components = [rootComp, ...this._components.values()];
        const uuid = crypto.randomUUID();
        const data = {
            version: this._version,
            createSurface: {
                surfaceId: `starcore-widget=${uuid}`,
                catalogId: this._catalogId,
                components
            }
        };
        return {
            uuid,
            data: JSON.stringify(data),
            type
        };
    }

    async send(client, jid, options = {}) {
        return sendA2UIWidget(client, jid, { a2ui: this, ...options });
    }
}

// Attach functional helpers as static properties for convenience
Object.defineProperties(A2UI, {
    text: { get: () => a2uiText, configurable: true, enumerable: true },
    image: { get: () => a2uiImage, configurable: true, enumerable: true },
    column: { get: () => a2uiColumn, configurable: true, enumerable: true },
    row: { get: () => a2uiRow, configurable: true, enumerable: true },
    card: { get: () => a2uiCard, configurable: true, enumerable: true },
    surface: { get: () => a2uiSurface, configurable: true, enumerable: true },
    widget: { get: () => a2uiWidget, configurable: true, enumerable: true },
    send: { get: () => sendA2UI, configurable: true, enumerable: true }
});

export async function sendA2UIWidget(client, jid, {
    a2ui,
    bodyText = "",
    footer = "",
    buttons = [],
    contextInfo = {},
    expiration,
    quoted,
    type = "im_a2ui",
    wrapped = true,
    singleScreen = false,
    bottom_sheet = {},
    limited_time_offer = {},
    headerImage,
    image,
    thumbnail,
    photo,
    headerTitle,
    headerSubtitle,
    additionalNodes = [],
    ...options
} = {}) {
    if (!client) throw new Error("Socket is required");
    if (!(a2ui instanceof A2UI)) throw new TypeError("a2ui must be an A2UI instance");

    // 1. Resolve and prepare header image
    let imageSource = headerImage || image || thumbnail || photo;
    if (!imageSource && a2ui) {
        if (a2ui._headerImageUrl) {
            imageSource = a2ui._headerImageUrl;
        } else if (a2ui._components) {
            for (const comp of a2ui._components.values()) {
                if (comp.component === "Image" && comp.url) {
                    imageSource = comp.url;
                    break;
                }
            }
        }
    }

    let preparedImageMessage = null;
    if (imageSource) {
        if (typeof imageSource === "object" && imageSource.imageMessage) {
            preparedImageMessage = imageSource.imageMessage;
        } else if (typeof imageSource === "object" && imageSource.directPath && imageSource.mediaKey) {
            preparedImageMessage = imageSource;
        } else {
            try {
                let imgBuffer = null;
                if (Buffer.isBuffer(imageSource)) {
                    imgBuffer = imageSource;
                } else if (typeof imageSource === "string") {
                    if (imageSource.startsWith("http://") || imageSource.startsWith("https://")) {
                        try {
                            const res = await fetch(imageSource);
                            if (res.ok) {
                                imgBuffer = Buffer.from(await res.arrayBuffer());
                            }
                        } catch (_) {}
                    } else if (imageSource.startsWith("data:image")) {
                        const base64Data = imageSource.split(",")[1] || imageSource;
                        imgBuffer = Buffer.from(base64Data, "base64");
                    } else if (fs.existsSync(imageSource)) {
                        imgBuffer = fs.readFileSync(imageSource);
                    }
                } else if (imageSource.image && Buffer.isBuffer(imageSource.image)) {
                    imgBuffer = imageSource.image;
                } else if (imageSource.url) {
                    try {
                        const res = await fetch(imageSource.url);
                        if (res.ok) {
                            imgBuffer = Buffer.from(await res.arrayBuffer());
                        }
                    } catch (_) {}
                }

                if (imgBuffer && imgBuffer.length) {
                    const media = await prepareWAMessageMedia(
                        { image: imgBuffer },
                        { upload: client.waUploadToServer }
                    );
                    preparedImageMessage = media?.imageMessage || null;
                } else if (typeof imageSource === "string" && (imageSource.startsWith("http://") || imageSource.startsWith("https://"))) {
                    const media = await prepareWAMessageMedia(
                        { image: { url: imageSource } },
                        { upload: client.waUploadToServer }
                    );
                    preparedImageMessage = media?.imageMessage || null;
                }
            } catch (err) {
                console.warn("[sendA2UIWidget prepareImage error]", err?.message || err);
            }
        }
    }

    const header = preparedImageMessage ?
        {
            hasMediaAttachment: true,
            imageMessage: preparedImageMessage,
            ...(headerTitle ? { title: headerTitle } : {}),
            ...(headerSubtitle ? { subtitle: headerSubtitle } : {})
        } :
        (headerTitle ?
            {
                hasMediaAttachment: false,
                title: headerTitle,
                ...(headerSubtitle ? { subtitle: headerSubtitle } : {})
            } :
            (footer !== undefined ? {
                hasMediaAttachment: false
            } : undefined)
        );

    const params = {};
    const validButtons = (buttons || []).filter(b => b && Object.keys(b).length > 0 && b.name !== '');
    const nativeFlowMessage = validButtons.length ?
        {
            buttons: validButtons.map((b) => {
                return {
                    name: b.name ?? "cta_url",
                    buttonParamsJson: typeof b.params === "string" 
                        ? b.params 
                        : typeof b.buttonParamsJson === "string" 
                            ? b.buttonParamsJson 
                            : JSON.stringify(b.params ?? b.buttonParamsJson ?? {}),
                };
            }),
            messageParamsJson: "{}",
            messageVersion: 1
        } :
        {
            messageParamsJson: ""
        };

    if (typeof bottom_sheet === "object" && bottom_sheet?.name) {
        params.bottom_sheet = {
            in_thread_buttons_limit: 1,
            divider_indices: [1, 2],
            list_title: bottom_sheet.name,
            button_title: bottom_sheet.name
        };
    }
    if (typeof limited_time_offer === "object" && limited_time_offer?.time) {
        params.limited_time_offer = {
            text: limited_time_offer.text || "",
            url: '',
            copy_code: '',
            expiration_time: Date.now() + limited_time_offer.time
        };
    }
    nativeFlowMessage.messageParamsJson = JSON.stringify(params);

    const interactiveMessage = singleScreen ?
        {
            ...(header ? { header } : {}),
            nativeFlowMessage,
            bloksWidget: a2ui.build({
                type,
                wrapped
            }),
            ...(expiration || Object.keys(contextInfo).length ? {
                contextInfo: {
                    ...(expiration ? {
                        expiration
                    } : {}),
                    ...contextInfo
                }
            } : {})
        } :
        {
            ...(header ? { header } : {}),
            ...(bodyText !== undefined && bodyText !== "" ? {
                body: {
                    text: bodyText
                }
            } : {}),
            ...(footer !== undefined && footer !== "" ? {
                footer: {
                    text: footer
                }
            } : {}),
            nativeFlowMessage,
            bloksWidget: a2ui.build({
                type,
                wrapped
            }),
            ...(expiration || Object.keys(contextInfo).length ? {
                contextInfo: {
                    ...(expiration ? {
                        expiration
                    } : {}),
                    ...contextInfo
                }
            } : {})
        };

    const msg = generateWAMessageFromContent(jid, {
        messageContextInfo: {
            messageSecret: crypto.randomBytes(32)
        },
        interactiveMessage
    }, {
        quoted
    });

    const finalAdditionalNodes = additionalNodes && additionalNodes.length > 0
        ? additionalNodes
        : [{
            tag: "biz",
            attrs: {},
            content: [{
                tag: "interactive",
                attrs: {
                    type: "native_flow",
                    v: "1"
                },
                content: [{
                    tag: "native_flow",
                    attrs: {
                        v: "9",
                        name: "mixed"
                    }
                }]
            }]
        }];

    await client.relayMessage(msg.key.remoteJid, msg.message, {
        messageId: msg.key.id,
        additionalNodes: finalAdditionalNodes,
        ...options
    });
    return msg;
}

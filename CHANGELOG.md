# Changelog

## [1.1.16]
- `message_builder.js` now includes the **baileys-mbuilder** additions. Everything is exported from the package root (`import { MessageBuilder, sendHtmlApp, ... } from 'baileys'`) and attached as statics on `AIRich`, `ORich`, `Button`, `ButtonV2`, `Carousel` and `Toolkit`. New modules in `lib/Modded/`:
  - `extras.js`: AI Rich section helpers, `sendHtmlApp`, `sendHtmlArtifact`, `sendA2UI`, `sendBloksWidget`, `buildDefaultBizNodes`.
  - `a2ui.js`: the `A2UI` widget builder and `sendA2UIWidget`.
  - `metaai.js`: Meta AI primitives and `forwardRichResponse` (forwards a received Meta AI answer).
  - `bot-signature.js`: `verifyBotSignature`, `isParsableCertificateChain` and related helpers.
  - `html-app.js`: `checkHtmlApp` (validates an HTML app before it is sent).
- New `AIRich` methods: `addMap`, `addWidget`, `addFooterSection`, `clearFooterSections`, `addEmbeddedScreen`, `setBotMetadata`, `setResponseMeta`, `isSignaturePreserved`. `addSection(section, { text, submessage })` can now pair the section with a submessage. New statics: `isMetaSignature`, `wrapRichResponse`, `normalizeSection`, `DEFAULT_BOT_JID`, `LAYOUT_FIELDS`.
- Deeplinks: `[text](>https://...)` in `addText` / `addTable` creates a `GenAIDeeplinkItem` entity (`deeplink: false` turns it off).
- `AIRich.loadFrom` keeps a genuine Meta signature and its signed bytes while the content is untouched; any edit drops it.
- New `build` / `send` options: `forwardWrapper: false` (send the `richResponseMessage` without `botForwardedMessage`), `botJid`, `disclaimerText` (default unchanged) and `verification`. `'auto'` / `'omit'` leave the proof out; `'placeholder'` sends it and logs a one-time warning; the default is unchanged (the placeholder proof is still sent). The built message has `aiVerification` (`'legacy'`, `'placeholder'`, `'omitted'` or `'preserved'`).
- `AIRich.send` now also sends `additionalNodes` (and `forwardWrapper`) with the bypass edit. The `RichListItem` / `MultipleResponse` layouts use their own view_model fields (`text_content` / `responses`).
- No new dependencies. Install from the GitHub tag tarball (`https://github.com/t3rri-1/Baileys/archive/refs/tags/v1.1.16.tar.gz`) with the `baileys`, `T3` and `@whiskeysockets/baileys` aliases. The package is not uploaded to npm.
- Existing `sendMessage` / `relayMessage` output is unchanged.

## [1.1.15]
- New `wrapToBotForwardedMessage(richResponseMessage)` in `message_builder.js`, with `botMetadataSignature()` and `botMetadataCertificate(length)`: wraps a `richResponseMessage` in `botForwardedMessage` and adds `botMetadata.verificationMetadata.proofs` (Meta AI reply format). Ported from Baileys 0.4.2. It is a standalone helper: `AIRich` and `sendMetaStep` messages are built as before.
- New sticker annotation in `message_builder.js`: `attachAssetStickerToMessage(sock, m, assetKey, meta)` sends a sticker attached to message `m` through `messageContextInfo.messageAssociation` (`STICKER_ANNOTATION` = `proto.MessageAssociation.AssociationType.STICKER_ANNOTATION`, 11). Also exported: `attachMenuSticker(sock, m, botConfig)` (asset `t32`, off with `MENU_STICKER_REPLY=false`) and `getAssetSticker(assetKey, meta)`.
  - The image is a Buffer, a file path or an asset key read from `./media/<key>.(jpg|jpeg|png|webp)` (`meta.dir` or `STICKER_ASSET_DIR` changes the folder).
  - The 512x512 webp sticker (with pack name / author) is built with `sharp`. Pack name / author come from `meta`, then `STICKER_PACK` (`"pack;author"`). The sticker is static.
  - The sticker is cached (rebuilt when the image or the pack info changes) and the upload is cached for 30 minutes per socket. It never throws: it returns `false` and logs `[StickerAnnotation]`.
- Install from the GitHub tag tarball (`https://github.com/t3rri-1/Baileys/archive/refs/tags/v1.1.15.tar.gz`) with the `baileys`, `T3` and `@whiskeysockets/baileys` aliases. The package is not uploaded to npm. README installation section updated.
- Existing `sendMessage` / `relayMessage` output is unchanged.

## [1.1.14]
- `sendMetaStep` fix: v1.1.13 showed a plain forwarded text without "View details". The message body is now a `richResponseMessage` wrapped in `botForwardedMessage` (Meta AI reply format), plus `botMetadata.progressIndicatorMetadata`.
- Step edits are sent with `relayMessage` as a `botForwardedMessage` > `protocolMessage` (`MESSAGE_EDIT`), the same way as richMessage edits.

## [1.1.13]
- `sendMetaStep` fix: v1.1.12 messages did not show up on the receiver. The message is no longer wrapped in `botForwardedMessage`; it is now an `extendedTextMessage` with the AI bot forwarded `contextInfo` (`forwardedAiBotMessageInfo`, `forwardOrigin: 4`) plus `botMetadata.progressIndicatorMetadata`.
- Step edits go through `sendMessage({ edit })`, so the stanza has the `edit="1"` attribute (missing in v1.1.12).
- `meta.done("text")`: `text` becomes `progressDescription`; the message text stays the last step title.

## [1.1.12]
- `sendMetaStep` fix: message is wrapped in `botForwardedMessage` (AI bot forwarded flag) and edits are sent as bot-forwarded edits, so the client shows the steps details instead of plain text and a duplicate message. Message text is the title of the last step.
- New `meta.done(text)`; `meta.finish` is now an alias. `step()` / `done()` / `update()` return `{ key, editId, message }`.

## [1.1.11]
- New `sock.sendMetaStep(jid, { title, body, disabled })` with `meta.step()`, `meta.finish()`, `meta.update()`: step/progress indicator message using `proto.BotProgressIndicatorMetadata`. Step status `PLANNED` / `EXECUTING` / `FINISHED`; options `reasoning`, `sections`, `sources`. Types `MetaStepInput` / `MetaStepHandle` added.

## [1.1.10]
- WAProto updated to **WhatsApp 2.3000.1054022738** (was 2.3000.1053411851): 9 new types, 16 new fields, 12 new enum values (e.g. `Message.VpcRequestMessage`, `Message.PaymentDetailsMessage`, `GroupRootKey`, `GroupRootKeyRequest`, `ClientPayload.IntegrationAttestation`, `StatusAttribution.StatusTemplate`, `Account.PnLearnState`). Nothing was removed; `index.js`, `index.d.ts` and `WAProto.proto` are regenerated from one schema.
- `ChatSolidColorWallpaper.backgroundLightArgb` / `backgroundDarkArgb` are not added: field numbers 1 and 2 are already used by `colorLight` / `colorDark`.
- Existing `sendMessage` / `relayMessage` output is unchanged.

## [1.1.9]
- New `sock.sendPrivateRelay(jid, message, options)`: relay to selected devices only (`mode` include/exclude, `target` number/PN/LID/`:device`, `deviceMode` all/primary/secondary, `targetMe`, `ai`, `statusJidList`). Works for 1:1, groups, status and newsletters.
- New `sendMessage` content: `richMessage` (AI rich response, `editrich` edits the message after sending), `rawMessage`, `photoPoll` (image poll), `buttonLocation` (buttons with a location header).
- New `ai` option on `relayMessage()`; `signalRepository.encryptGroupMessage()` accepts `resetSenderKey`.
- New export `makeInMemoryStore()`; added dependency `@adiwajshing/keyed-db`.
- WAProto: `proto.Message.MediaKeyDomain`, `mediaKeyDomain` on audio/document/image/sticker/video/`MMSThumbnailMetadata`, `proto.BotAvatarMetadata` and `BotMetadata.avatarMetadata` (`index.js` and `WAProto.proto`).
- WAProto updated to **WhatsApp 2.3000.1053411851** (was 2.3000.1038158069): 44 new types, 92 new fields, 95 new enum values (e.g. `Message.RequestLocationMessage`, `Message.RequestLocationUpdateMessage`, `Message.ChatAnimatedWallpaper`, `Message.MusicMessage.Lyrics`, `BotInterjectionMetadata`). Nothing was removed; `getTypeUrl()` is now on every type. `index.js`, `index.d.ts` and `WAProto.proto` are regenerated from one schema.
- Existing `sendMessage` / `relayMessage` output is unchanged.

## [1.1.8]
- `message_builder.js` → 4.8-alpha: `AIRich` rebuilt on a node system (`id` / `replace` / `insertAt`, typed errors, `loadFrom`, `buildEdit` / `sendEdit`); new `add*` helpers; `Button`, `ButtonV2`, `Carousel` get `loadFrom` and `messageId` support.
- WhatsApp Web version fetched live at import, with fallback.
- Fixed `getUrlInfo` redirect limit; `downloadHistory` now streams.
- Added `close()` / `destroy()` cleanup when a socket ends.
- `music-metadata` → `^11.12.3`; removed unused `javascript-obfuscator`.

## [1.1.7]
- Removed auto-follow newsletter on connect.

## [1.1.42]
- New `WAProto/index.js` (361 types); added `recipientFilter` hook.

## [1.1.4]
- README banner changed; `message_builder.js` back to 4.6.

## [1.1.0]
- `message_builder.js` → 4.7; `loadFrom(msg)` and `AIRich` ids/editing added.

## [1.1.1] – [1.1.41]
- Bug fixes (Button/Carousel build, QR pairing, auth-state atomic writes, LID mapping, cache limits), extra auth-state variants, restriction and TC-token handling, auto-compress media. Full detail is in git history.

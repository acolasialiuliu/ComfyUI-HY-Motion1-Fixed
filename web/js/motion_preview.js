/**
 * ComfyUI HY-Motion - Animation Preview Widget
 * Interactive viewer for motion data with GLB export
 */

import { app } from "../../../../scripts/app.js";
import { VIEWER_HTML } from "./viewer_inline.js";

console.log("[HY-Motion] Loading motion preview extension...");

app.registerExtension({
    name: "hymotion.motionpreview",

    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "HYMotionPreviewAnimation") {
            console.log("[HY-Motion] Registering Preview Animation node");

            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function() {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

                console.log("[HY-Motion] Node created, adding motion viewer widget");

                // Create iframe for motion viewer
                const iframe = document.createElement("iframe");
                iframe.style.width = "100%";
                iframe.style.flex = "1 1 0";
                iframe.style.minHeight = "0";
                iframe.style.border = "none";
                iframe.style.backgroundColor = "#1a1a2e";

                // Create blob URL from inline HTML
                const blob = new Blob([VIEWER_HTML], { type: 'text/html' });
                const blobUrl = URL.createObjectURL(blob);
                iframe.src = blobUrl;
                console.log('[HY-Motion] Setting iframe src to blob URL');

                iframe.addEventListener('load', () => {
                    iframe._blobUrl = blobUrl;
                });

                iframe.onload = () => {
                    console.log('[HY-Motion] Iframe loaded successfully');
                };
                iframe.onerror = (e) => {
                    console.error('[HY-Motion] Iframe failed to load:', e);
                };

                // Add widget
                const widget = this.addDOMWidget("preview", "MOTION_PREVIEW", iframe, {
                    getValue() { return ""; },
                    setValue(v) { }
                });

                console.log("[HY-Motion] Widget created:", widget);

                widget.computeSize = function(width) {
                    const w = width || 512;
                    const h = w * 1.2;
                    return [w, h];
                };

                widget.element = iframe;
                this.motionViewerIframe = iframe;
                this.motionViewerReady = false;

                // Listen for ready message
                const onMessage = (event) => {
                    if (event.data && event.data.type === 'VIEWER_READY') {
                        console.log('[HY-Motion] Viewer iframe is ready!');
                        this.motionViewerReady = true;
                    }
                };
                window.addEventListener('message', onMessage.bind(this));

                this.setSize([512, 614]);

                // Handle execution
                const onExecuted = this.onExecuted;
                this.onExecuted = function(message) {
                    console.log("[HY-Motion] onExecuted called with message:", message);
                    onExecuted?.apply(this, arguments);

                    // The message contains motion data
                    if (message?.motion_data && message.motion_data[0]) {
                        const motionDataStr = message.motion_data[0];
                        console.log(`[HY-Motion] Received motion data`);

                        try {
                            const motionData = JSON.parse(motionDataStr);

                            const sendMessage = () => {
                                if (iframe.contentWindow) {
                                    console.log(`[HY-Motion] Sending motion data to iframe`);
                                    iframe.contentWindow.postMessage({
                                        type: "LOAD_MOTION",
                                        motionData: motionData,
                                        timestamp: Date.now()
                                    }, "*");
                                } else {
                                    console.error("[HY-Motion] Iframe contentWindow not available");
                                }
                            };

                            if (this.motionViewerReady) {
                                sendMessage();
                            } else {
                                const checkReady = setInterval(() => {
                                    if (this.motionViewerReady) {
                                        clearInterval(checkReady);
                                        sendMessage();
                                    }
                                }, 50);

                                setTimeout(() => {
                                    clearInterval(checkReady);
                                    if (!this.motionViewerReady) {
                                        console.warn("[HY-Motion] Iframe not ready after 2s, sending anyway");
                                        sendMessage();
                                    }
                                }, 2000);
                            }
                        } catch (e) {
                            console.error("[HY-Motion] Failed to parse motion data:", e);
                        }
                    } else {
                        console.log("[HY-Motion] No motion_data in message. Keys:", Object.keys(message || {}));
                    }
                };

                return r;
            };
        }
    }
});

console.log("[HY-Motion] Motion preview extension registered");

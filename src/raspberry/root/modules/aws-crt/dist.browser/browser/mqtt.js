"use strict";
/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttClientConnection = exports.MqttClient = void 0;
var mqtt = __importStar(require("mqtt"));
var WebsocketUtils = __importStar(require("./ws"));
var trie_1 = require("./trie");
var event_1 = require("../common/event");
var browser_1 = require("../browser");
var mqtt_1 = require("../common/mqtt");
Object.defineProperty(exports, "QoS", { enumerable: true, get: function () { return mqtt_1.QoS; } });
Object.defineProperty(exports, "MqttWill", { enumerable: true, get: function () { return mqtt_1.MqttWill; } });
/**
 * MQTT client
 *
 * @module aws-crt
 * @category MQTT
 */
var MqttClient = /** @class */ (function () {
    function MqttClient(bootstrap) {
    }
    /**
     * Creates a new {@link MqttClientConnection}
     * @param config Configuration for the connection
     * @returns A new connection
     */
    MqttClient.prototype.new_connection = function (config) {
        return new MqttClientConnection(this, config);
    };
    return MqttClient;
}());
exports.MqttClient = MqttClient;
/** @internal */
var TopicTrie = /** @class */ (function (_super) {
    __extends(TopicTrie, _super);
    function TopicTrie() {
        return _super.call(this, '/') || this;
    }
    TopicTrie.prototype.find_node = function (key, op) {
        var e_1, _a;
        var parts = this.split_key(key);
        var current = this.root;
        var parent = undefined;
        try {
            for (var parts_1 = __values(parts), parts_1_1 = parts_1.next(); !parts_1_1.done; parts_1_1 = parts_1.next()) {
                var part = parts_1_1.value;
                var child = current.children.get(part);
                if (!child) {
                    child = current.children.get('#');
                    if (child) {
                        return child;
                    }
                    child = current.children.get('+');
                }
                if (!child) {
                    if (op == trie_1.TrieOp.Insert) {
                        current.children.set(part, child = new trie_1.Node(part));
                    }
                    else {
                        return undefined;
                    }
                }
                parent = current;
                current = child;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (parts_1_1 && !parts_1_1.done && (_a = parts_1.return)) _a.call(parts_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (parent && op == trie_1.TrieOp.Delete) {
            parent.children.delete(current.key);
        }
        return current;
    };
    return TopicTrie;
}(trie_1.Trie));
/**
 * Converts payload to a string regardless of the supplied type
 * @param payload The payload to convert
 * @internal
 */
function normalize_payload(payload) {
    var payload_data = payload.toString();
    if (payload instanceof DataView) {
        payload_data = new TextDecoder('utf8').decode(payload);
    }
    else if (payload instanceof Object) {
        // Convert payload to JSON string
        payload_data = JSON.stringify(payload);
    }
    return payload_data;
}
/**
 * MQTT client connection
 *
 * @module aws-crt
 * @category MQTT
 */
var MqttClientConnection = /** @class */ (function (_super) {
    __extends(MqttClientConnection, _super);
    /**
     * @param client The client that owns this connection
     * @param config The configuration for this connection
     */
    function MqttClientConnection(client, config) {
        var _this = _super.call(this) || this;
        _this.client = client;
        _this.config = config;
        _this.subscriptions = new TopicTrie();
        _this.connection_count = 0;
        _this.on_connect = function (connack) {
            _this.on_online(connack.sessionPresent);
        };
        _this.on_online = function (session_present) {
            if (++_this.connection_count == 1) {
                _this.emit('connect', session_present);
            }
            else {
                _this.emit('resume', 0, session_present);
            }
        };
        _this.on_offline = function () {
            _this.emit('interrupt', -1);
        };
        _this.on_disconnected = function () {
            _this.emit('disconnect');
        };
        _this.on_error = function (error) {
            _this.emit('error', new browser_1.CrtError(error));
        };
        _this.on_message = function (topic, payload, packet) {
            var callback = _this.subscriptions.find(topic);
            if (callback) {
                callback(topic, payload);
            }
            _this.emit('message', topic, payload);
        };
        var create_websocket_stream = function (client) { return WebsocketUtils.create_websocket_stream(_this.config); };
        var transform_websocket_url = function (url, options, client) { return WebsocketUtils.create_websocket_url(_this.config); };
        var will = _this.config.will ? {
            topic: _this.config.will.topic,
            payload: normalize_payload(_this.config.will.payload),
            qos: _this.config.will.qos,
            retain: _this.config.will.retain,
        } : undefined;
        var websocketXform = (config.websocket || {}).protocol != 'wss-custom-auth' ? transform_websocket_url : undefined;
        _this.connection = new mqtt.MqttClient(create_websocket_stream, {
            // service default is 1200 seconds
            keepalive: _this.config.keep_alive ? _this.config.keep_alive : 1200,
            clientId: _this.config.client_id,
            connectTimeout: _this.config.timeout ? _this.config.timeout : 30 * 1000,
            clean: _this.config.clean_session,
            username: _this.config.username,
            password: _this.config.password,
            reconnectPeriod: 0,
            will: will,
            transformWsUrl: websocketXform,
        });
        _this.connection.on('connect', _this.on_connect);
        _this.connection.on('error', _this.on_error);
        _this.connection.on('message', _this.on_message);
        _this.connection.on('offline', _this.on_offline);
        _this.connection.on('end', _this.on_disconnected);
        return _this;
    }
    /** @internal */
    MqttClientConnection.prototype.on = function (event, listener) {
        return _super.prototype.on.call(this, event, listener);
    };
    /**
     * Open the actual connection to the server (async).
     * @returns A Promise which completes whether the connection succeeds or fails.
     *          If connection fails, the Promise will reject with an exception.
     *          If connection succeeds, the Promise will return a boolean that is
     *          true for resuming an existing session, or false if the session is new
     */
    MqttClientConnection.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                setTimeout(function () { _this.uncork(); }, 0);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var on_connect_error = function (error) {
                            reject(new browser_1.CrtError(error));
                        };
                        _this.connection.once('connect', function (connack) {
                            _this.connection.removeListener('error', on_connect_error);
                            resolve(connack.sessionPresent);
                        });
                        _this.connection.once('error', on_connect_error);
                    })];
            });
        });
    };
    /**
     * The connection will automatically reconnect. To cease reconnection attempts, call {@link disconnect}.
     * To resume the connection, call {@link connect}.
     * @deprecated
     */
    MqttClientConnection.prototype.reconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.connect()];
            });
        });
    };
    /**
     * Publish message (async).
     * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
     *
     * @param topic Topic name
     * @param payload Contents of message
     * @param qos Quality of Service for delivering this message
     * @param retain If true, the server will store the message and its QoS so that it can be
     *               delivered to future subscribers whose subscriptions match the topic name
     * @returns Promise which returns a {@link MqttRequest} which will contain the packet id of
     *          the PUBLISH packet.
     *
     * * For QoS 0, completes as soon as the packet is sent.
     * * For QoS 1, completes when PUBACK is received.
     * * For QoS 2, completes when PUBCOMP is received.
     */
    MqttClientConnection.prototype.publish = function (topic, payload, qos, retain) {
        if (retain === void 0) { retain = false; }
        return __awaiter(this, void 0, void 0, function () {
            var payload_data;
            var _this = this;
            return __generator(this, function (_a) {
                payload_data = normalize_payload(payload);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.connection.publish(topic, payload_data, { qos: qos, retain: retain }, function (error, packet) {
                            if (error) {
                                reject(new browser_1.CrtError(error));
                                return _this.on_error(error);
                            }
                            resolve({ packet_id: packet.messageId });
                        });
                    })];
            });
        });
    };
    /**
     * Subscribe to a topic filter (async).
     * The client sends a SUBSCRIBE packet and the server responds with a SUBACK.
     *
     * subscribe() may be called while the device is offline, though the async
     * operation cannot complete successfully until the connection resumes.
     *
     * Once subscribed, `callback` is invoked each time a message matching
     * the `topic` is received. It is possible for such messages to arrive before
     * the SUBACK is received.
     *
     * @param topic Subscribe to this topic filter, which may include wildcards
     * @param qos Maximum requested QoS that server may use when sending messages to the client.
     *            The server may grant a lower QoS in the SUBACK
     * @param on_message Optional callback invoked when message received.
     * @returns Promise which returns a {@link MqttSubscribeRequest} which will contain the
     *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
     *          from the server or is rejected when an exception occurs.
     */
    MqttClientConnection.prototype.subscribe = function (topic, qos, on_message) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.subscriptions.insert(topic, on_message);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.connection.subscribe(topic, { qos: qos }, function (error, packet) {
                            if (error) {
                                reject(new browser_1.CrtError(error));
                                return _this.on_error(error);
                            }
                            var sub = packet[0];
                            resolve({ topic: sub.topic, qos: sub.qos });
                        });
                    })];
            });
        });
    };
    /**
    * Unsubscribe from a topic filter (async).
    * The client sends an UNSUBSCRIBE packet, and the server responds with an UNSUBACK.
    * @param topic The topic filter to unsubscribe from. May contain wildcards.
    * @returns Promise wihch returns a {@link MqttRequest} which will contain the packet id
    *          of the UNSUBSCRIBE packet being acknowledged. Promise is resolved when an
    *          UNSUBACK is received from the server or is rejected when an exception occurs.
    */
    MqttClientConnection.prototype.unsubscribe = function (topic) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.subscriptions.remove(topic);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.connection.unsubscribe(topic, undefined, function (error, packet) {
                            if (error) {
                                reject(new browser_1.CrtError(error));
                                return _this.on_error(error);
                            }
                            resolve({ packet_id: packet.messageId });
                        });
                    })];
            });
        });
    };
    /**
     * Close the connection (async).
     * @returns Promise which completes when the connection is closed.
    */
    MqttClientConnection.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        _this.connection.end(undefined, undefined, function () {
                            resolve();
                        });
                    })];
            });
        });
    };
    return MqttClientConnection;
}(event_1.BufferedEventEmitter));
exports.MqttClientConnection = MqttClientConnection;
//# sourceMappingURL=mqtt.js.map

        let F = 0
let FRAME = 0
let BLOCK_SIZE = 0
let SAMPLE_RATE = 0
let NULL_SIGNAL = 0
function SND_TO_NULL(m) {}
        
                const i32 = (v) => v
                const f32 = i32
                const f64 = i32
                
function toInt(v) {
                    return v
                }
function toFloat(v) {
                    return v
                }
function createFloatArray(length) {
                    return new Float64Array(length)
                }
function setFloatDataView(dataView, position, value) {
                    dataView.setFloat64(position, value)
                }
function getFloatDataView(dataView, position) {
                    return dataView.getFloat64(position)
                }
const SKED_ID_NULL = -1
const SKED_ID_COUNTER_INIT = 1
const _SKED_WAIT_IN_PROGRESS = 0
const _SKED_WAIT_OVER = 1
const _SKED_MODE_WAIT = 0
const _SKED_MODE_SUBSCRIBE = 1


function sked_create(isLoggingEvents) {
            return {
                eventLog: new Set(),
                events: new Map(),
                requests: new Map(),
                idCounter: SKED_ID_COUNTER_INIT,
                isLoggingEvents,
            }
        }
function sked_wait(skeduler, event, callback) {
            if (skeduler.isLoggingEvents === false) {
                throw new Error("Please activate skeduler's isLoggingEvents")
            }

            if (skeduler.eventLog.has(event)) {
                callback(event)
                return SKED_ID_NULL
            } else {
                return _sked_createRequest(skeduler, event, callback, _SKED_MODE_WAIT)
            }
        }
function sked_wait_future(skeduler, event, callback) {
            return _sked_createRequest(skeduler, event, callback, _SKED_MODE_WAIT)
        }
function sked_subscribe(skeduler, event, callback) {
            return _sked_createRequest(skeduler, event, callback, _SKED_MODE_SUBSCRIBE)
        }
function sked_emit(skeduler, event) {
            if (skeduler.isLoggingEvents === true) {
                skeduler.eventLog.add(event)
            }
            if (skeduler.events.has(event)) {
                const skedIds = skeduler.events.get(event)
                const skedIdsStaying = []
                for (let i = 0; i < skedIds.length; i++) {
                    if (skeduler.requests.has(skedIds[i])) {
                        const request = skeduler.requests.get(skedIds[i])
                        request.callback(event)
                        if (request.mode === _SKED_MODE_WAIT) {
                            skeduler.requests.delete(request.id)
                        } else {
                            skedIdsStaying.push(request.id)
                        }
                    }
                }
                skeduler.events.set(event, skedIdsStaying)
            }
        }
function sked_cancel(skeduler, id) {
            skeduler.requests.delete(id)
        }
function _sked_createRequest(skeduler, event, callback, mode) {
            const id = _sked_nextId(skeduler)
            const request = {
                id, 
                mode, 
                callback,
            }
            skeduler.requests.set(id, request)
            if (!skeduler.events.has(event)) {
                skeduler.events.set(event, [id])    
            } else {
                skeduler.events.get(event).push(id)
            }
            return id
        }
function _sked_nextId(skeduler) {
            return skeduler.idCounter++
        }
const _commons_ENGINE_LOGGED_SKEDULER = sked_create(true)
const _commons_FRAME_SKEDULER = sked_create(false)
function _commons_emitEngineConfigure() {
            sked_emit(_commons_ENGINE_LOGGED_SKEDULER, 'configure')
        }
function _commons_emitFrame(frame) {
            sked_emit(_commons_FRAME_SKEDULER, frame.toString())
        }
const MSG_FLOAT_TOKEN = "number"
const MSG_STRING_TOKEN = "string"
function msg_create(template) {
                    const m = []
                    let i = 0
                    while (i < template.length) {
                        if (template[i] === MSG_STRING_TOKEN) {
                            m.push('')
                            i += 2
                        } else if (template[i] === MSG_FLOAT_TOKEN) {
                            m.push(0)
                            i += 1
                        }
                    }
                    return m
                }
function msg_getLength(message) {
                    return message.length
                }
function msg_getTokenType(message, tokenIndex) {
                    return typeof message[tokenIndex]
                }
function msg_isStringToken(message, tokenIndex) {
                    return msg_getTokenType(message, tokenIndex) === 'string'
                }
function msg_isFloatToken(message, tokenIndex) {
                    return msg_getTokenType(message, tokenIndex) === 'number'
                }
function msg_isMatching(message, tokenTypes) {
                    return (message.length === tokenTypes.length) 
                        && message.every((v, i) => msg_getTokenType(message, i) === tokenTypes[i])
                }
function msg_writeFloatToken(message, tokenIndex, value) {
                    message[tokenIndex] = value
                }
function msg_writeStringToken(message, tokenIndex, value) {
                    message[tokenIndex] = value
                }
function msg_readFloatToken(message, tokenIndex) {
                    return message[tokenIndex]
                }
function msg_readStringToken(message, tokenIndex) {
                    return message[tokenIndex]
                }
function msg_floats(values) {
                    return values
                }
function msg_strings(values) {
                    return values
                }
function msg_display(message) {
                    return '[' + message
                        .map(t => typeof t === 'string' ? '"' + t + '"' : t.toString())
                        .join(', ') + ']'
                }
function msg_isBang(message) {
            return (
                msg_isStringToken(message, 0) 
                && msg_readStringToken(message, 0) === 'bang'
            )
        }
function msg_bang() {
            const message = msg_create([MSG_STRING_TOKEN, 4])
            msg_writeStringToken(message, 0, 'bang')
            return message
        }
function msg_emptyToBang(message) {
            if (msg_getLength(message) === 0) {
                return msg_bang()
            } else {
                return message
            }
        }
const MSG_BUSES = new Map()
function msgBusPublish(busName, message) {
            let i = 0
            const callbacks = MSG_BUSES.has(busName) ? MSG_BUSES.get(busName): []
            for (i = 0; i < callbacks.length; i++) {
                callbacks[i](message)
            }
        }
function msgBusSubscribe(busName, callback) {
            if (!MSG_BUSES.has(busName)) {
                MSG_BUSES.set(busName, [])
            }
            MSG_BUSES.get(busName).push(callback)
        }
function msgBusUnsubscribe(busName, callback) {
            if (!MSG_BUSES.has(busName)) {
                return
            }
            const callbacks = MSG_BUSES.get(busName)
            const found = callbacks.indexOf(callback) !== -1
            if (found !== -1) {
                callbacks.splice(found, 1)
            }
        }
function commons_waitEngineConfigure(callback) {
            sked_wait(_commons_ENGINE_LOGGED_SKEDULER, 'configure', callback)
        }
function commons_waitFrame(frame, callback) {
            return sked_wait_future(_commons_FRAME_SKEDULER, frame.toString(), callback)
        }
function commons_cancelWaitFrame(id) {
            sked_cancel(_commons_FRAME_SKEDULER, id)
        }

function n_control_setReceiveBusName(state, busName) {
        if (state.receiveBusName !== "empty") {
            msgBusUnsubscribe(state.receiveBusName, state.messageReceiver)
        }
        state.receiveBusName = busName
        if (state.receiveBusName !== "empty") {
            msgBusSubscribe(state.receiveBusName, state.messageReceiver)
        }
    }
function n_control_setSendReceiveFromMessage(state, m) {
        if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
            && msg_readStringToken(m, 0) === 'receive'
        ) {
            n_control_setReceiveBusName(state, msg_readStringToken(m, 1))
            return true

        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
            && msg_readStringToken(m, 0) === 'send'
        ) {
            state.sendBusName = msg_readStringToken(m, 1)
            return true
        }
        return false
    }
function n_control_defaultMessageHandler(m) {}
function n_sl_receiveMessage(state, m) {
                    if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                        state.valueFloat = msg_readFloatToken(m, 0)
                        const outMessage = msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (msg_isBang(m)) {
                        
                        const outMessage = msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (
                        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN]) 
                        && msg_readStringToken(m, 0) === 'set'
                    ) {
                        state.valueFloat = msg_readFloatToken(m, 1)
                        return
                    
                    } else if (n_control_setSendReceiveFromMessage(state, m) === true) {
                        return
                    }
                }

function n_radio_receiveMessage(state, m) {
                    if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                        state.valueFloat = msg_readFloatToken(m, 0)
                        const outMessage = msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (msg_isBang(m)) {
                        
                        const outMessage = msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (
                        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN]) 
                        && msg_readStringToken(m, 0) === 'set'
                    ) {
                        state.valueFloat = msg_readFloatToken(m, 1)
                        return
                    
                    } else if (n_control_setSendReceiveFromMessage(state, m) === true) {
                        return
                    }
                }
function n_bang_receiveMessage(state, m) {
                if (n_control_setSendReceiveFromMessage(state, m) === true) {
                    return
                }
                
                const outMessage = msg_bang()
                state.messageSender(outMessage)
                if (state.sendBusName !== "empty") {
                    msgBusPublish(state.sendBusName, outMessage)
                }
                return
            }
function n_tgl_receiveMessage(state, m) {
                    if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                        state.valueFloat = msg_readFloatToken(m, 0)
                        const outMessage = msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (msg_isBang(m)) {
                        state.valueFloat = state.valueFloat === 0 ? state.maxValue: 0
                        const outMessage = msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (
                        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN]) 
                        && msg_readStringToken(m, 0) === 'set'
                    ) {
                        state.valueFloat = msg_readFloatToken(m, 1)
                        return
                    
                    } else if (n_control_setSendReceiveFromMessage(state, m) === true) {
                        return
                    }
                }
function msg_copyTemplate(src, start, end) {
            const template = []
            for (let i = start; i < end; i++) {
                const tokenType = msg_getTokenType(src, i)
                template.push(tokenType)
                if (tokenType === MSG_STRING_TOKEN) {
                    template.push(msg_readStringToken(src, i).length)
                }
            }
            return template
        }
function msg_copyMessage(src, dest, srcStart, srcEnd, destStart) {
            let i = srcStart
            let j = destStart
            for (i, j; i < srcEnd; i++, j++) {
                if (msg_getTokenType(src, i) === MSG_STRING_TOKEN) {
                    msg_writeStringToken(dest, j, msg_readStringToken(src, i))
                } else {
                    msg_writeFloatToken(dest, j, msg_readFloatToken(src, i))
                }
            }
        }
function msg_slice(message, start, end) {
            if (msg_getLength(message) <= start) {
                throw new Error('message empty')
            }
            const template = msg_copyTemplate(message, start, end)
            const newMessage = msg_create(template)
            msg_copyMessage(message, newMessage, start, end, 0)
            return newMessage
        }
function msg_concat(message1, message2) {
            const newMessage = msg_create(msg_copyTemplate(message1, 0, msg_getLength(message1)).concat(msg_copyTemplate(message2, 0, msg_getLength(message2))))
            msg_copyMessage(message1, newMessage, 0, msg_getLength(message1), 0)
            msg_copyMessage(message2, newMessage, 0, msg_getLength(message2), msg_getLength(message1))
            return newMessage
        }
function msg_shift(message) {
            switch (msg_getLength(message)) {
                case 0:
                    throw new Error('message empty')
                case 1:
                    return msg_create([])
                default:
                    return msg_slice(message, 1, msg_getLength(message))
            }
        }
function n_floatatom_receiveMessage(state, m) {
                    if (msg_isBang(m)) {
                        state.messageSender(state.value)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, state.value)
                        }
                        return
                    
                    } else if (
                        msg_getTokenType(m, 0) === MSG_STRING_TOKEN
                        && msg_readStringToken(m, 0) === 'set'
                    ) {
                        const setMessage = msg_slice(m, 1, msg_getLength(m))
                        if (msg_isMatching(setMessage, [MSG_FLOAT_TOKEN])) { 
                                state.value = setMessage    
                                return
                        }
        
                    } else if (n_control_setSendReceiveFromMessage(state, m) === true) {
                        return
                        
                    } else if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    
                        state.value = m
                        state.messageSender(state.value)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, state.value)
                        }
                        return
        
                    }
                }
function mtof(value) {
        return value <= -1500 ? 0: (value > 1499 ? 3.282417553401589e+38 : Math.pow(2, (value - 69) / 12) * 440)
    }

function n_mul_setLeft(state, value) {
                    state.leftOp = value
                }
function n_mul_setRight(state, value) {
                    state.rightOp = value
                }

function roundFloatAsPdInt(value) {
        return value > 0 ? Math.floor(value): Math.ceil(value)
    }

function n_float_int_setValueInt(state, value) {
        state.value = roundFloatAsPdInt(value)
    }
function n_float_int_setValueFloat(state, value) {
        state.value = value
    }
function n_add_setLeft(state, value) {
                    state.leftOp = value
                }
function n_add_setRight(state, value) {
                    state.rightOp = value
                }
function messageTokenToString(m, i) {
        if (msg_isStringToken(m, i)) {
            const str = msg_readStringToken(m, i)
            if (str === 'bang') {
                return 'symbol'
            } else {
                return str
            }
        } else {
            return 'float'
        }
    }
function messageTokenToFloat(m, i) {
        if (msg_isFloatToken(m, i)) {
            return msg_readFloatToken(m, i)
        } else {
            return 0
        }
    }
const _commons_ARRAYS = new Map()
const _commons_ARRAYS_SKEDULER = sked_create(false)
function commons_getArray(arrayName) {
            if (!_commons_ARRAYS.has(arrayName)) {
                throw new Error('Unknown array ' + arrayName)
            }
            return _commons_ARRAYS.get(arrayName)
        }
function commons_hasArray(arrayName) {
            return _commons_ARRAYS.has(arrayName)
        }
function commons_setArray(arrayName, array) {
            _commons_ARRAYS.set(arrayName, array)
            sked_emit(_commons_ARRAYS_SKEDULER, arrayName)
        }
function commons_subscribeArrayChanges(arrayName, callback) {
            const id = sked_subscribe(_commons_ARRAYS_SKEDULER, arrayName, callback)
            if (_commons_ARRAYS.has(arrayName)) {
                callback(arrayName)
            }
            return id
        }
function commons_cancelArrayChangesSubscription(id) {
            sked_cancel(_commons_ARRAYS_SKEDULER, id)
        }




function n_list_setSplitPoint(state, value) {
        state.splitPoint = toInt(value)
    }
function n_sub_setLeft(state, value) {
                    state.leftOp = value
                }
function n_sub_setRight(state, value) {
                    state.rightOp = value
                }

function msg_isAction(message, action) {
            return msg_isMatching(message, [MSG_STRING_TOKEN])
                && msg_readStringToken(message, 0) === action
        }
function computeUnitInSamples(sampleRate, amount, unit) {
        if (unit === 'msec' || unit === 'millisecond') {
            return amount / 1000 * sampleRate
        } else if (unit === 'sec' || unit === 'seconds' || unit === 'second') {
            return amount * sampleRate
        } else if (unit === 'min' || unit === 'minutes' || unit === 'minute') {
            return amount * 60 * sampleRate
        } else if (unit === 'samp' || unit === 'samples' || unit === 'sample') {
            return amount
        } else {
            throw new Error("invalid time unit : " + unit)
        }
    }

function interpolateLin(x, p0, p1) {
            return p0.y + (x - p0.x) * (p1.y - p0.y) / (p1.x - p0.x)
        }

function computeSlope(p0, p1) {
            return p1.x !== p0.x ? (p1.y - p0.y) / (p1.x - p0.x) : 0
        }
function removePointsBeforeFrame(points, frame) {
            const newPoints = []
            let i = 0
            while (i < points.length) {
                if (frame <= points[i].x) {
                    newPoints.push(points[i])
                }
                i++
            }
            return newPoints
        }
function insertNewLinePoints(points, p0, p1) {
            const newPoints = []
            let i = 0
            
            // Keep the points that are before the new points added
            while (i < points.length && points[i].x <= p0.x) {
                newPoints.push(points[i])
                i++
            }
            
            // Find the start value of the start point :
            
            // 1. If there is a previous point and that previous point
            // is on the same frame, we don't modify the start point value.
            // (represents a vertical line).
            if (0 < i - 1 && points[i - 1].x === p0.x) {

            // 2. If new points are inserted in between already existing points 
            // we need to interpolate the existing line to find the startValue.
            } else if (0 < i && i < points.length) {
                newPoints.push({
                    x: p0.x,
                    y: interpolateLin(p0.x, points[i - 1], points[i])
                })

            // 3. If new line is inserted after all existing points, 
            // we just take the value of the last point
            } else if (i >= points.length && points.length) {
                newPoints.push({
                    x: p0.x,
                    y: points[points.length - 1].y,
                })

            // 4. If new line placed in first position, we take the defaultStartValue.
            } else if (i === 0) {
                newPoints.push({
                    x: p0.x,
                    y: p0.y,
                })
            }
            
            newPoints.push({
                x: p1.x,
                y: p1.y,
            })
            return newPoints
        }
function computeFrameAjustedPoints(points) {
            if (points.length < 2) {
                throw new Error('invalid length for points')
            }

            const newPoints = []
            let i = 0
            let p = points[0]
            let frameLower = 0
            let frameUpper = 0
            
            while(i < points.length) {
                p = points[i]
                frameLower = Math.floor(p.x)
                frameUpper = frameLower + 1

                // I. Placing interpolated point at the lower bound of the current frame
                // ------------------------------------------------------------------------
                // 1. Point is already on an exact frame,
                if (p.x === frameLower) {
                    newPoints.push({ x: p.x, y: p.y })

                    // 1.a. if several of the next points are also on the same X,
                    // we find the last one to draw a vertical line.
                    while (
                        (i + 1) < points.length
                        && points[i + 1].x === frameLower
                    ) {
                        i++
                    }
                    if (points[i].y !== newPoints[newPoints.length - 1].y) {
                        newPoints.push({ x: points[i].x, y: points[i].y })
                    }

                    // 1.b. if last point, we quit
                    if (i + 1 >= points.length) {
                        break
                    }

                    // 1.c. if next point is in a different frame we can move on to next iteration
                    if (frameUpper <= points[i + 1].x) {
                        i++
                        continue
                    }
                
                // 2. Point isn't on an exact frame
                // 2.a. There's a previous point, the we use it to interpolate the value.
                } else if (newPoints.length) {
                    newPoints.push({
                        x: frameLower,
                        y: interpolateLin(frameLower, points[i - 1], p),
                    })
                
                // 2.b. It's the very first point, then we don't change its value.
                } else {
                    newPoints.push({ x: frameLower, y: p.y })
                }

                // II. Placing interpolated point at the upper bound of the current frame
                // ---------------------------------------------------------------------------
                // First, we find the closest point from the frame upper bound (could be the same p).
                // Or could be a point that is exactly placed on frameUpper.
                while (
                    (i + 1) < points.length 
                    && (
                        Math.ceil(points[i + 1].x) === frameUpper
                        || Math.floor(points[i + 1].x) === frameUpper
                    )
                ) {
                    i++
                }
                p = points[i]

                // 1. If the next point is directly in the next frame, 
                // we do nothing, as this corresponds with next iteration frameLower.
                if (Math.floor(p.x) === frameUpper) {
                    continue
                
                // 2. If there's still a point after p, we use it to interpolate the value
                } else if (i < points.length - 1) {
                    newPoints.push({
                        x: frameUpper,
                        y: interpolateLin(frameUpper, p, points[i + 1]),
                    })

                // 3. If it's the last point, we dont change the value
                } else {
                    newPoints.push({ x: frameUpper, y: p.y })
                }

                i++
            }

            return newPoints
        }
function computeLineSegments(points) {
            const lineSegments = []
            let i = 0
            let p0
            let p1

            while(i < points.length - 1) {
                p0 = points[i]
                p1 = points[i + 1]
                lineSegments.push({
                    p0, p1, 
                    dy: computeSlope(p0, p1),
                    dx: 1,
                })
                i++
            }
            return lineSegments
        }

const n_line_t_defaultLine = {
        p0: {x: -1, y: 0},
        p1: {x: -1, y: 0},
        dx: 1,
        dy: 0,
    }
function n_line_t_setNewLine(state, targetValue) {
        const startFrame = toFloat(FRAME)
        const endFrame = toFloat(FRAME) + state.nextDurationSamp
        if (endFrame === toFloat(FRAME)) {
            state.currentLine = n_line_t_defaultLine
            state.currentValue = targetValue
            state.nextDurationSamp = 0
        } else {
            state.currentLine = {
                p0: {
                    x: startFrame, 
                    y: state.currentValue,
                }, 
                p1: {
                    x: endFrame, 
                    y: targetValue,
                }, 
                dx: 1,
                dy: 0,
            }
            state.currentLine.dy = computeSlope(state.currentLine.p0, state.currentLine.p1)
            state.nextDurationSamp = 0
        }
    }
function n_line_t_setNextDuration(state, durationMsec) {
        state.nextDurationSamp = computeUnitInSamples(SAMPLE_RATE, durationMsec, 'msec')
    }
function n_line_t_stop(state) {
        state.currentLine.p1.x = -1
        state.currentLine.p1.y = state.currentValue
    }

function n_spigot_setIsClosed(state, value) {
        state.isClosed = (value === 0)
    }

function n_delay_setDelay(state, delay) {
                state.delay = Math.max(0, delay)
            }
function n_delay_scheduleDelay(state, callback, currentFrame) {
                if (state.scheduledBang !== SKED_ID_NULL) {
                    n_delay_stop(state)
                }
                state.scheduledBang = commons_waitFrame(toInt(
                    Math.round(
                        toFloat(currentFrame) + state.delay * state.sampleRatio)),
                    callback
                )
            }
function n_delay_stop(state) {
                commons_cancelWaitFrame(state.scheduledBang)
                state.scheduledBang = SKED_ID_NULL
            }

function n_metro_setRate(state, rate) {
        state.rate = Math.max(rate, 0)
    }
function n_metro_scheduleNextTick(state) {
        state.snd0(msg_bang())
        state.realNextTick = state.realNextTick + state.rate * state.sampleRatio
        state.skedId = commons_waitFrame(
            toInt(Math.round(state.realNextTick)), 
            state.tickCallback,
        )
    }
function n_metro_stop(state) {
        if (state.skedId !== SKED_ID_NULL) {
            commons_cancelWaitFrame(state.skedId)
            state.skedId = SKED_ID_NULL
        }
        state.realNextTick = 0
    }

function n_osc_t_setPhase(state, phase) {
            state.phase = phase % 1.0 * 2 * Math.PI
        }

function n_phasor_t_setPhase(state, phase) {
            state.phase = phase % 1.0
        }
        
function n_0_0_RCVS_0(m) {
                                
                n_sl_receiveMessage(n_0_0_STATE, m)
                return
            
                                throw new Error('[vsl], id "n_0_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_13_RCVS_0(m) {
                                
            msgBusPublish(n_0_13_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_2_RCVS_0(m) {
                                
                n_radio_receiveMessage(n_0_2_STATE, m)
                return
            
                                throw new Error('[vradio], id "n_0_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_17_RCVS_0(m) {
                                
            msgBusPublish(n_0_17_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_17", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_3_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_3_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_14_RCVS_0(m) {
                                
            msgBusPublish(n_0_14_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_5_RCVS_0(m) {
                                
                n_tgl_receiveMessage(n_0_5_STATE, m)
                return
            
                                throw new Error('[tgl], id "n_0_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_15_RCVS_0(m) {
                                
            msgBusPublish(n_0_15_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_15", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_7_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_7_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_16_RCVS_0(m) {
                                
            msgBusPublish(n_0_16_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_16", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_1_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_1_1_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_1_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_0_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const value = msg_readFloatToken(m, 0)
                n_1_0_SNDS_0(msg_floats([mtof(value)]))
                return
            }
        
                                throw new Error('[mtof], id "n_1_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_12_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_1_12_STATE, msg_readFloatToken(m, 0))
                    m_n_1_4_0__routemsg_RCVS_0(msg_floats([n_1_12_STATE.leftOp * n_1_12_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    m_n_1_4_0__routemsg_RCVS_0(msg_floats([n_1_12_STATE.leftOp * n_1_12_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_1_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_1_4_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_1_4_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_1_4_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_1_4_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_1_4_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_1_4_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_16_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_3_16_STATE, msg_readFloatToken(m, 0))
                    m_n_3_0_0__routemsg_RCVS_0(msg_floats([n_3_16_STATE.leftOp * n_3_16_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    m_n_3_0_0__routemsg_RCVS_0(msg_floats([n_3_16_STATE.leftOp * n_3_16_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_3_16", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_0_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_3_0_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_3_0_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_0_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_3_0_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_3_0_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_17_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_3_17_STATE, msg_readFloatToken(m, 0))
                    m_n_3_2_0__routemsg_RCVS_0(msg_floats([n_3_17_STATE.leftOp * n_3_17_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    m_n_3_2_0__routemsg_RCVS_0(msg_floats([n_3_17_STATE.leftOp * n_3_17_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_3_17", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_2_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_3_2_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_3_2_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_2_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_3_2_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_3_2_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_18_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_3_18_STATE, msg_readFloatToken(m, 0))
                    m_n_3_4_0__routemsg_RCVS_0(msg_floats([n_3_18_STATE.leftOp * n_3_18_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    m_n_3_4_0__routemsg_RCVS_0(msg_floats([n_3_18_STATE.leftOp * n_3_18_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_3_18", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_4_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_3_4_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_3_4_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_4_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_3_4_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_3_4_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_19_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_3_19_STATE, msg_readFloatToken(m, 0))
                    m_n_3_6_0__routemsg_RCVS_0(msg_floats([n_3_19_STATE.leftOp * n_3_19_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    m_n_3_6_0__routemsg_RCVS_0(msg_floats([n_3_19_STATE.leftOp * n_3_19_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_3_19", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_6_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_3_6_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_3_6_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_6_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_3_6_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_3_6_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_20_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_3_20_STATE, msg_readFloatToken(m, 0))
                    m_n_3_8_0__routemsg_RCVS_0(msg_floats([n_3_20_STATE.leftOp * n_3_20_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    m_n_3_8_0__routemsg_RCVS_0(msg_floats([n_3_20_STATE.leftOp * n_3_20_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_3_20", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_8_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_3_8_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_3_8_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_8_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_3_8_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_3_8_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_21_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_3_21_STATE, msg_readFloatToken(m, 0))
                    m_n_3_9_0__routemsg_RCVS_0(msg_floats([n_3_21_STATE.leftOp * n_3_21_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    m_n_3_9_0__routemsg_RCVS_0(msg_floats([n_3_21_STATE.leftOp * n_3_21_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_3_21", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_9_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_3_9_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_3_9_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_9_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_3_9_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_3_9_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_22_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_3_22_STATE, msg_readFloatToken(m, 0))
                    m_n_3_10_0__routemsg_RCVS_0(msg_floats([n_3_22_STATE.leftOp * n_3_22_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    m_n_3_10_0__routemsg_RCVS_0(msg_floats([n_3_22_STATE.leftOp * n_3_22_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_3_22", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_10_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_3_10_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_3_10_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_10_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_3_10_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_3_10_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_23_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_3_23_STATE, msg_readFloatToken(m, 0))
                    m_n_3_14_0__routemsg_RCVS_0(msg_floats([n_3_23_STATE.leftOp * n_3_23_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    m_n_3_14_0__routemsg_RCVS_0(msg_floats([n_3_23_STATE.leftOp * n_3_23_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_3_23", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_14_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_3_14_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_3_14_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_14_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_3_14_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_3_14_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_6_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_1_6_STATE, msg_readFloatToken(m, 0))
                n_1_7_RCVS_0(msg_floats([n_1_6_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_1_7_RCVS_0(msg_floats([n_1_6_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_1_6", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_1_6_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_float_int_setValueInt(n_1_6_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[int], id "n_1_6", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_1_7_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_1_7_STATE, msg_readFloatToken(m, 0))
                    n_1_19_RCVS_0(msg_floats([n_1_7_STATE.leftOp + n_1_7_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_1_19_RCVS_0(msg_floats([n_1_7_STATE.leftOp + n_1_7_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_1_7", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_1_7_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_add_setRight(n_1_7_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[+], id "n_1_7", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_1_19_RCVS_0(m) {
                                
            if (!msg_isBang(m)) {
                for (let i = 0; i < msg_getLength(m); i++) {
                    n_1_19_STATE.stringInputs.set(i, messageTokenToString(m, i))
                    n_1_19_STATE.floatInputs.set(i, messageTokenToFloat(m, i))
                }
            }

            
                n_1_19_STATE.outputs[0] = +((roundFloatAsPdInt(n_1_19_STATE.floatInputs.get(0)) - (roundFloatAsPdInt(n_1_19_STATE.floatInputs.get(1)) % 12)) % 12 + roundFloatAsPdInt(n_1_19_STATE.floatInputs.get(1)))
        
                n_1_1_RCVS_0(msg_floats([n_1_19_STATE.outputs[0]]))
            
            
            return
        
                                throw new Error('[expr], id "n_1_19", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_1_19_RCVS_1(m) {
                                
                            n_1_19_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr], id "n_1_19", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_7_1_RCVS_0(m) {
                                
                
                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 58
                        ) {
                            n_7_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 59
                        ) {
                            n_7_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 60
                        ) {
                            n_7_4_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 61
                        ) {
                            n_7_5_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 62
                        ) {
                            n_7_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 63
                        ) {
                            n_7_7_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 64
                        ) {
                            n_7_8_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 65
                        ) {
                            n_7_9_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 66
                        ) {
                            n_7_10_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 67
                        ) {
                            n_7_11_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 68
                        ) {
                            n_7_12_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 69
                        ) {
                            n_7_13_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                SND_TO_NULL(m)
                return
            
                                throw new Error('[route], id "n_7_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_2_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_2_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_7_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_7_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_7_2_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_7_2_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_7_2_STATE.outMessages[0] = message
                n_7_2_STATE.messageTransferFunctions.splice(0, n_7_2_STATE.messageTransferFunctions.length - 1)
                n_7_2_STATE.messageTransferFunctions[0] = function (m) {
                    return n_7_2_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_7_2_STATE.messageTransferFunctions.length; i++) {
                    n_7_14_RCVS_0(n_7_2_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_7_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_14_RCVS_0(m) {
                                
                    if (msg_isBang(m)) {
                        n_7_15_RCVS_0(msg_getLength(n_7_14_STATE.currentList) === 0 ? msg_bang(): n_7_14_STATE.currentList)
                    } else {
                        n_7_15_RCVS_0(msg_getLength(n_7_14_STATE.currentList) === 0 && msg_getLength(m) === 0 ? msg_bang(): msg_concat(n_7_14_STATE.currentList, m))
                    }
                    return
                
                                throw new Error('[list], id "n_7_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_15_RCVS_0(m) {
                                
                    n_1_30_RCVS_0(m)
                    return
                
                                throw new Error('[list], id "n_7_15", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_30_RCVS_0(m) {
                                
            msgBusPublish(n_1_30_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_1_30", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_3_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_3_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_7_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_7_3_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_7_3_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_7_3_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_7_3_STATE.outMessages[0] = message
                n_7_3_STATE.messageTransferFunctions.splice(0, n_7_3_STATE.messageTransferFunctions.length - 1)
                n_7_3_STATE.messageTransferFunctions[0] = function (m) {
                    return n_7_3_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_7_3_STATE.messageTransferFunctions.length; i++) {
                    n_7_14_RCVS_0(n_7_3_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_7_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_7_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_7_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_7_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_7_4_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_7_4_STATE.outMessages[0] = message
                n_7_4_STATE.messageTransferFunctions.splice(0, n_7_4_STATE.messageTransferFunctions.length - 1)
                n_7_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_7_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_7_4_STATE.messageTransferFunctions.length; i++) {
                    n_7_14_RCVS_0(n_7_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_7_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_7_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_7_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_7_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_7_5_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_7_5_STATE.outMessages[0] = message
                n_7_5_STATE.messageTransferFunctions.splice(0, n_7_5_STATE.messageTransferFunctions.length - 1)
                n_7_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_7_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_7_5_STATE.messageTransferFunctions.length; i++) {
                    n_7_14_RCVS_0(n_7_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_7_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_7_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_7_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_7_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_7_6_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_7_6_STATE.outMessages[0] = message
                n_7_6_STATE.messageTransferFunctions.splice(0, n_7_6_STATE.messageTransferFunctions.length - 1)
                n_7_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_7_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_7_6_STATE.messageTransferFunctions.length; i++) {
                    n_7_14_RCVS_0(n_7_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_7_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_7_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_7_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_7_7_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_7_7_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_7_7_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_7_7_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_7_7_STATE.outMessages[0] = message
                n_7_7_STATE.messageTransferFunctions.splice(0, n_7_7_STATE.messageTransferFunctions.length - 1)
                n_7_7_STATE.messageTransferFunctions[0] = function (m) {
                    return n_7_7_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_7_7_STATE.messageTransferFunctions.length; i++) {
                    n_7_14_RCVS_0(n_7_7_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_7_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_8_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_8_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_7_8_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_7_8_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_7_8_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_7_8_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_7_8_STATE.outMessages[0] = message
                n_7_8_STATE.messageTransferFunctions.splice(0, n_7_8_STATE.messageTransferFunctions.length - 1)
                n_7_8_STATE.messageTransferFunctions[0] = function (m) {
                    return n_7_8_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_7_8_STATE.messageTransferFunctions.length; i++) {
                    n_7_14_RCVS_0(n_7_8_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_7_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_9_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_9_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_7_9_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_7_9_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_7_9_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_7_9_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_7_9_STATE.outMessages[0] = message
                n_7_9_STATE.messageTransferFunctions.splice(0, n_7_9_STATE.messageTransferFunctions.length - 1)
                n_7_9_STATE.messageTransferFunctions[0] = function (m) {
                    return n_7_9_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_7_9_STATE.messageTransferFunctions.length; i++) {
                    n_7_14_RCVS_0(n_7_9_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_7_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_10_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_10_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_7_10_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_7_10_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_7_10_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_7_10_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_7_10_STATE.outMessages[0] = message
                n_7_10_STATE.messageTransferFunctions.splice(0, n_7_10_STATE.messageTransferFunctions.length - 1)
                n_7_10_STATE.messageTransferFunctions[0] = function (m) {
                    return n_7_10_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_7_10_STATE.messageTransferFunctions.length; i++) {
                    n_7_14_RCVS_0(n_7_10_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_7_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_11_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_11_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_7_11_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_7_11_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_7_11_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_7_11_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_7_11_STATE.outMessages[0] = message
                n_7_11_STATE.messageTransferFunctions.splice(0, n_7_11_STATE.messageTransferFunctions.length - 1)
                n_7_11_STATE.messageTransferFunctions[0] = function (m) {
                    return n_7_11_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_7_11_STATE.messageTransferFunctions.length; i++) {
                    n_7_14_RCVS_0(n_7_11_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_7_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_12_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_12_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_7_12_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_7_12_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_7_12_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_7_12_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_7_12_STATE.outMessages[0] = message
                n_7_12_STATE.messageTransferFunctions.splice(0, n_7_12_STATE.messageTransferFunctions.length - 1)
                n_7_12_STATE.messageTransferFunctions[0] = function (m) {
                    return n_7_12_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_7_12_STATE.messageTransferFunctions.length; i++) {
                    n_7_14_RCVS_0(n_7_12_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_7_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_13_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_13_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_7_13_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_7_13_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_7_13_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_7_13_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_7_13_STATE.outMessages[0] = message
                n_7_13_STATE.messageTransferFunctions.splice(0, n_7_13_STATE.messageTransferFunctions.length - 1)
                n_7_13_STATE.messageTransferFunctions[0] = function (m) {
                    return n_7_13_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_7_13_STATE.messageTransferFunctions.length; i++) {
                    n_7_14_RCVS_0(n_7_13_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_7_13", inlet "0", unsupported message : ' + msg_display(m))
                            }



function n_1_21_RCVS_0(m) {
                                
        n_1_21_SNDS_1(msg_bang())
n_1_10_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_1_21", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_10_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_10_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_10_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_10_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_10_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_10_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_1_10_STATE.outMessages[0] = message
                n_1_10_STATE.messageTransferFunctions.splice(0, n_1_10_STATE.messageTransferFunctions.length - 1)
                n_1_10_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_10_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_10_STATE.messageTransferFunctions.length; i++) {
                    n_1_19_RCVS_0(n_1_10_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_7_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_5_7_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_5_7_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_5_7_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_5_7_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_5_7_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_5_7_STATE.outMessages[0] = message
                n_5_7_STATE.messageTransferFunctions.splice(0, n_5_7_STATE.messageTransferFunctions.length - 1)
                n_5_7_STATE.messageTransferFunctions[0] = function (m) {
                    return n_5_7_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_5_7_STATE.messageTransferFunctions.length; i++) {
                    n_5_7_SNDS_0(n_5_7_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_5_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_2_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_sub_setLeft(n_5_2_STATE, msg_readFloatToken(m, 0))
                    n_5_2_SNDS_0(msg_floats([n_5_2_STATE.leftOp - n_5_2_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_5_2_SNDS_0(msg_floats([n_5_2_STATE.leftOp - n_5_2_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[-], id "n_5_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_3_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_5_3_STATE, msg_readFloatToken(m, 0))
                    n_5_5_RCVS_0(msg_floats([n_5_3_STATE.leftOp * n_5_3_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_5_5_RCVS_0(msg_floats([n_5_3_STATE.leftOp * n_5_3_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_5_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_5_RCVS_0(m) {
                                
        n_5_4_RCVS_1(msg_floats([messageTokenToFloat(m, 0)]))
n_5_4_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_5_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_4_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_5_4_STATE, msg_readFloatToken(m, 0))
                    n_1_20_RCVS_0(msg_floats([n_5_4_STATE.leftOp + n_5_4_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_1_20_RCVS_0(msg_floats([n_5_4_STATE.leftOp + n_5_4_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_5_4", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_5_4_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_add_setRight(n_5_4_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[+], id "n_5_4", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_1_20_RCVS_0(m) {
                                
        SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
n_1_19_RCVS_1(msg_floats([messageTokenToFloat(m, 0)]))
n_1_19_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_1_20", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_10_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_5_10_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_5_10_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_5_10_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_5_10_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_5_10_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_5_10_STATE.outMessages[0] = message
                n_5_10_STATE.messageTransferFunctions.splice(0, n_5_10_STATE.messageTransferFunctions.length - 1)
                n_5_10_STATE.messageTransferFunctions[0] = function (m) {
                    return n_5_10_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_5_10_STATE.messageTransferFunctions.length; i++) {
                    n_5_9_RCVS_0(n_5_10_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_5_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_9_RCVS_0(m) {
                                
            msgBusPublish(n_5_9_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_5_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_8_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_5_8_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_5_8_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_5_8_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_5_8_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_5_8_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_5_8_STATE.outMessages[0] = message
                n_5_8_STATE.messageTransferFunctions.splice(0, n_5_8_STATE.messageTransferFunctions.length - 1)
                n_5_8_STATE.messageTransferFunctions[0] = function (m) {
                    return n_5_8_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_5_8_STATE.messageTransferFunctions.length; i++) {
                    n_5_9_RCVS_0(n_5_8_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_5_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_12_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_5_12_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_5_12_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_5_12_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_5_12_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_5_12_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_5_12_STATE.outMessages[0] = message
                n_5_12_STATE.messageTransferFunctions.splice(0, n_5_12_STATE.messageTransferFunctions.length - 1)
                n_5_12_STATE.messageTransferFunctions[0] = function (m) {
                    return n_5_12_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_5_12_STATE.messageTransferFunctions.length; i++) {
                    n_5_12_SNDS_0(n_5_12_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_5_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_6_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_5_6_STATE, msg_readFloatToken(m, 0))
                    n_5_4_RCVS_0(msg_floats([n_5_6_STATE.leftOp + n_5_6_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_5_4_RCVS_0(msg_floats([n_5_6_STATE.leftOp + n_5_6_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_5_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_13_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_5_13_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_5_13_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_5_13_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_5_13_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_5_13_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_5_13_STATE.outMessages[0] = message
                n_5_13_STATE.messageTransferFunctions.splice(0, n_5_13_STATE.messageTransferFunctions.length - 1)
                n_5_13_STATE.messageTransferFunctions[0] = function (m) {
                    return n_5_13_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_5_13_STATE.messageTransferFunctions.length; i++) {
                    n_5_9_RCVS_0(n_5_13_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_5_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_0_RCVS_0(m) {
                                
                
                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 0
                        ) {
                            n_6_1_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 1
                        ) {
                            n_6_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 2
                        ) {
                            n_6_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 3
                        ) {
                            n_6_4_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 4
                        ) {
                            n_6_5_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 5
                        ) {
                            n_6_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 6
                        ) {
                            n_6_7_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 7
                        ) {
                            n_6_8_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 8
                        ) {
                            n_6_9_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 9
                        ) {
                            n_6_10_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 10
                        ) {
                            n_6_11_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 11
                        ) {
                            n_6_12_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                SND_TO_NULL(m)
                return
            
                                throw new Error('[route], id "n_6_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_1_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_1_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_1_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_1_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_1_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_1_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_6_1_STATE.outMessages[0] = message
                n_6_1_STATE.messageTransferFunctions.splice(0, n_6_1_STATE.messageTransferFunctions.length - 1)
                n_6_1_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_1_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_1_STATE.messageTransferFunctions.length; i++) {
                    n_6_14_RCVS_0(n_6_1_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_14_RCVS_0(m) {
                                
                    if (msg_isBang(m)) {
                        n_5_9_RCVS_0(msg_getLength(n_6_14_STATE.currentList) === 0 ? msg_bang(): n_6_14_STATE.currentList)
                    } else {
                        n_5_9_RCVS_0(msg_getLength(n_6_14_STATE.currentList) === 0 && msg_getLength(m) === 0 ? msg_bang(): msg_concat(n_6_14_STATE.currentList, m))
                    }
                    return
                
                                throw new Error('[list], id "n_6_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_2_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_2_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_2_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_2_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_6_2_STATE.outMessages[0] = message
                n_6_2_STATE.messageTransferFunctions.splice(0, n_6_2_STATE.messageTransferFunctions.length - 1)
                n_6_2_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_2_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_2_STATE.messageTransferFunctions.length; i++) {
                    n_6_14_RCVS_0(n_6_2_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_3_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_3_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_3_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_3_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_3_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_6_3_STATE.outMessages[0] = message
                n_6_3_STATE.messageTransferFunctions.splice(0, n_6_3_STATE.messageTransferFunctions.length - 1)
                n_6_3_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_3_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_3_STATE.messageTransferFunctions.length; i++) {
                    n_6_14_RCVS_0(n_6_3_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_4_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_6_4_STATE.outMessages[0] = message
                n_6_4_STATE.messageTransferFunctions.splice(0, n_6_4_STATE.messageTransferFunctions.length - 1)
                n_6_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_4_STATE.messageTransferFunctions.length; i++) {
                    n_6_14_RCVS_0(n_6_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_5_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_6_5_STATE.outMessages[0] = message
                n_6_5_STATE.messageTransferFunctions.splice(0, n_6_5_STATE.messageTransferFunctions.length - 1)
                n_6_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_5_STATE.messageTransferFunctions.length; i++) {
                    n_6_14_RCVS_0(n_6_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_6_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_6_6_STATE.outMessages[0] = message
                n_6_6_STATE.messageTransferFunctions.splice(0, n_6_6_STATE.messageTransferFunctions.length - 1)
                n_6_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_6_STATE.messageTransferFunctions.length; i++) {
                    n_6_14_RCVS_0(n_6_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_7_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_7_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_7_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_7_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_7_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_7_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_6_7_STATE.outMessages[0] = message
                n_6_7_STATE.messageTransferFunctions.splice(0, n_6_7_STATE.messageTransferFunctions.length - 1)
                n_6_7_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_7_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_7_STATE.messageTransferFunctions.length; i++) {
                    n_6_14_RCVS_0(n_6_7_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_8_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_8_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_8_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_8_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_8_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_8_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_6_8_STATE.outMessages[0] = message
                n_6_8_STATE.messageTransferFunctions.splice(0, n_6_8_STATE.messageTransferFunctions.length - 1)
                n_6_8_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_8_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_8_STATE.messageTransferFunctions.length; i++) {
                    n_6_14_RCVS_0(n_6_8_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_9_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_9_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_9_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_9_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_9_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_9_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_6_9_STATE.outMessages[0] = message
                n_6_9_STATE.messageTransferFunctions.splice(0, n_6_9_STATE.messageTransferFunctions.length - 1)
                n_6_9_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_9_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_9_STATE.messageTransferFunctions.length; i++) {
                    n_6_14_RCVS_0(n_6_9_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_10_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_10_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_10_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_10_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_10_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_10_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_6_10_STATE.outMessages[0] = message
                n_6_10_STATE.messageTransferFunctions.splice(0, n_6_10_STATE.messageTransferFunctions.length - 1)
                n_6_10_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_10_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_10_STATE.messageTransferFunctions.length; i++) {
                    n_6_14_RCVS_0(n_6_10_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_11_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_11_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_11_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_11_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_11_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_11_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_6_11_STATE.outMessages[0] = message
                n_6_11_STATE.messageTransferFunctions.splice(0, n_6_11_STATE.messageTransferFunctions.length - 1)
                n_6_11_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_11_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_11_STATE.messageTransferFunctions.length; i++) {
                    n_6_14_RCVS_0(n_6_11_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_12_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_12_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_12_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_12_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_12_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_12_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_6_12_STATE.outMessages[0] = message
                n_6_12_STATE.messageTransferFunctions.splice(0, n_6_12_STATE.messageTransferFunctions.length - 1)
                n_6_12_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_12_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_12_STATE.messageTransferFunctions.length; i++) {
                    n_6_14_RCVS_0(n_6_12_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_12", inlet "0", unsupported message : ' + msg_display(m))
                            }



function n_1_23_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            const value = msg_readFloatToken(m, 0)
            if (value >= n_1_23_STATE.threshold) {
                n_1_15_RCVS_0(msg_floats([value]))
            } else {
                n_1_16_RCVS_0(msg_floats([value]))
            }
            return
        }
    
                                throw new Error('[moses], id "n_1_23", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_16_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_16_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_16_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_16_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_16_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_16_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_1_16_STATE.outMessages[0] = message
                n_1_16_STATE.messageTransferFunctions.splice(0, n_1_16_STATE.messageTransferFunctions.length - 1)
                n_1_16_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_16_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_16_STATE.messageTransferFunctions.length; i++) {
                    n_1_15_RCVS_0(n_1_16_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_16", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_15_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_15_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_15_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_15_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_15_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_15_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_1_15_STATE.outMessages[0] = message
                n_1_15_STATE.messageTransferFunctions.splice(0, n_1_15_STATE.messageTransferFunctions.length - 1)
                n_1_15_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_15_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_15_STATE.messageTransferFunctions.length; i++) {
                    n_1_14_RCVS_0(n_1_15_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_15", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_1_14_OUTS_0 = 0
function n_1_14_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 2:
                    n_line_t_setNextDuration(n_1_14_STATE, msg_readFloatToken(m, 1))
                case 1:
                    n_line_t_setNewLine(n_1_14_STATE, msg_readFloatToken(m, 0))
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_t_stop(n_1_14_STATE)
            return

        }
    
                                throw new Error('[line~], id "n_1_14", inlet "0", unsupported message : ' + msg_display(m))
                            }



function n_8_6_RCVS_0(m) {
                                
        if (!n_8_6_STATE.isClosed) {
            n_8_4_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_8_6", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_8_6_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_8_6_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_8_6", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_8_4_RCVS_0(m) {
                                
        n_8_3_RCVS_0(msg_bang())
n_8_7_RCVS_0(msg_bang())
n_1_6_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_8_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_8_7_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_8_7_STATE, 
                            () => n_8_2_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_8_7_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_8_7_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_8_7_STATE,
                        () => n_8_2_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_8_7_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_8_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_8_2_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_8_2_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_8_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_8_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_8_2_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_8_2_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_8_2_STATE.outMessages[0] = message
                n_8_2_STATE.messageTransferFunctions.splice(0, n_8_2_STATE.messageTransferFunctions.length - 1)
                n_8_2_STATE.messageTransferFunctions[0] = function (m) {
                    return n_8_2_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_8_2_STATE.messageTransferFunctions.length; i++) {
                    n_8_6_RCVS_1(n_8_2_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_8_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_8_3_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_8_3_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_8_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_8_3_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_8_3_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_8_3_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_8_3_STATE.outMessages[0] = message
                n_8_3_STATE.messageTransferFunctions.splice(0, n_8_3_STATE.messageTransferFunctions.length - 1)
                n_8_3_STATE.messageTransferFunctions[0] = function (m) {
                    return n_8_3_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_8_3_STATE.messageTransferFunctions.length; i++) {
                    n_8_6_RCVS_1(n_8_3_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_8_3", inlet "0", unsupported message : ' + msg_display(m))
                            }



function n_1_5_RCVS_0(m) {
                                
        if (msg_getLength(m) === 1) {
            if (
                (msg_isFloatToken(m, 0) && msg_readFloatToken(m, 0) === 0)
                || msg_isAction(m, 'stop')
            ) {
                n_metro_stop(n_1_5_STATE)
                return

            } else if (
                msg_isFloatToken(m, 0)
                || msg_isBang(m)
            ) {
                n_1_5_STATE.realNextTick = toFloat(FRAME)
                n_metro_scheduleNextTick(n_1_5_STATE)
                return
            }
        }
    
                                throw new Error('[metro], id "n_1_5", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_1_5_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_metro_setRate(n_1_5_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[metro], id "n_1_5", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_4_16_RCVS_0(m) {
                                
        n_4_6_RCVS_0(msg_bang())
n_4_17_RCVS_0(msg_bang())
n_4_19_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_4_16", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_19_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_4_19_STATE, 
                            () => n_4_2_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_4_19_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_4_19_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_4_19_STATE,
                        () => n_4_2_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_4_19_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_4_19", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_2_RCVS_0(m) {
                                
        n_4_18_RCVS_0(msg_bang())
n_4_22_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_4_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_22_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_4_22_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_4_22_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_4_22_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_4_22_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_4_22_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_4_22_STATE.outMessages[0] = message
                n_4_22_STATE.messageTransferFunctions.splice(0, n_4_22_STATE.messageTransferFunctions.length - 1)
                n_4_22_STATE.messageTransferFunctions[0] = function (m) {
                    return n_4_22_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_4_22_STATE.messageTransferFunctions.length; i++) {
                    n_4_5_RCVS_0(n_4_22_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_4_22", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_4_5_OUTS_0 = 0
function n_4_5_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 2:
                    n_line_t_setNextDuration(n_4_5_STATE, msg_readFloatToken(m, 1))
                case 1:
                    n_line_t_setNewLine(n_4_5_STATE, msg_readFloatToken(m, 0))
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_t_stop(n_4_5_STATE)
            return

        }
    
                                throw new Error('[line~], id "n_4_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_18_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_4_18_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_4_18_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_4_18_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_4_18_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_4_18_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_4_18_STATE.outMessages[0] = message
                n_4_18_STATE.messageTransferFunctions.splice(0, n_4_18_STATE.messageTransferFunctions.length - 1)
                n_4_18_STATE.messageTransferFunctions[0] = function (m) {
                    return n_4_18_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_4_18_STATE.messageTransferFunctions.length; i++) {
                    n_4_3_RCVS_0(n_4_18_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_4_18", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_4_3_OUTS_0 = 0
function n_4_3_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 2:
                    n_line_t_setNextDuration(n_4_3_STATE, msg_readFloatToken(m, 1))
                case 1:
                    n_line_t_setNewLine(n_4_3_STATE, msg_readFloatToken(m, 0))
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_t_stop(n_4_3_STATE)
            return

        }
    
                                throw new Error('[line~], id "n_4_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_17_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_4_17_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_4_17_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_4_17_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_4_17_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_4_17_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_4_17_STATE.outMessages[0] = message
                n_4_17_STATE.messageTransferFunctions.splice(0, n_4_17_STATE.messageTransferFunctions.length - 1)
                n_4_17_STATE.messageTransferFunctions[0] = function (m) {
                    return n_4_17_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_4_17_STATE.messageTransferFunctions.length; i++) {
                    n_4_3_RCVS_0(n_4_17_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_4_17", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_4_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_4_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_4_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_4_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_4_6_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_4_6_STATE.outMessages[0] = message
                n_4_6_STATE.messageTransferFunctions.splice(0, n_4_6_STATE.messageTransferFunctions.length - 1)
                n_4_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_4_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_4_6_STATE.messageTransferFunctions.length; i++) {
                    n_4_5_RCVS_0(n_4_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_4_6", inlet "0", unsupported message : ' + msg_display(m))
                            }



function n_1_32_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            const value = msg_readFloatToken(m, 0)
            if (value >= n_1_32_STATE.threshold) {
                n_1_8_RCVS_0(msg_floats([value]))
            } else {
                n_1_33_RCVS_0(msg_floats([value]))
            }
            return
        }
    
                                throw new Error('[moses], id "n_1_32", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_33_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_33_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_33_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_33_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_33_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_33_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_1_33_STATE.outMessages[0] = message
                n_1_33_STATE.messageTransferFunctions.splice(0, n_1_33_STATE.messageTransferFunctions.length - 1)
                n_1_33_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_33_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_33_STATE.messageTransferFunctions.length; i++) {
                    n_1_8_RCVS_0(n_1_33_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_33", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_8_RCVS_0(m) {
                                
            if (!msg_isBang(m)) {
                for (let i = 0; i < msg_getLength(m); i++) {
                    n_1_8_STATE.stringInputs.set(i, messageTokenToString(m, i))
                    n_1_8_STATE.floatInputs.set(i, messageTokenToFloat(m, i))
                }
            }

            
                n_1_8_STATE.outputs[0] = +(60000 / n_1_8_STATE.floatInputs.get(0))
        
                n_1_5_RCVS_1(msg_floats([n_1_8_STATE.outputs[0]]))
            
            
            return
        
                                throw new Error('[expr], id "n_1_8", inlet "0", unsupported message : ' + msg_display(m))
                            }



function n_2_2_RCVS_0(m) {
                                
        n_2_1_RCVS_1(msg_floats([messageTokenToFloat(m, 0)]))
n_2_0_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_2_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_2_0_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_2_0_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_2_0_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_2_0_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_2_0_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_2_0_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_2_0_STATE.outMessages[0] = message
                n_2_0_STATE.messageTransferFunctions.splice(0, n_2_0_STATE.messageTransferFunctions.length - 1)
                n_2_0_STATE.messageTransferFunctions[0] = function (m) {
                    return n_2_0_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_2_0_STATE.messageTransferFunctions.length; i++) {
                    n_2_1_RCVS_0(n_2_0_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_2_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_2_1_RCVS_0(m) {
                                
                    const inMessage = msg_isBang(m) ? msg_create([]): m
                    if (msg_getLength(inMessage) < n_2_1_STATE.splitPoint) {
                        SND_TO_NULL(m)
                        return
                    } else if (msg_getLength(inMessage) === n_2_1_STATE.splitPoint) {
                        n_2_3_RCVS_0(msg_bang())
                        SND_TO_NULL(m)
                        return
                    }
                    const outMessage1 = msg_slice(inMessage, n_2_1_STATE.splitPoint, msg_getLength(inMessage))
                    const outMessage0 = msg_slice(inMessage, 0, n_2_1_STATE.splitPoint)
                    n_2_3_RCVS_0(msg_getLength(outMessage1) === 0 ? msg_bang(): outMessage1)
                    SND_TO_NULL(msg_getLength(outMessage0) === 0 ? msg_bang(): outMessage0)
                    return
                
                                throw new Error('[list], id "n_2_1", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_2_1_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_list_setSplitPoint(n_2_1_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[list], id "n_2_1", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_2_3_RCVS_0(m) {
                                
        
                if (
                    msg_getLength(m) >= 1
                ) {
                    if (msg_getTokenType(m, 0) === MSG_FLOAT_TOKEN) {
                        n_1_7_RCVS_1(msg_floats([msg_readFloatToken(m, 0)]))
                    } else {
                        console.log('unpack : invalid token type index 0')
                    }
                }
            
        return
    
                                throw new Error('[unpack], id "n_2_3", inlet "0", unsupported message : ' + msg_display(m))
                            }



function n_1_35_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_35_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_35_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_35_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_35_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_35_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_1_35_STATE.outMessages[0] = message
                n_1_35_STATE.messageTransferFunctions.splice(0, n_1_35_STATE.messageTransferFunctions.length - 1)
                n_1_35_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_35_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_35_STATE.messageTransferFunctions.length; i++) {
                    n_1_8_RCVS_0(n_1_35_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_35", inlet "0", unsupported message : ' + msg_display(m))
                            }






let n_3_0_OUTS_0 = 0





let n_3_2_OUTS_0 = 0





let n_3_4_OUTS_0 = 0





let n_3_6_OUTS_0 = 0





let n_3_8_OUTS_0 = 0





let n_3_9_OUTS_0 = 0





let n_3_10_OUTS_0 = 0





let n_3_14_OUTS_0 = 0



















let n_1_4_OUTS_0 = 0



let n_4_0_OUTS_0 = 0













function n_1_1_SNDS_0(m) {
                    n_1_0_RCVS_0(m)
n_1_6_RCVS_1(m)
n_7_1_RCVS_0(m)
                }
function n_1_0_SNDS_0(m) {
                    n_1_12_RCVS_0(m)
n_3_16_RCVS_0(m)
n_3_17_RCVS_0(m)
n_3_18_RCVS_0(m)
n_3_19_RCVS_0(m)
n_3_20_RCVS_0(m)
n_3_21_RCVS_0(m)
n_3_22_RCVS_0(m)
n_3_23_RCVS_0(m)
                }















































function n_1_21_SNDS_1(m) {
                    n_5_7_RCVS_0(m)
n_5_12_RCVS_0(m)
                }

function n_5_7_SNDS_0(m) {
                    n_5_2_RCVS_0(m)
n_5_8_RCVS_0(m)
                }
function n_5_2_SNDS_0(m) {
                    n_5_3_RCVS_0(m)
n_5_10_RCVS_0(m)
                }







function n_5_12_SNDS_0(m) {
                    n_5_6_RCVS_0(m)
n_5_13_RCVS_0(m)
n_6_0_RCVS_0(m)
                }


















































function n_5_0_SNDS_0(m) {
                    n_5_6_RCVS_0(m)
n_6_0_RCVS_0(m)
                }





































        

        function ioRcv_n_0_0_0(m) {n_0_0_RCVS_0(m)}
function ioRcv_n_0_2_0(m) {n_0_2_RCVS_0(m)}
function ioRcv_n_0_3_0(m) {n_0_3_RCVS_0(m)}
function ioRcv_n_0_5_0(m) {n_0_5_RCVS_0(m)}
function ioRcv_n_0_7_0(m) {n_0_7_RCVS_0(m)}
        

        
                const n_0_0_STATE = {
                    minValue: 0,
                    maxValue: 1,
                    valueFloat: 0,
                    value: msg_create([]),
                    receiveBusName: "empty",
                    sendBusName: "empty",
                    messageReceiver: n_control_defaultMessageHandler,
                    messageSender: n_control_defaultMessageHandler,
                }
    
                commons_waitEngineConfigure(() => {
                    n_0_0_STATE.messageReceiver = function (m) {
                        n_sl_receiveMessage(n_0_0_STATE, m)
                    }
                    n_0_0_STATE.messageSender = n_0_13_RCVS_0
                    n_control_setReceiveBusName(n_0_0_STATE, "empty")
                })
    
                
            

            const n_0_13_STATE = {
                busName: "droneVolume",
            }
        

                const n_0_2_STATE = {
                    minValue: 0,
                    maxValue: 4,
                    valueFloat: 0,
                    value: msg_create([]),
                    receiveBusName: "empty",
                    sendBusName: "empty",
                    messageReceiver: n_control_defaultMessageHandler,
                    messageSender: n_control_defaultMessageHandler,
                }
    
                commons_waitEngineConfigure(() => {
                    n_0_2_STATE.messageReceiver = function (m) {
                        n_radio_receiveMessage(n_0_2_STATE, m)
                    }
                    n_0_2_STATE.messageSender = n_0_17_RCVS_0
                    n_control_setReceiveBusName(n_0_2_STATE, "empty")
                })
    
                
            

            const n_0_17_STATE = {
                busName: "direction",
            }
        

        const n_0_3_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_3_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_3_STATE, m)
            }
            n_0_3_STATE.messageSender = n_0_14_RCVS_0
            n_control_setReceiveBusName(n_0_3_STATE, "empty")
        })

        
    

            const n_0_14_STATE = {
                busName: "changeNote",
            }
        

                const n_0_5_STATE = {
                    minValue: 0,
                    maxValue: 1,
                    valueFloat: 0,
                    value: msg_create([]),
                    receiveBusName: "empty",
                    sendBusName: "empty",
                    messageReceiver: n_control_defaultMessageHandler,
                    messageSender: n_control_defaultMessageHandler,
                }
    
                commons_waitEngineConfigure(() => {
                    n_0_5_STATE.messageReceiver = function (m) {
                        n_tgl_receiveMessage(n_0_5_STATE, m)
                    }
                    n_0_5_STATE.messageSender = n_0_15_RCVS_0
                    n_control_setReceiveBusName(n_0_5_STATE, "empty")
                })
    
                
            

            const n_0_15_STATE = {
                busName: "metronomeOnOff",
            }
        

            const n_0_7_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_7_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_7_STATE, m)
                }
                n_0_7_STATE.messageSender = n_0_16_RCVS_0
                n_control_setReceiveBusName(n_0_7_STATE, "empty")
            })
        

            const n_0_16_STATE = {
                busName: "tempo",
            }
        

            const n_1_1_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_1_1_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_1_1_STATE, m)
                }
                n_1_1_STATE.messageSender = n_1_1_SNDS_0
                n_control_setReceiveBusName(n_1_1_STATE, "empty")
            })
        


        const n_1_12_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_1_12_STATE, 0)
            n_mul_setRight(n_1_12_STATE, 2)
        


            const m_n_1_4_0_sig_STATE = {
                currentValue: 0
            }
        

        const n_3_16_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_3_16_STATE, 0)
            n_mul_setRight(n_3_16_STATE, 1)
        


            const m_n_3_0_0_sig_STATE = {
                currentValue: 0
            }
        

        const n_3_17_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_3_17_STATE, 0)
            n_mul_setRight(n_3_17_STATE, 2)
        


            const m_n_3_2_0_sig_STATE = {
                currentValue: 0
            }
        

        const n_3_18_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_3_18_STATE, 0)
            n_mul_setRight(n_3_18_STATE, 3)
        


            const m_n_3_4_0_sig_STATE = {
                currentValue: 0
            }
        

        const n_3_19_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_3_19_STATE, 0)
            n_mul_setRight(n_3_19_STATE, 4)
        


            const m_n_3_6_0_sig_STATE = {
                currentValue: 0
            }
        

        const n_3_20_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_3_20_STATE, 0)
            n_mul_setRight(n_3_20_STATE, 5)
        


            const m_n_3_8_0_sig_STATE = {
                currentValue: 0
            }
        

        const n_3_21_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_3_21_STATE, 0)
            n_mul_setRight(n_3_21_STATE, 6)
        


            const m_n_3_9_0_sig_STATE = {
                currentValue: 0
            }
        

        const n_3_22_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_3_22_STATE, 0)
            n_mul_setRight(n_3_22_STATE, 7)
        


            const m_n_3_10_0_sig_STATE = {
                currentValue: 0
            }
        

        const n_3_23_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_3_23_STATE, 0)
            n_mul_setRight(n_3_23_STATE, 8)
        


            const m_n_3_14_0_sig_STATE = {
                currentValue: 0
            }
        

            const n_1_6_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_1_6_STATE, 0)
        

        const n_1_7_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_1_7_STATE, 0)
            n_add_setRight(n_1_7_STATE, 7)
        

        const n_1_19_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_1_19_STATE.floatInputs.set(0, 0)
n_1_19_STATE.floatInputs.set(1, 0)
        
    

        const n_7_1_STATE = {
            floatFilter: 58,
            stringFilter: "58",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_7_2_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_7_2_STATE.outTemplates[0] = []
            
                n_7_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_7_2_STATE.outTemplates[0].push(5)
            
            n_7_2_STATE.outMessages[0] = msg_create(n_7_2_STATE.outTemplates[0])
            
                msg_writeStringToken(n_7_2_STATE.outMessages[0], 0, "A#/Bb")
            
        
        
        n_7_2_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_7_2_STATE.outMessages[0]
                }
,
        ]
    

    const n_7_14_STATE = {
        splitPoint: 0,
        currentList: msg_create([]),
    }

    

     
        {
            const template = [MSG_STRING_TOKEN,3]

            n_7_14_STATE.currentList = msg_create(template)

            msg_writeStringToken(n_7_14_STATE.currentList, 0, "set")
        }
    


    const n_7_15_STATE = {
        splitPoint: 0,
        currentList: msg_create([]),
    }

    

    


            const n_1_30_STATE = {
                busName: "note",
            }
        

        const n_7_3_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_7_3_STATE.outTemplates[0] = []
            
                n_7_3_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_7_3_STATE.outTemplates[0].push(1)
            
            n_7_3_STATE.outMessages[0] = msg_create(n_7_3_STATE.outTemplates[0])
            
                msg_writeStringToken(n_7_3_STATE.outMessages[0], 0, "B")
            
        
        
        n_7_3_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_7_3_STATE.outMessages[0]
                }
,
        ]
    

        const n_7_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_7_4_STATE.outTemplates[0] = []
            
                n_7_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_7_4_STATE.outTemplates[0].push(1)
            
            n_7_4_STATE.outMessages[0] = msg_create(n_7_4_STATE.outTemplates[0])
            
                msg_writeStringToken(n_7_4_STATE.outMessages[0], 0, "C")
            
        
        
        n_7_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_7_4_STATE.outMessages[0]
                }
,
        ]
    

        const n_7_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_7_5_STATE.outTemplates[0] = []
            
                n_7_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_7_5_STATE.outTemplates[0].push(5)
            
            n_7_5_STATE.outMessages[0] = msg_create(n_7_5_STATE.outTemplates[0])
            
                msg_writeStringToken(n_7_5_STATE.outMessages[0], 0, "C#/Db")
            
        
        
        n_7_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_7_5_STATE.outMessages[0]
                }
,
        ]
    

        const n_7_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_7_6_STATE.outTemplates[0] = []
            
                n_7_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_7_6_STATE.outTemplates[0].push(1)
            
            n_7_6_STATE.outMessages[0] = msg_create(n_7_6_STATE.outTemplates[0])
            
                msg_writeStringToken(n_7_6_STATE.outMessages[0], 0, "D")
            
        
        
        n_7_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_7_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_7_7_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_7_7_STATE.outTemplates[0] = []
            
                n_7_7_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_7_7_STATE.outTemplates[0].push(5)
            
            n_7_7_STATE.outMessages[0] = msg_create(n_7_7_STATE.outTemplates[0])
            
                msg_writeStringToken(n_7_7_STATE.outMessages[0], 0, "D#/Eb")
            
        
        
        n_7_7_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_7_7_STATE.outMessages[0]
                }
,
        ]
    

        const n_7_8_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_7_8_STATE.outTemplates[0] = []
            
                n_7_8_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_7_8_STATE.outTemplates[0].push(1)
            
            n_7_8_STATE.outMessages[0] = msg_create(n_7_8_STATE.outTemplates[0])
            
                msg_writeStringToken(n_7_8_STATE.outMessages[0], 0, "E")
            
        
        
        n_7_8_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_7_8_STATE.outMessages[0]
                }
,
        ]
    

        const n_7_9_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_7_9_STATE.outTemplates[0] = []
            
                n_7_9_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_7_9_STATE.outTemplates[0].push(1)
            
            n_7_9_STATE.outMessages[0] = msg_create(n_7_9_STATE.outTemplates[0])
            
                msg_writeStringToken(n_7_9_STATE.outMessages[0], 0, "F")
            
        
        
        n_7_9_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_7_9_STATE.outMessages[0]
                }
,
        ]
    

        const n_7_10_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_7_10_STATE.outTemplates[0] = []
            
                n_7_10_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_7_10_STATE.outTemplates[0].push(5)
            
            n_7_10_STATE.outMessages[0] = msg_create(n_7_10_STATE.outTemplates[0])
            
                msg_writeStringToken(n_7_10_STATE.outMessages[0], 0, "F#/Gb")
            
        
        
        n_7_10_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_7_10_STATE.outMessages[0]
                }
,
        ]
    

        const n_7_11_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_7_11_STATE.outTemplates[0] = []
            
                n_7_11_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_7_11_STATE.outTemplates[0].push(1)
            
            n_7_11_STATE.outMessages[0] = msg_create(n_7_11_STATE.outTemplates[0])
            
                msg_writeStringToken(n_7_11_STATE.outMessages[0], 0, "G")
            
        
        
        n_7_11_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_7_11_STATE.outMessages[0]
                }
,
        ]
    

        const n_7_12_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_7_12_STATE.outTemplates[0] = []
            
                n_7_12_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_7_12_STATE.outTemplates[0].push(5)
            
            n_7_12_STATE.outMessages[0] = msg_create(n_7_12_STATE.outTemplates[0])
            
                msg_writeStringToken(n_7_12_STATE.outMessages[0], 0, "G#/Ab")
            
        
        
        n_7_12_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_7_12_STATE.outMessages[0]
                }
,
        ]
    

        const n_7_13_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_7_13_STATE.outTemplates[0] = []
            
                n_7_13_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_7_13_STATE.outTemplates[0].push(1)
            
            n_7_13_STATE.outMessages[0] = msg_create(n_7_13_STATE.outTemplates[0])
            
                msg_writeStringToken(n_7_13_STATE.outMessages[0], 0, "A")
            
        
        
        n_7_13_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_7_13_STATE.outMessages[0]
                }
,
        ]
    
commons_waitFrame(0, () => n_1_21_RCVS_0(msg_bang()))


        const n_1_10_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_10_STATE.outTemplates[0] = []
            
                n_1_10_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_1_10_STATE.outMessages[0] = msg_create(n_1_10_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_1_10_STATE.outMessages[0], 0, 60)
            
        
        
        n_1_10_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_10_STATE.outMessages[0]
                }
,
        ]
    

        const n_5_7_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_5_7_STATE.outTemplates[0] = []
            
                n_5_7_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_5_7_STATE.outMessages[0] = msg_create(n_5_7_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_5_7_STATE.outMessages[0], 0, 2)
            
        
        
        n_5_7_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_5_7_STATE.outMessages[0]
                }
,
        ]
    

        const n_5_2_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_sub_setLeft(n_5_2_STATE, 0)
            n_sub_setRight(n_5_2_STATE, 2)
        

        const n_5_3_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_5_3_STATE, 0)
            n_mul_setRight(n_5_3_STATE, 12)
        


        const n_5_4_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_5_4_STATE, 0)
            n_add_setRight(n_5_4_STATE, 0)
        


        const n_5_10_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_5_10_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_5_10_STATE.outTemplates[0] = []
            
                n_5_10_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_5_10_STATE.outTemplates[0].push(4)
            

                n_5_10_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_5_10_STATE.outTemplates[0].push(16)
            

                n_5_10_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_5_10_STATE.outTemplates[0].push(stringMem[0].length)
                }
            
            n_5_10_STATE.outMessages[0] = msg_create(n_5_10_STATE.outTemplates[0])
            
                msg_writeStringToken(n_5_10_STATE.outMessages[0], 0, "list")
            

                msg_writeStringToken(n_5_10_STATE.outMessages[0], 1, "/baseOctaveLabel")
            

                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_5_10_STATE.outMessages[0], 2, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_5_10_STATE.outMessages[0], 2, stringMem[0])
                }
            
        
                    return n_5_10_STATE.outMessages[0]
                }
,
        ]
    

            const n_5_9_STATE = {
                busName: "toGUI",
            }
        

        const n_5_8_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_5_8_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_5_8_STATE.outTemplates[0] = []
            
                n_5_8_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_5_8_STATE.outTemplates[0].push(4)
            

                n_5_8_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_5_8_STATE.outTemplates[0].push(11)
            

                n_5_8_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_5_8_STATE.outTemplates[0].push(stringMem[0].length)
                }
            
            n_5_8_STATE.outMessages[0] = msg_create(n_5_8_STATE.outTemplates[0])
            
                msg_writeStringToken(n_5_8_STATE.outMessages[0], 0, "list")
            

                msg_writeStringToken(n_5_8_STATE.outMessages[0], 1, "/baseOctave")
            

                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_5_8_STATE.outMessages[0], 2, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_5_8_STATE.outMessages[0], 2, stringMem[0])
                }
            
        
                    return n_5_8_STATE.outMessages[0]
                }
,
        ]
    

        const n_5_12_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_5_12_STATE.outTemplates[0] = []
            
                n_5_12_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_5_12_STATE.outMessages[0] = msg_create(n_5_12_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_5_12_STATE.outMessages[0], 0, 10)
            
        
        
        n_5_12_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_5_12_STATE.outMessages[0]
                }
,
        ]
    

        const n_5_6_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_5_6_STATE, 0)
            n_add_setRight(n_5_6_STATE, 48)
        

        const n_5_13_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_5_13_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_5_13_STATE.outTemplates[0] = []
            
                n_5_13_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_5_13_STATE.outTemplates[0].push(4)
            

                n_5_13_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_5_13_STATE.outTemplates[0].push(9)
            

                n_5_13_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_5_13_STATE.outTemplates[0].push(stringMem[0].length)
                }
            
            n_5_13_STATE.outMessages[0] = msg_create(n_5_13_STATE.outTemplates[0])
            
                msg_writeStringToken(n_5_13_STATE.outMessages[0], 0, "list")
            

                msg_writeStringToken(n_5_13_STATE.outMessages[0], 1, "/baseNote")
            

                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_5_13_STATE.outMessages[0], 2, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_5_13_STATE.outMessages[0], 2, stringMem[0])
                }
            
        
                    return n_5_13_STATE.outMessages[0]
                }
,
        ]
    

        const n_6_0_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_6_1_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_1_STATE.outTemplates[0] = []
            
                n_6_1_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_1_STATE.outTemplates[0].push(1)
            
            n_6_1_STATE.outMessages[0] = msg_create(n_6_1_STATE.outTemplates[0])
            
                msg_writeStringToken(n_6_1_STATE.outMessages[0], 0, "C")
            
        
        
        n_6_1_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_1_STATE.outMessages[0]
                }
,
        ]
    

    const n_6_14_STATE = {
        splitPoint: 0,
        currentList: msg_create([]),
    }

    

     
        {
            const template = [MSG_STRING_TOKEN,14]

            n_6_14_STATE.currentList = msg_create(template)

            msg_writeStringToken(n_6_14_STATE.currentList, 0, "/baseNoteLabel")
        }
    


        const n_6_2_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_2_STATE.outTemplates[0] = []
            
                n_6_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_2_STATE.outTemplates[0].push(2)
            

                n_6_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_2_STATE.outTemplates[0].push(1)
            

                n_6_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_2_STATE.outTemplates[0].push(2)
            
            n_6_2_STATE.outMessages[0] = msg_create(n_6_2_STATE.outTemplates[0])
            
                msg_writeStringToken(n_6_2_STATE.outMessages[0], 0, "C#")
            

                msg_writeStringToken(n_6_2_STATE.outMessages[0], 1, "/")
            

                msg_writeStringToken(n_6_2_STATE.outMessages[0], 2, "Db")
            
        
        
        n_6_2_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_2_STATE.outMessages[0]
                }
,
        ]
    

        const n_6_3_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_3_STATE.outTemplates[0] = []
            
                n_6_3_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_3_STATE.outTemplates[0].push(1)
            
            n_6_3_STATE.outMessages[0] = msg_create(n_6_3_STATE.outTemplates[0])
            
                msg_writeStringToken(n_6_3_STATE.outMessages[0], 0, "D")
            
        
        
        n_6_3_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_3_STATE.outMessages[0]
                }
,
        ]
    

        const n_6_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_4_STATE.outTemplates[0] = []
            
                n_6_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_4_STATE.outTemplates[0].push(2)
            

                n_6_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_4_STATE.outTemplates[0].push(1)
            

                n_6_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_4_STATE.outTemplates[0].push(2)
            
            n_6_4_STATE.outMessages[0] = msg_create(n_6_4_STATE.outTemplates[0])
            
                msg_writeStringToken(n_6_4_STATE.outMessages[0], 0, "D#")
            

                msg_writeStringToken(n_6_4_STATE.outMessages[0], 1, "/")
            

                msg_writeStringToken(n_6_4_STATE.outMessages[0], 2, "Eb")
            
        
        
        n_6_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_4_STATE.outMessages[0]
                }
,
        ]
    

        const n_6_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_5_STATE.outTemplates[0] = []
            
                n_6_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_5_STATE.outTemplates[0].push(1)
            
            n_6_5_STATE.outMessages[0] = msg_create(n_6_5_STATE.outTemplates[0])
            
                msg_writeStringToken(n_6_5_STATE.outMessages[0], 0, "E")
            
        
        
        n_6_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_5_STATE.outMessages[0]
                }
,
        ]
    

        const n_6_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_6_STATE.outTemplates[0] = []
            
                n_6_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_6_STATE.outTemplates[0].push(1)
            
            n_6_6_STATE.outMessages[0] = msg_create(n_6_6_STATE.outTemplates[0])
            
                msg_writeStringToken(n_6_6_STATE.outMessages[0], 0, "F")
            
        
        
        n_6_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_6_7_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_7_STATE.outTemplates[0] = []
            
                n_6_7_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_7_STATE.outTemplates[0].push(2)
            

                n_6_7_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_7_STATE.outTemplates[0].push(1)
            

                n_6_7_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_7_STATE.outTemplates[0].push(2)
            
            n_6_7_STATE.outMessages[0] = msg_create(n_6_7_STATE.outTemplates[0])
            
                msg_writeStringToken(n_6_7_STATE.outMessages[0], 0, "F#")
            

                msg_writeStringToken(n_6_7_STATE.outMessages[0], 1, "/")
            

                msg_writeStringToken(n_6_7_STATE.outMessages[0], 2, "Gb")
            
        
        
        n_6_7_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_7_STATE.outMessages[0]
                }
,
        ]
    

        const n_6_8_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_8_STATE.outTemplates[0] = []
            
                n_6_8_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_8_STATE.outTemplates[0].push(1)
            
            n_6_8_STATE.outMessages[0] = msg_create(n_6_8_STATE.outTemplates[0])
            
                msg_writeStringToken(n_6_8_STATE.outMessages[0], 0, "G")
            
        
        
        n_6_8_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_8_STATE.outMessages[0]
                }
,
        ]
    

        const n_6_9_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_9_STATE.outTemplates[0] = []
            
                n_6_9_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_9_STATE.outTemplates[0].push(2)
            

                n_6_9_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_9_STATE.outTemplates[0].push(1)
            

                n_6_9_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_9_STATE.outTemplates[0].push(2)
            
            n_6_9_STATE.outMessages[0] = msg_create(n_6_9_STATE.outTemplates[0])
            
                msg_writeStringToken(n_6_9_STATE.outMessages[0], 0, "G#")
            

                msg_writeStringToken(n_6_9_STATE.outMessages[0], 1, "/")
            

                msg_writeStringToken(n_6_9_STATE.outMessages[0], 2, "Ab")
            
        
        
        n_6_9_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_9_STATE.outMessages[0]
                }
,
        ]
    

        const n_6_10_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_10_STATE.outTemplates[0] = []
            
                n_6_10_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_10_STATE.outTemplates[0].push(1)
            
            n_6_10_STATE.outMessages[0] = msg_create(n_6_10_STATE.outTemplates[0])
            
                msg_writeStringToken(n_6_10_STATE.outMessages[0], 0, "A")
            
        
        
        n_6_10_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_10_STATE.outMessages[0]
                }
,
        ]
    

        const n_6_11_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_11_STATE.outTemplates[0] = []
            
                n_6_11_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_11_STATE.outTemplates[0].push(2)
            

                n_6_11_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_11_STATE.outTemplates[0].push(1)
            

                n_6_11_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_11_STATE.outTemplates[0].push(2)
            
            n_6_11_STATE.outMessages[0] = msg_create(n_6_11_STATE.outTemplates[0])
            
                msg_writeStringToken(n_6_11_STATE.outMessages[0], 0, "A#")
            

                msg_writeStringToken(n_6_11_STATE.outMessages[0], 1, "/")
            

                msg_writeStringToken(n_6_11_STATE.outMessages[0], 2, "Bb")
            
        
        
        n_6_11_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_11_STATE.outMessages[0]
                }
,
        ]
    

        const n_6_12_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_12_STATE.outTemplates[0] = []
            
                n_6_12_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_6_12_STATE.outTemplates[0].push(1)
            
            n_6_12_STATE.outMessages[0] = msg_create(n_6_12_STATE.outTemplates[0])
            
                msg_writeStringToken(n_6_12_STATE.outMessages[0], 0, "B")
            
        
        
        n_6_12_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_12_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("droneVolume", n_1_23_RCVS_0)
            })
        

        const n_1_23_STATE = {
            threshold: 0.02,
        }
    

        const n_1_16_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_16_STATE.outTemplates[0] = []
            
                n_1_16_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_1_16_STATE.outMessages[0] = msg_create(n_1_16_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_1_16_STATE.outMessages[0], 0, 0)
            
        
        
        n_1_16_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_16_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_15_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_1_15_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_1_15_STATE.outTemplates[0] = []
            
                n_1_15_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_1_15_STATE.outTemplates[0].push(stringMem[0].length)
                }
            

                n_1_15_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_1_15_STATE.outMessages[0] = msg_create(n_1_15_STATE.outTemplates[0])
            
                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_1_15_STATE.outMessages[0], 0, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_1_15_STATE.outMessages[0], 0, stringMem[0])
                }
            

                msg_writeFloatToken(n_1_15_STATE.outMessages[0], 1, 50)
            
        
                    return n_1_15_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_14_STATE = {
            currentLine: n_line_t_defaultLine,
            currentValue: 0,
            nextDurationSamp: 0,
        }
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("changeNote", n_8_6_RCVS_0)
            })
        

        const n_8_6_STATE = {
            isClosed: false
        }
    


        const n_8_7_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_8_7_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_8_7_STATE, 100)
        })
    

        const n_8_2_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_8_2_STATE.outTemplates[0] = []
            
                n_8_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_8_2_STATE.outMessages[0] = msg_create(n_8_2_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_8_2_STATE.outMessages[0], 0, 1)
            
        
        
        n_8_2_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_8_2_STATE.outMessages[0]
                }
,
        ]
    

        const n_8_3_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_8_3_STATE.outTemplates[0] = []
            
                n_8_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_8_3_STATE.outMessages[0] = msg_create(n_8_3_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_8_3_STATE.outMessages[0], 0, 0)
            
        
        
        n_8_3_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_8_3_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("metronomeOnOff", n_1_5_RCVS_0)
            })
        

        const n_1_5_STATE = {
            rate: 0,
            sampleRatio: 1,
            skedId: SKED_ID_NULL,
            realNextTick: -1,
            snd0: n_4_16_RCVS_0,
            tickCallback: function () {},
        }

        commons_waitEngineConfigure(() => {
            n_1_5_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_metro_setRate(n_1_5_STATE, 0)
            n_1_5_STATE.tickCallback = function () {
                n_metro_scheduleNextTick(n_1_5_STATE)
            }
        })
    


        const n_4_19_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_4_19_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_4_19_STATE, 40)
        })
    


        const n_4_22_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_4_22_STATE.outTemplates[0] = []
            
                n_4_22_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_4_22_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_4_22_STATE.outMessages[0] = msg_create(n_4_22_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_4_22_STATE.outMessages[0], 0, 1)
            

                msg_writeFloatToken(n_4_22_STATE.outMessages[0], 1, 5)
            
        
        
        n_4_22_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_4_22_STATE.outMessages[0]
                }
,
        ]
    

        const n_4_5_STATE = {
            currentLine: n_line_t_defaultLine,
            currentValue: 0,
            nextDurationSamp: 0,
        }
    

        const n_4_18_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_4_18_STATE.outTemplates[0] = []
            
                n_4_18_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_4_18_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_4_18_STATE.outMessages[0] = msg_create(n_4_18_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_4_18_STATE.outMessages[0], 0, 0)
            

                msg_writeFloatToken(n_4_18_STATE.outMessages[0], 1, 10)
            
        
        
        n_4_18_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_4_18_STATE.outMessages[0]
                }
,
        ]
    

        const n_4_3_STATE = {
            currentLine: n_line_t_defaultLine,
            currentValue: 0,
            nextDurationSamp: 0,
        }
    

        const n_4_17_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_4_17_STATE.outTemplates[0] = []
            
                n_4_17_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_4_17_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_4_17_STATE.outMessages[0] = msg_create(n_4_17_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_4_17_STATE.outMessages[0], 0, 1)
            

                msg_writeFloatToken(n_4_17_STATE.outMessages[0], 1, 3)
            
        
        
        n_4_17_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_4_17_STATE.outMessages[0]
                }
,
        ]
    

        const n_4_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_4_6_STATE.outTemplates[0] = []
            
                n_4_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_4_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_4_6_STATE.outMessages[0] = msg_create(n_4_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_4_6_STATE.outMessages[0], 0, 0)
            

                msg_writeFloatToken(n_4_6_STATE.outMessages[0], 1, 3)
            
        
        
        n_4_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_4_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("tempo", n_1_32_RCVS_0)
            })
        

        const n_1_32_STATE = {
            threshold: 20,
        }
    

        const n_1_33_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_33_STATE.outTemplates[0] = []
            
                n_1_33_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_1_33_STATE.outMessages[0] = msg_create(n_1_33_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_1_33_STATE.outMessages[0], 0, 20)
            
        
        
        n_1_33_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_33_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_8_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_1_8_STATE.floatInputs.set(0, 0)
        
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("direction", n_2_2_RCVS_0)
            })
        


        const n_2_0_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_2_0_STATE.outTemplates[0] = []
            
                n_2_0_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_2_0_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_2_0_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_2_0_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_2_0_STATE.outMessages[0] = msg_create(n_2_0_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_2_0_STATE.outMessages[0], 0, 7)
            

                msg_writeFloatToken(n_2_0_STATE.outMessages[0], 1, -7)
            

                msg_writeFloatToken(n_2_0_STATE.outMessages[0], 2, 1)
            

                msg_writeFloatToken(n_2_0_STATE.outMessages[0], 3, -1)
            
        
        
        n_2_0_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_2_0_STATE.outMessages[0]
                }
,
        ]
    

    const n_2_1_STATE = {
        splitPoint: 0,
        currentList: msg_create([]),
    }

    n_2_1_STATE.splitPoint = 0

    


commons_waitFrame(0, () => n_1_35_RCVS_0(msg_bang()))

        const n_1_35_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_35_STATE.outTemplates[0] = []
            
                n_1_35_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_1_35_STATE.outMessages[0] = msg_create(n_1_35_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_1_35_STATE.outMessages[0], 0, 60)
            
        
        
        n_1_35_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_35_STATE.outMessages[0]
                }
,
        ]
    
commons_waitFrame(0, () => n_4_2_RCVS_0(msg_bang()))

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("baseNote", n_5_0_SNDS_0)
            })
        

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("baseOctave", n_5_2_RCVS_0)
            })
        

            const n_3_0_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_3_0_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

            const m_n_3_1_1_sig_STATE = {
                currentValue: 1
            }
        


            const n_3_2_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_3_2_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

            const m_n_3_3_1_sig_STATE = {
                currentValue: 0.618644
            }
        


            const n_3_4_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_3_4_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

            const m_n_3_5_1_sig_STATE = {
                currentValue: 0.355932
            }
        


            const n_3_6_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_3_6_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

            const m_n_3_7_1_sig_STATE = {
                currentValue: 0.415254
            }
        


            const n_3_8_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_3_8_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

            const m_n_3_11_1_sig_STATE = {
                currentValue: 0.220339
            }
        


            const n_3_9_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_3_9_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

            const m_n_3_12_1_sig_STATE = {
                currentValue: 0.254237
            }
        


            const n_3_10_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_3_10_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

            const m_n_3_13_1_sig_STATE = {
                currentValue: 0.127119
            }
        


            const n_3_14_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_3_14_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

            const m_n_3_15_1_sig_STATE = {
                currentValue: 0.118644
            }
        



            const m_n_3_24_1_sig_STATE = {
                currentValue: 0
            }
        


            const m_n_1_13_1_sig_STATE = {
                currentValue: 0.12
            }
        




            const n_1_4_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_1_4_STATE.J = 1 / SAMPLE_RATE
            })
        




        const exports = {
            metadata: {"libVersion":"0.1.0","audioSettings":{"channelCount":{"in":2,"out":2},"bitDepth":64,"sampleRate":0,"blockSize":0},"compilation":{"io":{"messageReceivers":{"n_0_0":{"portletIds":["0"],"metadata":{"group":"control:float","type":"vsl","label":"","position":[24,188],"initValue":0,"minValue":0,"maxValue":1}},"n_0_2":{"portletIds":["0"],"metadata":{"group":"control:float","type":"vradio","label":"","position":[24,108],"initValue":0,"minValue":0,"maxValue":4}},"n_0_3":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[24,57]}},"n_0_5":{"portletIds":["0"],"metadata":{"group":"control:float","type":"tgl","label":"","position":[137,57],"initValue":0,"minValue":0,"maxValue":1}},"n_0_7":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"","position":[137,108]}}},"messageSenders":{}},"variableNamesIndex":{"io":{"messageReceivers":{"n_0_0":{"0":"ioRcv_n_0_0_0"},"n_0_2":{"0":"ioRcv_n_0_2_0"},"n_0_3":{"0":"ioRcv_n_0_3_0"},"n_0_5":{"0":"ioRcv_n_0_5_0"},"n_0_7":{"0":"ioRcv_n_0_7_0"}},"messageSenders":{}}}}},
            configure: (sampleRate, blockSize) => {
                exports.metadata.audioSettings.sampleRate = sampleRate
                exports.metadata.audioSettings.blockSize = blockSize
                SAMPLE_RATE = sampleRate
                BLOCK_SIZE = blockSize
                _commons_emitEngineConfigure()
            },
            loop: (INPUT, OUTPUT) => {
                
        for (F = 0; F < BLOCK_SIZE; F++) {
            _commons_emitFrame(FRAME)
            
        n_3_0_OUTS_0 = Math.cos(n_3_0_STATE.phase)
        n_3_0_STATE.phase += (n_3_0_STATE.J * m_n_3_0_0_sig_STATE.currentValue)
    

        n_3_2_OUTS_0 = Math.cos(n_3_2_STATE.phase)
        n_3_2_STATE.phase += (n_3_2_STATE.J * m_n_3_2_0_sig_STATE.currentValue)
    

        n_3_4_OUTS_0 = Math.cos(n_3_4_STATE.phase)
        n_3_4_STATE.phase += (n_3_4_STATE.J * m_n_3_4_0_sig_STATE.currentValue)
    

        n_3_6_OUTS_0 = Math.cos(n_3_6_STATE.phase)
        n_3_6_STATE.phase += (n_3_6_STATE.J * m_n_3_6_0_sig_STATE.currentValue)
    

        n_3_8_OUTS_0 = Math.cos(n_3_8_STATE.phase)
        n_3_8_STATE.phase += (n_3_8_STATE.J * m_n_3_8_0_sig_STATE.currentValue)
    

        n_3_9_OUTS_0 = Math.cos(n_3_9_STATE.phase)
        n_3_9_STATE.phase += (n_3_9_STATE.J * m_n_3_9_0_sig_STATE.currentValue)
    

        n_3_10_OUTS_0 = Math.cos(n_3_10_STATE.phase)
        n_3_10_STATE.phase += (n_3_10_STATE.J * m_n_3_10_0_sig_STATE.currentValue)
    

        n_3_14_OUTS_0 = Math.cos(n_3_14_STATE.phase)
        n_3_14_STATE.phase += (n_3_14_STATE.J * m_n_3_14_0_sig_STATE.currentValue)
    

    n_1_14_OUTS_0 = n_1_14_STATE.currentValue
    if (toFloat(FRAME) < n_1_14_STATE.currentLine.p1.x) {
        n_1_14_STATE.currentValue += n_1_14_STATE.currentLine.dy
        if (toFloat(FRAME + 1) >= n_1_14_STATE.currentLine.p1.x) {
            n_1_14_STATE.currentValue = n_1_14_STATE.currentLine.p1.y
        }
    }


    n_4_5_OUTS_0 = n_4_5_STATE.currentValue
    if (toFloat(FRAME) < n_4_5_STATE.currentLine.p1.x) {
        n_4_5_STATE.currentValue += n_4_5_STATE.currentLine.dy
        if (toFloat(FRAME + 1) >= n_4_5_STATE.currentLine.p1.x) {
            n_4_5_STATE.currentValue = n_4_5_STATE.currentLine.p1.y
        }
    }


        n_1_4_OUTS_0 = n_1_4_STATE.phase % 1
        n_1_4_STATE.phase += (n_1_4_STATE.J * m_n_1_4_0_sig_STATE.currentValue)
    

    n_4_3_OUTS_0 = n_4_3_STATE.currentValue
    if (toFloat(FRAME) < n_4_3_STATE.currentLine.p1.x) {
        n_4_3_STATE.currentValue += n_4_3_STATE.currentLine.dy
        if (toFloat(FRAME + 1) >= n_4_3_STATE.currentLine.p1.x) {
            n_4_3_STATE.currentValue = n_4_3_STATE.currentLine.p1.y
        }
    }

n_4_0_OUTS_0 = ((((((n_3_0_OUTS_0 * m_n_3_1_1_sig_STATE.currentValue) + (n_3_2_OUTS_0 * m_n_3_3_1_sig_STATE.currentValue) + (n_3_4_OUTS_0 * m_n_3_5_1_sig_STATE.currentValue) + (n_3_6_OUTS_0 * m_n_3_7_1_sig_STATE.currentValue) + (n_3_8_OUTS_0 * m_n_3_11_1_sig_STATE.currentValue) + (n_3_9_OUTS_0 * m_n_3_12_1_sig_STATE.currentValue) + (n_3_10_OUTS_0 * m_n_3_13_1_sig_STATE.currentValue) + (n_3_14_OUTS_0 * m_n_3_15_1_sig_STATE.currentValue)) + m_n_3_24_1_sig_STATE.currentValue) * m_n_1_13_1_sig_STATE.currentValue) * n_1_14_OUTS_0) * n_4_5_OUTS_0) + (n_1_4_OUTS_0 * n_4_3_OUTS_0)
OUTPUT[0][F] = n_4_0_OUTS_0
OUTPUT[1][F] = n_4_0_OUTS_0
            FRAME++
        }
    
            },
            io: {
                messageReceivers: {
                    n_0_0: {
                            "0": ioRcv_n_0_0_0,
                        },
n_0_2: {
                            "0": ioRcv_n_0_2_0,
                        },
n_0_3: {
                            "0": ioRcv_n_0_3_0,
                        },
n_0_5: {
                            "0": ioRcv_n_0_5_0,
                        },
n_0_7: {
                            "0": ioRcv_n_0_7_0,
                        },
                },
                messageSenders: {
                    
                },
            }
        }

        
exports.commons_getArray = commons_getArray
exports.commons_setArray = commons_setArray
    
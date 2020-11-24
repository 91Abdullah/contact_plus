import React, {useEffect, useState} from "react";
import {Space, Row, Col, Card, Button, Badge, Input, Result} from "antd";
import {CheckCircleOutlined, PhoneOutlined, StopOutlined} from "@ant-design/icons"
import {SimpleUser, SimpleUserDelegate, SimpleUserOptions} from "sip.js/lib/platform/web";
import {UserAgent, Web} from "sip.js";
import Stopwatch from "../classes/Stopwatch";

const DISCONNECTED = "DISCONNECTED"
const UNREGISTERED = "UNREGISTERED"
const CONNECTED = "CONNECTED"
const REGISTERED = "REGISTERED"

export default function SimplePhone() {

    const delegate: SimpleUserDelegate = {
        onServerConnect() {
            setDeviceStatus(CONNECTED)
        },
        onServerDisconnect(error: Error) {
            setDeviceStatus(DISCONNECTED)
        },
        onRegistered() {
            setPhoneStatus(REGISTERED)
        },
        onUnregistered() {
            setPhoneStatus(UNREGISTERED)
        },
        onCallCreated() {
            console.log('call created')
            setOnCall(true)
            stopwatch.start()
        },
        onCallHangup() {
            console.log('call hangup')
            setOnCall(false)
            setIncomingCall(false)
            stopwatch.stop()
            stopwatch.reset()
            setCallStatus(DISCONNECTED)
        },
        onCallAnswered() {
            console.log(`Call Answered`)
            stopwatch.start()
            setCallStatus(CONNECTED)
            setCallAccepted(true)
        },
        onCallReceived(data) {
            console.log(`Incoming call from ${data}`)
            setIncomingCall(true)
        }
    }

    const [simpleUser, setSimpleUser] = useState(null)

    // Phone & Device states
    const [phoneStatus, setPhoneStatus] = useState("UNREGISTERED")
    const [deviceStatus, setDeviceStatus] = useState("DISCONNECTED")
    const [phoneColor, setPhoneColor] = useState('#a61d24')
    const [deviceColor, setDeviceColor] = useState('#a61d24')
    const [btnColor, setBtnColor] = useState("primary")
    const [btnText, setBtnText] = useState("REGISTER")
    const [outgoingNumber, setOutgoingNumber] = useState(null)
    const [onCall, setOnCall] = useState(false)
    const [incomingCall, setIncomingCall] = useState(false)
    const [callAccepted, setCallAccepted] = useState(false)
    const [callStatus, setCallStatus] = useState(DISCONNECTED)

    let stopwatch = null

    // User details
    const server = "wss://192.168.144.152:8089/ws"
    const displayName = 'Abdullah Basit'
    const sipUser = '1001'
    const aor = `sip:${sipUser}@192.168.144.152:5160`
    const options = {
        aor,
        delegate,
        media: {
            constraints: {
                audio: true,
                video: false
            },
            local: {
                audio: document.getElementById('localAudio')
            },
            remote: {
                audio: document.getElementById('remoteAudio')
            }
        },
        userAgentOptions: {
            authorizationUsername: sipUser,
            authorizationPassword: '1001',
            uri: UserAgent.makeURI(`sip:${sipUser}@192.168.144.152:5160`),
            viaHost: '192.168.144.152',
            logLevel: "error",
        }
    }

    useEffect(() => {
        setSimpleUser(new SimpleUser(server, options))
        stopwatch = new Stopwatch(document.querySelector(".stopwatch"), document.querySelector('.stopwatch'))
    }, [])

    useEffect(() => {
        if(phoneStatus === REGISTERED) {
            setPhoneColor('#52c41a')
            setBtnColor("danger")
            setBtnText("UNREGISTER")
        } else {
            setPhoneColor('#a61d24')
            setBtnColor("primary")
            setBtnText("REGISTER")
        }
    }, [phoneStatus])

    useEffect(() => {
        if(deviceStatus === CONNECTED) {
            setDeviceColor('#52c41a')
        } else {
            setDeviceColor('#a61d24')
        }
    }, [deviceStatus])

    async function startUserAgent() {
        await simpleUser.connect();
    }

    async function registerAgent() {
        // Register to receive inbound calls
        await simpleUser.register();
    }

    async function unregisterAgent() {
        // Register to receive inbound calls
        await simpleUser.unregister();
    }

    function registerPhone() {
        if(phoneStatus === REGISTERED) {
            unregisterAgent()
                .then(console.log('User agent unregistered...'))
        } else {
            console.log('Registering phone...')
            startUserAgent().then(r => {
                console.log(r)
                registerAgent().then(r => console.log(r))
                    .catch(error => console.log(error))
            })
                .catch(error => console.log(error))
        }
    }

    function dialOutgoingCall() {
        if(!isNaN(parseInt(outgoingNumber))) {
            console.log("This is a number", outgoingNumber)
            simpleUser.call(`sip:${outgoingNumber}@192.168.144.152:5160`)
        } else {
            console.log(`Invalid Number entered ${outgoingNumber}`)
        }
    }

    function hangupOutgoingCall() {
        simpleUser.hangup().then(r => console.log(r))
    }

    function acceptIncomingCall() {
        simpleUser.answer()
    }

    function rejectIncomingCall() {
        simpleUser.decline().then(r => console.log(r))
    }

    return (
        <>
            <Row>
                <Col xs={{span: 24}} sm={{span: 24}} lg={{span: 16, offset: 4}}>
                    <Row style={{marginBottom: '10px'}}>
                        <Col xs={{span: 12}} lg={{span: 12}}>
                            <Badge style={{ backgroundColor: deviceColor }} count={deviceStatus} />
                        </Col>
                        <Col style={{textAlign: "right"}} xs={{span: 12}} lg={{span: 12}}>
                            <Badge style={{ backgroundColor: phoneColor }} count={phoneStatus} />
                        </Col>
                    </Row>
                    {incomingCall ? <Result
                        icon={<PhoneOutlined />}
                        title="You have an incoming call from [777]..."
                        extra={
                            <>
                                <div>
                                    <Space align={"center"} direction={"vertical"}>
                                        <span className="stopwatch" />
                                        <span style={{textAlign: "right"}}>
                                        {callStatus}
                                    </span>
                                    </Space>
                                </div>
                                <Button disabled={callAccepted} onClick={acceptIncomingCall} icon={<PhoneOutlined/>} type="primary">Accept</Button>
                                <Button onClick={rejectIncomingCall} icon={<StopOutlined/>} type="danger">Reject</Button>
                            </>
                        }
                    /> : <Card title={`${displayName} - ${sipUser}`} extra={<Button type={btnColor} icon={<CheckCircleOutlined />} onClick={registerPhone}>{btnText}</Button>}>
                        <audio id="remoteAudio">
                            <p>Audio not supported</p>
                        </audio>
                        <audio id="localAudio" muted="muted" />
                        <Input onChange={event => setOutgoingNumber(event.target.value)} size="large" placeholder="Enter Number" prefix={<PhoneOutlined />} />
                        <Row>
                            <Col style={{marginTop: '10px', fontWeight: 'bold'}} span={12} offset={10}>
                                <Space align={"center"} direction={"vertical"}>
                                    <span className="stopwatch" />
                                    <span style={{textAlign: "right"}}>
                                    {callStatus}
                                </span>
                                </Space>
                            </Col>
                        </Row>
                        <div style={{textAlign: "center", marginTop: '10px'}}>
                            <Space direction={"horizontal"}>
                                <Button disabled={onCall} onClick={dialOutgoingCall} size={"large"} icon={<PhoneOutlined />} type={"primary"}>DIAL</Button>
                                <Button disabled={!onCall} onClick={hangupOutgoingCall} size={"large"} icon={<StopOutlined />} type={"danger"}>HANGUP</Button>
                            </Space>
                        </div>
                    </Card>}
                </Col>
            </Row>
        </>
    )
}
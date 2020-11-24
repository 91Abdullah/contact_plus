import React, {useEffect, useState, useRef} from "react";
import {Alert, Badge, Input, Row, Col, Button, Space, Tooltip, message} from "antd";
import {
    AudioMutedOutlined,
    SoundOutlined,
    PhoneOutlined,
    CloseSquareOutlined,
    SettingTwoTone,
    CheckCircleOutlined,
    CloseCircleOutlined
} from "@ant-design/icons";
import {
    Inviter,
    Registerer,
    SessionState,
    UserAgent,
    RegistererState,
    InviterOptions,
    Session,
    UserAgentOptions, Invitation, SessionInviteOptions, InvitationAcceptOptions
} from "sip.js"
import {AnimateKeyframes} from "react-simple-animate"
import {OutgoingInviteRequest} from "sip.js/lib/core"
import { Web } from "sip.js"
import ring from "../ring.mp3"
import Clock from "react-digital-clock"

function Dashboard() {
    const CONNECTED = "CONNECTED";
    const DISCONNECTED = "DISCONNECTED";
    const REGISTERED = "REGISTERED";
    const UNREGISTERED = "UNREGISTERED";

    // Registration & Connection Status
    const [registrationState, setRegistrationState] = useState(false)
    const [connectionState, setConnectionState] = useState(false)

    // Call status variables
    const [callState, setCallState] = useState(false)
    const [holdState, setHoldState] = useState(false)
    const [muteState, setMuteState] = useState(false)

    const [callStateText, setCallStateText] = useState("DISCONNECTED")

    const [outgoingNumber, setOutgoingNumber] = useState('')
    const [incomingCall, setIncomingCall] = useState(false)

    /** Incoming Modal **/



    /** End Incoming Modal **/

    /** Media settings **/

    // Assumes you have a media element on the DOM
    const mediaElement = useRef()
    const incomingRing = useRef()
    const remoteStream = new MediaStream()

    /** End Media settings **/

    /** User agent settings **/

    const [userAgent, setUserAgent] = useState(null)
    const [registerer, setRegisterer] = useState(null)
    const [currentSession, setCurrentSession] = useState(null)

    const userName = '1001'
    const password = '1001'
    const server = `wss://192.168.144.152:8089/ws`
    const uri = UserAgent.makeURI(`sip:${userName}@192.168.144.152`)

    const transportOptions = {
        server
    }

    const userAgentOptions: UserAgentOptions = {
        authorizationPassword: userName,
        authorizationUsername: password,
        transportOptions,
        uri,
        viaHost: '192.168.144.152',
        logLevel: "debug"
    }

    userAgentOptions.delegate = {
        onConnect() {
            setConnectionState(true)
            openMessage(`Device has been connected.`)
        },
        onDisconnect(error: Error) {
            setConnectionState(false)
            openMessage(`Device has been disconnected with error: ${error}`)
        },
        onInvite(invitation: Invitation) {
            onIncomingCall(invitation)

            invitation.stateChange.addListener((state: SessionState) => {
                console.log(`Incoming Session state changed to ${state}`);
                switch (state) {
                    default:
                        throw new Error("Unknown session state.")
                    case SessionState.Initial:
                    case SessionState.Establishing:
                        setCallStateText("CONNECTING")
                        break
                    case SessionState.Established:
                        setCallStateText("CONNECTED")
                        setupRemoteMedia(invitation)
                        break
                    case SessionState.Terminating:
                    case SessionState.Terminated:
                        setCallStateText("DISCONNECTED")
                        cleanupMedia()
                        onIncomingPartyHangup()
                        break

                }
            })
        },
    }

    const registerStateChange = (state: RegistererState) => {
        console.log(`Registerer state changed to ${state}`)
        switch (state) {
            case RegistererState.Initial:
            case RegistererState.Terminated:
            default:
                break
            case RegistererState.Registered:
                setRegistrationState(true)
                openMessage(`Phone has been registered.`)
                break
            case RegistererState.Unregistered:
                setRegistrationState(false)
                openMessage(`Phone has been unregistered.`)
        }
    }


    useEffect(() => {
        setUserAgent(new UserAgent(userAgentOptions))
        return () => {
            if(userAgent) {
                userAgent.stateChange.removeAllListeners()
            }

            if(registerer) {
                registerer.stateChange.removeAllListeners()
            }

            if(currentSession) {
                currentSession.stateChange.removeAllListeners()
            }
        }
    }, [])

    useEffect(() => {
        if(userAgent !== null) {
            userAgent.start()
                .then(() => setRegisterer(new Registerer(userAgent)))
                .catch(error => {
                    console.log(error)
                    openMessage(error.message)
                })
        }
    }, [userAgent])

    /** End user agent settings **/

    useEffect(() => {
        if(callState) {
            //startTimer()
        } else {
            //stopAndResetTimer()
        }
    }, [callState])

    const openMessage = (content) => {
        message.info({
            content: content,
            duration: 2,
            key: 'updatable'
        })
    }

    const onHoldClick = () => {
        if(!holdState) {
            hold(currentSession)
            setHoldState(true)
        } else {
            unhold(currentSession)
            setHoldState(false)
        }
    }

    const onMuteClick = () => {
        setMuteState(!muteState)
        let pc = currentSession.sessionDescriptionHandler.peerConnection
        // Get local tracks
        let senders = pc.getSenders()
        if(senders.length) {
            senders.forEach((sender) => {
                if(sender.track) {
                    sender.track.enabled = muteState
                }
            })
        }
    }

    const onIncomingCall = (session: Invitation) => {
        setCurrentSession(session)
        setIncomingCall(true)
        incomingRing.current.play()
    }

    const onIncomingReject = () => {
        setIncomingCall(false)
        setCurrentSession(null)
        endCall(currentSession)
        incomingRing.current.pause()
    }

    const onIncomingAccept = () => {
        if(currentSession instanceof Invitation) {
            let options: InvitationAcceptOptions = {
                sessionDescriptionHandlerOptions: {
                    iceGatheringTimeout: 1
                }
            }
            currentSession.accept(options)
                .then(openMessage(`Call has been accepted.`))
        }
        setCallState(true)
        setIncomingCall(false)
        incomingRing.current.pause()
    }

    const onIncomingPartyHangup = () => {
        setCallState(false)
        setMuteState(false)
        setHoldState(false)
        setOutgoingNumber('')
    }

    const onOutgoingCall = () => {
        if(!isNaN(outgoingNumber) && outgoingNumber.length !== 0 && registrationState && connectionState) {
            // Outgoing Call

            const target = UserAgent.makeURI(`sip:${outgoingNumber}@192.168.144.152`)
            const inviter = new Inviter(userAgent, target, {
                sessionDescriptionHandlerOptions: {
                    iceGatheringTimeout: 1
                }
            })
            setCurrentSession((inviter: Session))

            inviter.stateChange.addListener((state: SessionState) => {
                console.log(`Session state changed to ${state}`)
                switch (state) {
                    default:
                        throw new Error(`Unknown session state: ${state}`)
                    case SessionState.Initial:
                    case SessionState.Establishing:
                        break
                    case SessionState.Established:
                        setCallState(true)
                        setupRemoteMedia(inviter)
                        openMessage(`Connected with ${inviter.remoteIdentity.uri.user}`)
                        break
                    case SessionState.Terminating:
                    case SessionState.Terminated:
                        cleanupMedia()
                        onOutgoingPartyHangup()
                        break
                }
            })

            //openMessage(`Dialing out number ${outgoingNumber}...`)
            inviter.invite()
                .then((request: OutgoingInviteRequest) => {

                }).catch(e => {
                    console.log(e)
                    openMessage(`Error dialing number: ${e.message}`)
                })

        } else {
            openMessage(`Invalid number entered...`)
        }
    }

    const onOutgoingHangup = () => {
        setCallState(false)
        setMuteState(false)
        setHoldState(false)
        endCall(currentSession)
        setOutgoingNumber('')
    }

    const onOutgoingPartyHangup = () => {
        setCallState(false)
        setMuteState(false)
        setHoldState(false)
        setOutgoingNumber('')
    }


    const registerPhone = () => {
        if(registrationState) {
            registerer.unregister()
                .catch(error => {
                    openMessage(error.message)
                    console.log(error.message)
                })
        } else {
            registerer.register()
                .then(() => registerer.stateChange.addListener(registerStateChange))
                .catch(error => console.log(error))
        }
    }

    const setupRemoteMedia = (session: Session) => {
        session.sessionDescriptionHandler.peerConnection.getReceivers().forEach(receiver => {
            if(receiver.track) {
                remoteStream.addTrack(receiver.track)
            }
        })
        mediaElement.current.srcObject = remoteStream
        mediaElement.current.play()
    }

    const cleanupMedia = () => {
        if(mediaElement !== null) {
            mediaElement.current.srcObject = null
            mediaElement.current.pause()
        }
    }

    const endCall = (session: Session) => {
        switch (session.state) {
            default:
            case SessionState.Terminating:
            case SessionState.Terminated:
                break
            case SessionState.Initial:
            case SessionState.Establishing:
                if(session instanceof Inviter) {
                    session.cancel()
                        .then(() => openMessage(`Call to ${session.remoteIdentity.uri.user} has been canceled.`))
                        .catch(error => {
                            openMessage(`Error hanging up call: ${error.message}`)
                            console.log(error)
                        })
                } else if (session instanceof Invitation) {
                    session.reject()
                        .then(() => openMessage(`Call from ${session.remoteIdentity.uri.user} has been rejected.`))
                        .catch(error => {
                            openMessage(`Error hanging up call: ${error.message}`)
                            console.log(error)
                        })
                }
                break
            case SessionState.Established:
                session.bye()
                    .then(() => openMessage(`Call has been hanged up.`))
                    .catch(error => openMessage(`Error hanging up call: ${error.message}`))
                break
        }
    }

    const hold = (session: Session) => {
        const options: SessionInviteOptions = {
            sessionDescriptionHandlerModifiers: [Web.holdModifier]
        }

        if (session) {
            session.invite(options);
        }
    }

    const unhold = (session: Session) => {
        const options: SessionInviteOptions = {
            sessionDescriptionHandlerModifiers: []
        }

        if (session) {
            session.invite(options);
        }
    }

    return(
        <>
            <Row gutter={[0, 20]}>
                <Col span={8} offset={8}>
                    <Row justify={"center"}>
                        <Col span={12}>
                            <div className="digital-clock">
                                <Clock />
                            </div>
                        </Col>
                        <Col span={12} style={{textAlign: "right"}}>
                            <Button type="primary" onClick={registerPhone} icon={<SettingTwoTone spin />} danger={registrationState} shape="round">{!registrationState ? 'Register' : 'Unregister'}</Button>
                        </Col>
                    </Row>
                </Col>
                <Col span={8} offset={8}>
                    <Row>
                        <Col span={8}>
                            <Tooltip title={registrationState ? 'Device is Connected' : 'Device is Disconnected'} color={connectionState ? 'green' : 'red'}>
                                <Badge status={connectionState ? "success" : "error"} text={<span style={{color: connectionState ? '#4CAF50' : '#D32F2F', textDecoration: "underline", fontSize: '10px'}}>{connectionState ? CONNECTED : DISCONNECTED}</span>} />
                            </Tooltip>
                        </Col>
                        <Col style={{textAlign: "right"}} span={8} offset={8}>
                            <Tooltip title={registrationState ? 'Phone is Registered' : 'Phone is Unregistered'} color={registrationState ? 'green' : 'red'}>
                                <Badge status={registrationState ? "success" : "error"} text={<span style={{color: registrationState ? '#4CAF50' : '#D32F2F', textDecoration: "underline", fontSize: '10px'}}>{registrationState ? REGISTERED : UNREGISTERED}</span>} />
                            </Tooltip>
                        </Col>
                    </Row>
                </Col>
                <Col span={8} offset={8}>
                    <audio ref={incomingRing} src={ring} loop />
                    <audio ref={mediaElement} id="mediaElement" />
                    {incomingCall ? <Alert
                        message={`You have an Incoming Call from ${outgoingNumber}`}
                        showIcon={true}
                        icon={<PhoneOutlined />}
                        type={"success"}
                        description={
                            <div>
                                <Button icon={<CheckCircleOutlined />} onClick={onIncomingAccept} type="primary">Accept</Button>
                                <Button icon={<CloseCircleOutlined />} onClick={onIncomingReject} type={"danger"}>Reject</Button>
                            </div>
                        }
                    /> : ''}
                    <Input value={outgoingNumber} onChange={(e) => setOutgoingNumber(e.target.value)} size="large" placeholder="Enter Number" prefix={<PhoneOutlined />} />
                </Col>
                <Col style={{textAlign: "center"}} span={8} offset={8}>
                    <div>
                        {callState ? '00:00:00' : '' }
                    </div>
                </Col>
                <Col style={{textAlign: "center"}} span={8} offset={8}>

                        <AnimateKeyframes
                            play
                            keyframes={[
                                { 0: 'opacity: 0' }, // 0%
                                { 50: 'opacity: 0.5' }, // 50%
                                { 100: 'opacity: 1' } // 100%
                            ]}
                            delay={1}
                            duration={1}
                            iterationCount="infinite"
                        >
                            <Space direction={"horizontal"}>
                                {holdState ? <SoundOutlined style={{color: '#E040FB', fontSize: '20px', fontWeight: 'bold'}} /> : ''}
                                {muteState ? <AudioMutedOutlined style={{color: '#D32F2F', fontSize: '20px', fontWeight: 'bold'}} /> : ''}
                            </Space>
                        </AnimateKeyframes>
                </Col>
                <Col style={{textAlign: "center"}} span={8} offset={8}>
                    {callState ? <Badge style={{backgroundColor: 'green'}} count={callStateText} /> : ''}
                </Col>
                {callState ? <Col style={{textAlign: "center"}} span={8} offset={8}>
                    <Row gutter={[5,0]} justify={"center"}>
                        <Col>
                            <Button type={holdState ? 'danger' : 'default'} onClick={onHoldClick} icon={<SoundOutlined />} size={"small"}>HOLD</Button>
                        </Col>
                        <Col>
                            <Button type={muteState ? 'danger' : 'default'}  onClick={onMuteClick} icon={<AudioMutedOutlined />} size={"small"}>MUTE</Button>
                        </Col>
                    </Row>
                </Col> : ''}
                <Col style={{textAlign: "center"}} span={8} offset={8}>
                    <Row gutter={[5,0]} justify={"center"}>
                        <Col>
                            <Button onClick={onOutgoingCall} disabled={callState} icon={<PhoneOutlined />} type={"primary"} size={"large"}>Dial</Button>
                        </Col>
                        <Col>
                            <Button onClick={onOutgoingHangup} icon={<CloseSquareOutlined />} type={"danger"} size={"large"}>Hangup</Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    )
}

export default Dashboard
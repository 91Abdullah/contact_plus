import React, {useState, useEffect, useRef} from "react"
import {
    Popover,
    Switch,
    Row,
    Col,
    Button,
    Space,
    Input,
    Tag,
    Typography,
    Avatar,
    notification,
    Modal,
    Select,
    Spin
} from "antd"
import {
    PhoneTwoTone,
    CheckCircleOutlined,
    AlertTwoTone, PauseCircleFilled,
    AudioMutedOutlined
} from "@ant-design/icons"
import { FaHeadset, FaVolumeMute } from "react-icons/fa"
import KeyboardEventHandler from 'react-keyboard-event-handler'
import soundOne from "../1.wav"
import soundTwo from "../2.wav"
import soundThree from "../3.wav"
import soundFour from "../4.wav"
import soundFive from "../5.wav"
import soundSix from "../6.wav"
import soundSeven from "../7.wav"
import soundEight from "../8.wav"
import soundNine from "../9.wav"
import soundZero from "../0.wav"
import soundStar from "../star.wav"
import soundHash from "../p.wav"
import ring from "../ring.mp3"
import {
    Invitation, InvitationAcceptOptions, Inviter, Referral,
    Registerer,
    RegistererState,
    Session, SessionInviteOptions, SessionState,
    UserAgent,
    UserAgentDelegate,
    UserAgentOptions, Web
} from "sip.js"
import {useDispatch, useSelector} from "react-redux"
import {loginAgent, logoutAgent, notReadyAgent, readyAgent} from "../redux/agentActions";
import QueueStats from "../components/QueueStats"
import KeyPad from "../components/KeyPad"
import {workcode} from "../redux/workcode";

const marginStyles = {
    marginBottom: '10px'
}

export default function Softphone(props) {

    // Audio Files
    const audios = [new Audio(soundZero),new Audio(soundOne),new Audio(soundTwo),new Audio(soundThree),new Audio(soundFour),new Audio(soundFive),new Audio(soundSix),new Audio(soundSeven),new Audio(soundEight),new Audio(soundNine),new Audio(soundHash),new Audio(soundStar)]
    /*const incomingRing = new Audio(ring)*/
    const [incomingRing] = useState(new Audio(ring))

    const dispatch = useDispatch()
    const agent = useSelector(state => state.agent)
    const stats = useSelector(state => state.stats)
    const options = agent.reasons.map(value => (value.name))
    const workcode = useSelector(state => state.workcode)
    /*const workcodes = workcode.workcode.map(value => value.name)*/

    // Number of times to attempt reconnection before giving up
    const reconnectionAttempts = 3;
// Number of seconds to wait between reconnection attempts
    const reconnectionDelay = 4;

// Used to guard against overlapping reconnection attempts
    let attemptingReconnection = false;
// If false, reconnection attempts will be discontinued or otherwise prevented
    let shouldBeConnected = true;

// Function which recursively attempts reconnection
    const attemptReconnection = (reconnectionAttempt = 1): void => {
        // If not intentionally connected, don't reconnect.
        if (!shouldBeConnected) {
            return;
        }

        // Reconnection attempt already in progress
        if (attemptingReconnection) {
            return;
        }

        // Reconnection maximum attempts reached
        if (reconnectionAttempt > reconnectionAttempts) {
            return;
        }

        // We're attempting a reconnection
        attemptingReconnection = true;

        setTimeout(() => {
            // If not intentionally connected, don't reconnect.
            if (!shouldBeConnected) {
                attemptingReconnection = false;
                return;
            }
            // Attempt reconnect
            userAgent.reconnect()
                .then(() => {
                    // Reconnect attempt succeeded
                    attemptingReconnection = false;
                })
                .catch((error: Error) => {
                    // Reconnect attempt failed
                    attemptingReconnection = false;
                    attemptReconnection(++reconnectionAttempt);
                });
        }, reconnectionAttempt === 1 ? 0 : reconnectionDelay * 1000);
    };

    useEffect(() => {
        const onlineListener = () => {
            attemptReconnection();
        }

        // Monitor network connectivity and attempt reconnection when browser goes online
        window.addEventListener("online", onlineListener);

        return () => window.removeEventListener("online", onlineListener)
    }, [])

    const userAgentDelegate: UserAgentDelegate = {
        onConnect() {
            setConnection(true)
            openNotificationWithIcon("success", "UA has been connected")
        },
        onDisconnect(error?: Error) {
            setConnection(false)
            openNotificationWithIcon("error", "UA has been disconnected")

            // On disconnect, cleanup invalid registrations
            registerer.unregister()
                .catch((e: Error) => {
                    // Unregister failed
                });
            // Only attempt to reconnect if network/server dropped the connection (if there is an error)
            if (error) {
                attemptReconnection();
            }
        },
        onRegister(registration) {
            console.log(registration)
            openNotificationWithIcon("success", "UA has been registered")
        },
        onInvite(invitation: Invitation) {

            console.info('Incoming call')
            setIncomingSession(invitation)
            setIncomingCall(true)
            setIncomingNumber(invitation.remoteIdentity.uri.user)

            // Setup incoming session delegate
            invitation.delegate = {
                // Handle incoming REFER request.
                onRefer(referral: Referral): void {
                    // ...
                },
            };

            // Handle incoming session state changes.
            invitation.stateChange.addListener((newState: SessionState) => {
                switch (newState) {
                    case SessionState.Establishing:
                        // Session is establishing.
                        break;
                    case SessionState.Established:
                        // Session has been established.
                        console.info('Session is established')
                        setIncomingCall(false)
                        setOnCall(true)
                        setCallStatus("CALL CONNECTED")
                        setupRemoteMedia(invitation)
                        break;
                    case SessionState.Terminated:
                        // Session has terminated.
                        console.info('Session has terminated')
                        setIncomingCall(false)
                        setOnCall(false)
                        setIncomingNumber('')
                        setIncomingSession(false)
                        setCallStatus("CALL DISCONNECTED")
                        cleanupMedia()
                        break;
                    default:
                        break;
                }
            });

            // Handle incoming INVITE request.
            let constrainsDefault: MediaStreamConstraints = {
                audio: true,
                video: false,
            }

            const options: InvitationAcceptOptions = {
                sessionDescriptionHandlerOptions: {
                    constraints: constrainsDefault,
                },
            }

            Modal.confirm({
                title: "Incoming call",
                icon: <PhoneTwoTone />,
                content: invitation.remoteIdentity.uri.user,
                okText: "Accept",
                cancelText: "Reject",
                onOk: () => {
                    invitation.accept(options)
                },
                onCancel: () => {
                    invitation.reject()
                }
            })
        }
    }

    const registererState = (state: RegistererState) => {
        switch (state) {
            default:
                break
            case RegistererState.Registered:
                setRegister(true)
                openNotificationWithIcon("success", "UA has been registered")
                break
            case RegistererState.Unregistered:
                setRegister(false)
                openNotificationWithIcon("error", "UA has been unregistered")
                break
        }
    }

    const [server, setServer] = useState(null)

    const [userName, setUserName] = useState(null)
    const [userType, setUserType] = useState(null)
    const [name, setName] = useState(null)

    const [userAgent, setUserAgent] = useState(null)
    const [registerer, setRegisterer] = useState(null)

    // Set Agent Mode
    const [agentMode, setAgentMode] = useState(false)
    const [blendMode, setBlendMode] = useState(false)

    useEffect(() => {
        if(props.system.settings && props.user.user) {
            setServer(props.system.settings.server_address)
            setName(props.user.user.name)
            setUserName(props.user.user.auth_username)
            setUserType(props.user.user.type)
            setAgentMode(props.user.user.type === "Inbound")
            setBlendMode(props.user.user.type === "Blended")

            const userAgent = new UserAgent({
                authorizationUsername: props.user.user.auth_username,
                authorizationPassword: props.user.user.auth_password,
                transportOptions: {
                    server: `wss://${props.system.settings.server_address}:${props.system.settings.wss_port}/ws`
                },
                uri: UserAgent.makeURI(`sip:${props.user.user.auth_username}@${props.system.settings.server_address}`),
                delegate: userAgentDelegate,
                logLevel: "error"
            })

            const registerer = new Registerer(userAgent)

            setUserAgent(userAgent)
            setRegisterer(registerer)

            console.log('Registering UA...')
            userAgent.start()
            registerer.stateChange.addListener(registererState)
        }
        return () => {
            if(registerer) {
                registerer.stateChange.removeListener(registererState)
            }
        }
    }, [props.system.settings, props.user.user])

    /*const server = "192.168.144.152"
    const wss_port = "8089"*/

    /*const userName = "1001"
    const secret = "1001"
    const uri = UserAgent.makeURI(`sip:${userName}@${server}`)
    const name = "Abdullah Basit"
    const userType = "Blended"*/

    /*const transportOptions = {
        server: `wss://${server}:${wssPort}/ws`
    }*/

    /*const userAgentOptions: UserAgentOptions = {
        authorizationUsername: userName,
        authorizationPassword: secret,
        transportOptions,
        uri,
        delegate: userAgentDelegate,
        logLevel: "error"
    }*/

    /*useEffect(() => {
        console.log('UA and registerer')
        if(userAgent && registerer) {
            userAgent.start()
            registerer.stateChange.addListener(registererState)
        }
        return () => {
            if(registerer) {
                registerer.stateChange.removeListener(registererState)
            }
        }
    }, [])*/

    // Phone methods
    const registerPhone = () => {
        if(registerer.state === RegistererState.Registered) {
            registerer.unregister()
                .then(r => {
                    console.info("UA unregistered")
                    if(agentMode || blendMode)
                        dispatch(logoutAgent())
                })
        } else {
            registerer.register()
                .then(r => {
                    console.info("UA registered")
                    if(agentMode || blendMode) {
                        dispatch(loginAgent())
                    }
                })
        }
    }

    // Not Ready option select
    let optionValue = ''

    // Register & Socket
    const [register, setRegister] = useState(false)
    const [connection, setConnection] = useState(false)

    // Call Status
    const [onCall, setOnCall] = useState(false)
    const [callStatus, setCallStatus] = useState('DISCONNECTED')

    // Incoming Call
    const [incomingCall, setIncomingCall] = useState(false)
    const [incomingNumber, setIncomingNumber] = useState('')
    const [incomingSession, setIncomingSession] = useState(false)

    // Outgoing Call
    const [outgoingCall, setOutgoingCall] = useState(false)
    const [outgoingNumber, setOutgoingNumber] = useState('')
    const [outgoingSession, setOutgoingSession] = useState(false)

    // Hold & Mute
    const [onHold, setOnHold] = useState(false)
    const [onMute, setOnMute] = useState(false)

    // Input number
    const [inputNumber, setInputNumber] = useState('')

    // Timer
    const [timer, setTimer] = useState('00:00:00')
    const [intervalId, setIntervalId] = useState(null)

    // Media Element
    const mediaElement = useRef()
    const [remoteStream] = useState(new MediaStream())

    const setupRemoteMedia = (session: Session) => {
        session.sessionDescriptionHandler.peerConnection.getReceivers()
            .forEach((receiver) => {
            if (receiver.track) {
                remoteStream.addTrack(receiver.track);
            }
        });
        mediaElement.current.srcObject = remoteStream;
        mediaElement.current.play();
    }

    const cleanupMedia = () => {
        mediaElement.current.srcObject = null
        mediaElement.current.pause()
    }

    // play audio sound
    const playSound = (item) => {
        audios[item].play();
    }

    const startRing = () => {
        incomingRing.loop = true
        incomingRing.play()
    }

    // stop audio sound
    const stopRing = () => {
        incomingRing.pause()
        incomingRing.currentTime = 0
    }

    // load audio file on component load
    useEffect(() => {
        audios.forEach((value, index) => {
            value.load()
            value.loop = false
        })
        incomingRing.load()
        incomingRing.loop = true
    }, [])

    useEffect(() => {
        if(onCall) {
            let SECONDS = 0
            const id = setInterval(() => {
                SECONDS++;
                setTimer(new Date(SECONDS * 1000).toISOString().substr(11, 8))
            }, 1000)
            setIntervalId(id)
        } else {
            clearInterval(intervalId)
        }
        return () => clearInterval(intervalId)
    }, [onCall])

    useEffect(() => {
        if(incomingCall) {
            startRing()
        } else {
            stopRing()
            Modal.destroyAll()
        }
        /*return () => Modal.destroyAll()*/
    }, [incomingCall])

    /*useEffect(() => {
        if(blendMode) {
            if(!receiveIncoming) {
                userAgent.delegate.onInvite = (invitation: Invitation) => {
                    invitation.reject()
                }
            } else {
                userAgent.delegate.onInvite = userAgentDelegate.onInvite
            }
        }
    }, [receiveIncoming])*/

    const openNotificationWithIcon = (type, message) => {
        notification[type]({
            message: 'Notification',
            description: message
        });
    };

    const onDialClick = () => {
        const currentSession = incomingSession || outgoingSession
        if(currentSession) {
            if(currentSession instanceof Inviter && currentSession.state === SessionState.Establishing) {
                currentSession.cancel()
            } else if (currentSession instanceof Invitation && currentSession.state === SessionState.Established) {
                currentSession.bye()
            } else {
                currentSession.bye()
            }
        } else if (!agentMode) {
            // Dial outbound call
            const target = UserAgent.makeURI(`sip:${inputNumber}@${server}`)
            const inviter = new Inviter(userAgent, target)

            inviter.stateChange.addListener((state: SessionState) => {
                console.log(`Session state changed to ${state}`);
                switch (state) {
                    case SessionState.Initial:
                        break;
                    case SessionState.Establishing:
                        break;
                    case SessionState.Established:
                        setCallStatus("CALL CONNECTED")
                        setupRemoteMedia(inviter)
                        break;
                    case SessionState.Terminating:
                    // fall through
                    case SessionState.Terminated:
                        Modal.destroyAll()
                        setOutgoingCall(false)
                        setOnCall(false)
                        setOutgoingNumber('')
                        setOutgoingSession(false)
                        setCallStatus("CALL DISCONNECTED")
                        cleanupMedia()
                        break;
                    default:
                        throw new Error("Unknown session state.")
                }
            })

            inviter.invite()
            setOutgoingSession(inviter)
            setOutgoingCall(true)
            setOnCall(true)
        }
    }

    const onKeyPadClick = (item) => {
        switch (item) {
            default:
                break
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "0":
                playSound(item)
                setInputNumber(inputNumber + item)
                break
            case "*":
                playSound(11)
                setInputNumber(inputNumber + item)
                break
            case "#":
                playSound(10)
                setInputNumber(inputNumber + "#")
                break
        }
    }

    const onKeyPress = (key, event) => {
        switch (key) {
            default:
                break
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "0":
                playSound(key)
                if(event.target === document.getElementsByTagName('body')[0]) {
                    setInputNumber(inputNumber + key)
                }
                break
            case "shift+8":
            case "*":
                playSound(11)
                if(event.target === document.getElementsByTagName('body')[0]) {
                    setInputNumber(inputNumber + "*")
                }
                break
            case "shift+3":
                playSound(10)
                if(event.target === document.getElementsByTagName('body')[0]) {
                    setInputNumber(inputNumber + "#")
                }
                break
            case "backspace":
                if(event.target === document.getElementsByTagName('body')[0]) {
                    setInputNumber(inputNumber.slice(0, -1))
                }
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

    const onHoldClick = () => {
        if(!onHold) {
            if(incomingSession) {
                hold(incomingSession)
            } else if (outgoingSession) {
                hold(outgoingSession)
            }
            setOnHold(true)
        } else {
            if(incomingSession) {
                unhold(incomingSession)
            } else if (outgoingSession) {
                unhold(outgoingSession)
            }
            setOnHold(false)
        }
    }

    const onMuteClick = () => {
        setOnMute(!onMute)
        const currentSession = incomingSession || outgoingSession
        let pc = currentSession.sessionDescriptionHandler.peerConnection
        // Get local tracks
        let senders = pc.getSenders()
        if(senders.length) {
            senders.forEach((sender) => {
                if(sender.track) {
                    sender.track.enabled = onMute
                }
            })
        }
    }

    const onPause = () => {
        if(agent.isReady) {
            Modal.confirm({
                title: "Specify Reason",
                centered: true,
                content: (
                    <Select onSelect={value => optionValue = value} style={{width: '100%'}} defaultValue={options[0]}>
                        {options.map((value, index) => (
                            <Select.Option value={value} key={index}>{value}</Select.Option>
                        ))}
                    </Select>
                ),
                onOk: () => {
                    dispatch(notReadyAgent(optionValue))
                },
                onCancel: () => {
                    // Do Nothing
                }
            })
        } else {
            dispatch(readyAgent())
        }
    }

    /*const onCallDisconnect = () => {
        Modal.confirm({
            title: "Specify Workcode",
            centered: true,
            content: (
                <Select>
                    {workcodes.map((value, index) => (
                        <Select.Option value={value} key={index}>{value}</Select.Option>
                    ))}
                </Select>
            ),
            onOk: () => {

            },
            onCancel: () => {

            }
        })
    }*/

    return(
        <Spin spinning={agent.isLoading}>
            <KeyboardEventHandler
                handleKeys={['0', '1', '2', '3' ,'4', '5', '6', '7', '8', '9', 'shift+3', '*', 'shift+8', 'backspace']}
                onKeyEvent={onKeyPress}
                handleFocusableElements={true}
            />
            <Row gutter={20}>
                <Col xs={24} lg={8} style={marginStyles}>
                    <QueueStats title="Queue Stats" stats={stats.status[0]} />
                </Col>
                <Col style={marginStyles} xs={24} lg={{span: 8}}>
                    <Row align={"middle"} style={{marginBottom: 10}} justify={"space-between"}>
                        <Col>
                            <Button size="small" onClick={onPause} danger={agent.isReady || (stats.status[1] && stats.status[1] === 'No')} type="primary" shape={"round"} icon={<PauseCircleFilled />}>{!agent.isReady || (stats.status[1] && stats.status[1]['Paused'] === 'Yes') ? `Ready` : `Not-Ready`}</Button>
                        </Col>
                        <Col>
                            <Button size="small" onClick={registerPhone} danger={!register} type="primary" shape="round" icon={<AlertTwoTone twoToneColor="#52c41a" />}>
                                {register ? "Unregister" : "Register"}
                            </Button>
                        </Col>
                    </Row>
                    <div style={{marginBottom: 10}}>
                        <Tag icon={<CheckCircleOutlined />} color={connection ? "success" : "error"}>
                            {connection ? "connected" : "disconnected"}
                        </Tag>
                        <Tag style={{float: "right", marginRight: '0px'}} icon={<CheckCircleOutlined />} color={register ? "success" : "error"}>
                            {register ? "registered" : "unregistered"}
                        </Tag>
                    </div>
                    <div style={{marginBottom: 10}}>
                        <Typography.Text keyboard strong>{name}</Typography.Text>
                        <Typography.Text strong style={{float: 'right'}} keyboard>{userName}</Typography.Text>
                    </div>
                    {onCall && <>
                        <Row style={{marginBottom: 10}} gutter={[10, 0]} justify={"center"}>
                            <Col>
                                <Tag color={onCall ? "success" : "error"}>
                                    {callStatus}
                                </Tag>
                            </Col>
                        </Row>
                        <Row style={{marginBottom: 10}} gutter={[5, 10]} justify={"center"}>
                            <Typography.Text code strong>{timer}</Typography.Text>
                        </Row>
                    </>}
                    {onHold || onMute ? <Row style={{marginBottom: 10}} gutter={[5, 10]} justify={"center"}>
                        {onHold && <Col><Avatar icon={<FaVolumeMute />} size={"large"} /></Col>}
                        {onMute && <Col><Avatar icon={<FaHeadset />} size={"large"} /></Col>}
                    </Row> : ''}
                    <Row justify={"center"}>
                        <Col style={{marginBottom: 10}} lg={24}>
                            <Input disabled={onCall || agentMode} onChange={event => setInputNumber(event.target.value)} value={inputNumber || incomingNumber} autoFocus size="large" placeholder="Phone Number Here" prefix={<PhoneTwoTone />} />
                        </Col>
                        <Col>
                            <audio ref={mediaElement} />
                            <KeyPad agentMode={agentMode} onHold={onHold} onMute={onMute} onMuteClick={onMuteClick} onHoldClick={onHoldClick} onKeyPadClick={onKeyPadClick} onDialClick={onDialClick} onCall={onCall} />
                        </Col>
                    </Row>
                </Col>
                <Col xs={24} lg={8}>
                    <QueueStats title="Agent Stats" stats={stats.status[1]} />
                </Col>
            </Row>
        </Spin>
    )
}
import {Button, Row, Space} from "antd";
import {AudioMutedOutlined, PauseCircleFilled, PhoneTwoTone} from "@ant-design/icons";
import React from "react";

const KeyPad = (props) => {

    const onCall = props.onCall
    const onKeyPadClick = props.onKeyPadClick
    const onMuteClick = props.onMuteClick
    const onHoldClick = props.onHoldClick
    const onHold = props.onHold
    const onMute = props.onMute
    const agentMode = props.agentMode

    return(
        <Space direction={"vertical"}>
            {!agentMode && <>
                <Row>
                    <Space size={20} direction={"horizontal"}>
                        {['1', '2', '3'].map((item, key) => (
                            <Button onClick={() => onKeyPadClick(item)} key={key} size={"large"} type={"primary"}
                                    shape={"circle-outline"}>{item}</Button>
                        ))}
                    </Space>
                </Row>
                <Row>
                    <Space size={20} direction={"horizontal"}>
                        {['4', '5', '6'].map((item, key) => (
                            <Button onClick={() => onKeyPadClick(item)} key={key} size={"large"} type={"primary"}
                                    shape={"circle-outline"}>{item}</Button>
                        ))}
                    </Space>
                </Row>
                <Row>
                    <Space size={20} direction={"horizontal"}>
                        {['7', '8', '9'].map((item, key) => (
                            <Button onClick={() => onKeyPadClick(item)} key={key} size={"large"} type={"primary"}
                                    shape={"circle-outline"}>{item}</Button>
                        ))}
                    </Space>
                </Row>
                <Row>
                    <Space size={20} direction={"horizontal"}>
                        {['#', '0', '*'].map((item, key) => (
                            <Button onClick={() => onKeyPadClick(item)} key={key} size={"large"} type={"primary"}
                                    shape={"circle-outline"}>{item}</Button>
                        ))}
                    </Space>
                </Row>
            </>}
            <Row justify={"center"}>
                <Space size={20} direction={"horizontal"}>
                    <Button onClick={onMuteClick} disabled={!onCall} icon={<AudioMutedOutlined />} shape={"circle"} size={"large"} type={onMute ? "danger" : "primary"} />
                    <Button onClick={props.onDialClick} style={{backgroundColor: !onCall ? '#4CAF50' : '#FF5252' }} shape={"circle"} icon={<PhoneTwoTone twoToneColor={!onCall ? "#4CAF50" : '#FF5252' }/>} size={"large"} />
                    <Button onClick={onHoldClick} disabled={!onCall} icon={<PauseCircleFilled />} shape={"circle"} size={"large"} type={onHold ? "danger" : "primary"} />
                </Space>
            </Row>
        </Space>
    )
}

export default KeyPad
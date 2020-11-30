import React, {useEffect} from "react"
import {Form, Input, Modal, Select} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {sendOutboundWorkCode, sendWorkcode} from "../redux/agentActions";

export const WorkcodeForm = ({setVisible, visible, channel, isOutbound, setIsOutbound}) => {

    const dispatch = useDispatch()
    const workcode = useSelector(state => state.workcode)
    const {workcodes} = workcode

    const onCreate = values => {
        if(isOutbound)
            dispatch(sendOutboundWorkCode(values.workcode, channel))
        else
            dispatch(sendWorkcode(values.workcode, channel))
        setVisible(false)
        setIsOutbound(false)
    }

    const [form] = Form.useForm();
    return (
        <Modal
            visible={visible && channel}
            title="Submit Work Code"
            okText="Create"
            centered={true}
            closable={false}
            onOk={() => {
                form
                    .validateFields()
                    .then(values => {
                        form.resetFields();
                        onCreate(values);
                    })
                    .catch(info => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form
                form={form}
                layout="horizontal"
                name="form_in_modal"
            >
                <Form.Item
                    name="workcode"
                    label="Workcode"
                    rules={[{ required: true, message: 'Please input the workcode!' }]}
                >
                    <Select>
                        {workcodes.map((value, index) => (
                            <Select.Option key={value.id} value={value.name}>{value.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )
}
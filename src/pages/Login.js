import React, {useEffect, useState} from 'react'
import {connect} from "react-redux";
import {loginUser} from "../redux/userActions";
import {useHistory} from 'react-router-dom'
import {Form, Input, Button, Checkbox, Result} from "antd";

const mapDispatchToProps = dispatch => ({
    loginUser: (username, password) => dispatch(loginUser(username, password))
})

const mapStateToProps = state => {
    return {
        user: state.user
    }
}

const layout = {
    labelCol: {
        span: 8,
    },
    wrapperCol: {
        span: 8,
    },
};
const tailLayout = {
    wrapperCol: {
        offset: 8,
        span: 16,
    },
};

const Login = (props) => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    let history = useHistory();

    const handleSubmit = (event) => {
        event.preventDefault()
        props.loginUser(username, password)
    }

    const onFinish = values => {
        console.log('Success:', values);
        props.loginUser(values.username, values.password)
    };

    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };

    useEffect(() => {
        setError(props.user.errMess)
    }, [props.user.errMess])

    useEffect(() => {
        if(props.user.loggedIn) {
            setUsername('')
            setPassword('')
            history.push("/dashboard")
        } else {
            console.log('what the hell')
        }
    }, [props.user.loggedIn])

    return (

        <Form
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
        >
            {props.user.errMess ? <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
            /> : ''}
            <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item {...tailLayout} name="remember" valuePropName="checked">
                <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>

    );
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
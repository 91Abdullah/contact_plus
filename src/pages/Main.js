import React, {useEffect, useState} from "react"
import {Redirect, Route, Switch, Link, useLocation} from "react-router-dom"
import Login from "./Login"
import Register from "./Register"
import {useDispatch, useSelector} from "react-redux"
import {getUser, logoutUser} from "../redux/userActions"
import { Layout, Menu, Breadcrumb, Button, Spin } from 'antd'
import Softphone from "./Softphone"
import {getSettings} from "../redux/systemActions";
import {fetchWorkcodes} from "../redux/workcodeActions";

function Main() {

    const { Header, Content, Footer } = Layout;

    const user = useSelector(state => state.user)
    const system = useSelector(state => state.system)
    const dispatch = useDispatch()
    let location = useLocation()

    const handleLogout = () => {
        dispatch(logoutUser())
    }

    useEffect(() => {
        if(user.loggedIn) {
            console.log('happening')
            dispatch(getSettings())
            dispatch(fetchWorkcodes())
        }
    }, [user.loggedIn])

    return(

        <Layout className="layout">
            <Header hasSider={false} style={{backgroundColor: '#fff'}}>
                {/*<div className="logo" />*/}
                <Menu inlineCollapsed={false} theme="light" mode="horizontal" defaultSelectedKeys={['1']} selectedKeys={[location.pathname]}>
                    <Menu.Item>
                        <Link to={"/"}>
                            <div className="logo" />
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="/sign-in">
                        <Link to="/sign-in">Login</Link>
                    </Menu.Item>
                    {/*<Menu.Item key="/sign-up">
                        <Link to="/sign-up">Register</Link>
                    </Menu.Item>*/}
                    <Menu.Item key="/dashboard">
                        <Link to="/dashboard">App</Link>
                    </Menu.Item>
                    <Menu.Item key="/logout">
                       <Button type={"link"} onClick={handleLogout}>Logout</Button>
                    </Menu.Item>
                </Menu>
            </Header>
            <Content style={{ padding: '0 10px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>App</Breadcrumb.Item>
                    <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                </Breadcrumb>
                <Spin spinning={user.isLoading || system.isLoading}>
                    <div className="site-layout-content">
                        <Switch>
                            <Route exact path='/' component={Login} />
                            <Route path="/sign-in" component={Login} />
                            {/*<Route path="/sign-up" component={Register} />*/}
                            <PrivateRoute path="/dashboard">
                                <Softphone user={user} system={system} />
                            </PrivateRoute>
                        </Switch>
                    </div>
                </Spin>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Contact Plus © 2020 Created by <a href="mailto:abdullah_basit@telecard.com.pk">Dev Team @ Telecard</a></Footer>
        </Layout>
    )
}

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {

    const user = useSelector(state => state.user)
    const [path] = useState("/sign-in")

    return (
        <Route
            {...rest}
            render={({ location }) =>
                user.loggedIn ? (
                    children
                ) : (
                    <Redirect
                        to={{
                            pathname: path,
                            state: { from: location }
                        }}
                    />
                )
            }
        />
    );
}

export default Main
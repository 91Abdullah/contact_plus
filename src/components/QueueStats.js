import React, {useEffect} from "react"
import {Card, Spin, Statistic} from "antd"
import {fetchStatus} from "../redux/statsActions";
import {useDispatch, useSelector} from "react-redux";

const gridStyle = {
    width: '33%',
    textAlign: 'center',
}

function QueueStats(props) {

    const {stats, title} = props
    const dispatch = useDispatch()
    const nStats = useSelector(state => state.stats)

    return(
        <Spin size="large" spinning={nStats.isLoading}>
            <Card style={{textAlign: "center"}} title={title} bordered={false}>
                {stats && Object.keys(stats).map((key, index) => {
                    return <Card.Grid key={index} style={gridStyle}>
                        <Statistic formatter={value => (<span style={{fontSize: '12px'}}>{value}</span>)} title={key} value={stats[key]} />
                    </Card.Grid>
                })}
            </Card>
        </Spin>
    )
}

export default QueueStats
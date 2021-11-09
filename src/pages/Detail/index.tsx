import React from "react"
import { useHistory } from "react-router-dom"
import { List, Input, Button } from 'antd-mobile'
import { useConnect } from "@/lib/useRedux"


const Detail = () => {
    const history = useHistory()
    const [state] = useConnect((state) => {
        return {
            name: state.name,
            age: state.age,
            hobby: state.hobby,
        }
    })
    return (
        <div>
            <h2>详情页</h2>
            <List
                style={{
                    '--prefix-width': '6em',
                }}
            >
                <List.Item prefix='用户名'>
                    <Input value={state.name} readOnly />
                </List.Item>
                <List.Item prefix='年龄'>
                    <Input value={state.age} readOnly />
                </List.Item>
            </List>
            <br />
            <Button onClick={() => history.push('/')} color='primary'>前往首页</Button>
        </div>
    )
}

export default Detail

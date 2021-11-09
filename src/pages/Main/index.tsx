import React from 'react'
import { useHistory } from 'react-router-dom'
import { List, Input, Button } from 'antd-mobile'
import { useConnect } from '@/hooks/useRedux'

import style from './style.module.scss'




interface HomeProp { }

const Main: React.FC<HomeProp> = () => {

    const history = useHistory()

    const [state, dispatch] = useConnect(state => ({
        name: state.name,
        age: state.age
    }))

    return (
        <div className={style.body}>
            <h2>Main 页面</h2>
            <List
                style={{
                    '--prefix-width': '6em',
                }}
            >
                <List.Item prefix='用户名'>
                    <Input value={state.name} placeholder='请输入用户名' clearable onChange={val => dispatch({ type: 'setName', payload: val })} />
                </List.Item>
                <List.Item prefix='年龄'>
                    <Input value={state.age} placeholder='请输入年龄' clearable type='number' onChange={val => dispatch({ type: 'setAge', payload: val })} />
                </List.Item>
            </List>

            <Button onClick={() => history.push('/detail')} color='primary'>前往详情页</Button>
        </div>

    )
}


export default Main
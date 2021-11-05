import React from 'react'
import { useHistory } from 'react-router-dom'
import { Grid } from 'antd-mobile'

import Block from '@/components/Block'
import style from './style.module.scss'

interface ComponentItem {
    /** 组件名 */
    name: string
    /** 跳转路径 */
    path: string
}

interface ComponentGroup {
    /** 标题 */
    title: string
    /** 跳转路径 */
    children: ComponentItem[]
}

interface HomeProp {}

const Main: React.FC<HomeProp> = () => {

    const history = useHistory()

    const data: ComponentGroup[] = []

    return (
        <div className={style.body}>
            {data.map(group => (
                <Block title={group.title} key={group.title}>
                    <Grid columns={4}>
                        {group.children.map(child => (
                            <Grid.Item key={child.name}>
                                <span
                                    className={style.item}
                                    onClick={() => history.push(child.path)}>
                                    {child.name}
                                </span>
                            </Grid.Item>
                        ))}
                    </Grid>
                </Block>
            ))}
        </div>
    )
}

 
export default Main